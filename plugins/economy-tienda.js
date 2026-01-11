let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]

  if (!user.economy) initEconomy(user)

  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)

  // Items disponibles en la tienda
  const shopItems = {
    'pocion': {
      name: '🍶 Poción de Vida',
      price: 100,
      type: 'consumable',
      description: 'Restaura 50 WC cuando estés bajo',
      effect: 'heal'
    },
    'energia': {
      name: '⚡ Bebida Energética',
      price: 150,
      type: 'consumable',
      description: '+20% ganancias en tu próximo trabajo',
      effect: 'work_boost'
    },
    'loteria': {
      name: '🎫 Ticket de Lotería',
      price: 50,
      type: 'consumable',
      description: 'Participa en la lotería semanal',
      effect: 'lottery'
    },
    'proteccion': {
      name: '🛡️ Protección Antirrobos',
      price: 500,
      type: 'consumable',
      description: 'Protección contra robos por 24h',
      effect: 'protection'
    },
    'caja_fuerte': {
      name: '🔒 Caja Fuerte',
      price: 2000,
      type: 'equipment',
      description: 'Guarda hasta 10,000 WC seguro',
      effect: 'safe'
    },
    'ampliacion': {
      name: '📈 Ampliación Bancaria',
      price: 5000,
      type: 'upgrade',
      description: 'Duplica tu límite bancario',
      effect: 'bank_upgrade'
    }
  }

  // Comando VENDER - separado
  if (command === 'vender') {
    if (!args[0]) {
      return m.reply(
        `📦 *VENDER ITEMS*\n\n` +
        `Uso: ${usedPrefix}vender <item> [cantidad]\n` +
        `Ejemplo: ${usedPrefix}vender pocion 2\n\n` +
        `🔧 ${usedPrefix}items - Ver tus items\n` +
        `🛒 ${usedPrefix}tienda - Ver precios`
      )
    }

    const itemId = args[0].toLowerCase()
    const quantity = args[1] ? parseInt(args[1]) : 1

    // Precios de venta (50% del precio original)
    const sellPrices = {
      'pocion': 50,
      'energia': 75,
      'loteria': 25,
      'proteccion': 250
    }

    const sellPrice = sellPrices[itemId]

    if (!sellPrice) {
      return m.reply(
        `❌ Este item no se puede vender.\n\n` +
        `📦 Items vendibles:\n` +
        Object.keys(sellPrices).map(id => `• ${id}`).join('\n') +
        `\n\n💡 Se venden al 50% del precio de compra.`
      )
    }

    if (isNaN(quantity) || quantity <= 0) {
      return m.reply('❌ Cantidad inválida.')
    }

    // Contar cuántos tiene
    const itemCount = (user.economy.inventory || []).filter(id => id === itemId).length

    if (itemCount < quantity) {
      return m.reply(
        `❌ *NO TIENES SUFICIENTES*\n\n` +
        `Necesitas: ${quantity} ${itemId}\n` +
        `Tienes: ${itemCount}\n\n` +
        `🔧 Usa ${usedPrefix}items para ver tu inventario.`
      )
    }

    const totalEarned = sellPrice * quantity

    // Remover items del inventario
    let removed = 0
    user.economy.inventory = (user.economy.inventory || []).filter(id => {
      if (id === itemId && removed < quantity) {
        removed++
        return false
      }
      return true
    })

    // Dar dinero
    user.economy.waguri += totalEarned

    await m.reply(
      `💰 *VENTA EXITOSA*\n\n` +
      `📦 Item: ${itemId} x${quantity}\n` +
      `💵 Precio unitario: ${formatNumber(sellPrice)} WC\n` +
      `💰 Total ganado: ${formatNumber(totalEarned)} WC\n\n` +
      `💳 Nuevo saldo: ${formatNumber(user.economy.waguri)} WC\n` +
      `📦 Items restantes: ${user.economy.inventory.length}`
    )

    return
  }

  // Comandos TIENDA y COMPRAR
  // Mostrar tienda
  if (command === 'tienda' || command === 'shop' || !args[0]) {
    let shopMessage = `🛒 *TIENDA WAGURI*\n\n`
    shopMessage += `💰 Tu saldo: ${formatNumber(user.economy.waguri)} WC\n\n`

    Object.entries(shopItems).forEach(([id, item], index) => {
      shopMessage += `🆔 ${index + 1}. ${item.name}\n`
      shopMessage += `   📝 ${item.description}\n`
      shopMessage += `   💰 ${formatNumber(item.price)} WC\n`
      shopMessage += `   🔧 ${usedPrefix}comprar ${id}\n\n`
    })

    shopMessage += `📌 *PARA COMPRAR:*\n`
    shopMessage += `${usedPrefix}comprar <item> [cantidad]\n`
    shopMessage += `Ejemplo: ${usedPrefix}comprar pocion 3\n\n`
    shopMessage += `📦 *TU INVENTARIO:* ${user.economy.inventory?.length || 0} items\n`
    shopMessage += `🔧 ${usedPrefix}items - Ver tus items\n`
    shopMessage += `💰 ${usedPrefix}vender <item> [cantidad] - Vender items`

    await m.reply(shopMessage)
    return
  }

  // Procesar compra
  if (command === 'comprar' || command === 'buy') {
    const itemId = args[0].toLowerCase()
    const quantity = args[1] ? parseInt(args[1]) : 1

    const item = shopItems[itemId]

    if (!item) {
      return m.reply(
        `❌ *ITEM NO ENCONTRADO*\n\n` +
        `Items disponibles:\n` +
        Object.keys(shopItems).map(id => `• ${id}`).join('\n') +
        `\n\n📌 Usa ${usedPrefix}tienda para ver la lista completa.`
      )
    }

    if (isNaN(quantity) || quantity <= 0) {
      return m.reply('❌ Cantidad inválida. Debe ser un número mayor a 0.')
    }

    if (quantity > 99) {
      return m.reply('❌ Máximo 99 unidades por compra.')
    }

    const totalCost = item.price * quantity

    if (user.economy.waguri < totalCost) {
      return m.reply(
        `❌ *FONDOS INSUFICIENTES*\n\n` +
        `💰 Costo total: ${formatNumber(totalCost)} WC\n` +
        `💳 Tu saldo: ${formatNumber(user.economy.waguri)} WC\n\n` +
        `💡 Necesitas ${formatNumber(totalCost - user.economy.waguri)} WC más.`
      )
    }

    // Verificar si ya tiene caja fuerte
    if (itemId === 'caja_fuerte' && user.economy.hasSafe) {
      return m.reply('❌ Ya tienes una caja fuerte.')
    }

    // Realizar compra
    user.economy.waguri -= totalCost
    user.economy.totalSpent = (user.economy.totalSpent || 0) + totalCost

    // Añadir al inventario
    if (!user.economy.inventory) user.economy.inventory = []

    for (let i = 0; i < quantity; i++) {
      user.economy.inventory.push(itemId)
    }

    // Aplicar efectos inmediatos para ciertos items
    if (itemId === 'caja_fuerte') {
      user.economy.hasSafe = true
      user.economy.safeBalance = 0
    } else if (itemId === 'ampliacion') {
      user.economy.bankLimit = (user.economy.bankLimit || 10000) * 2
    } else if (itemId === 'proteccion') {
      user.economy.protected = true
      user.economy.protectionExpires = Date.now() + (24 * 60 * 60 * 1000)
    }

    // Registrar transacción
    if (!user.economy.transactions) user.economy.transactions = []
    user.economy.transactions.unshift({
      type: 'purchase',
      amount: totalCost,
      description: `Compra: ${item.name} x${quantity}`,
      date: new Date().toISOString(),
      timestamp: Date.now()
    })

    let successMessage = `✅ *COMPRA EXITOSA*\n\n`
    successMessage += `🛒 Item: ${item.name}\n`
    successMessage += `📦 Cantidad: ${quantity}\n`
    successMessage += `💰 Costo total: ${formatNumber(totalCost)} WC\n\n`

    if (item.effect === 'safe') {
      successMessage += `🔒 Caja fuerte instalada.\n`
      successMessage += `💳 Usa ${usedPrefix}depositar para guardar dinero seguro.\n\n`
    } else if (item.effect === 'bank_upgrade') {
      successMessage += `🏦 Límite bancario duplicado.\n`
      successMessage += `💳 Nuevo límite: ${formatNumber(user.economy.bankLimit)} WC\n\n`
    } else if (item.effect === 'protection') {
      successMessage += `🛡️ Protección activada por 24h.\n`
      successMessage += `🚫 Los robos contra ti fallarán.\n\n`
    } else {
      successMessage += `📦 Item añadido a tu inventario.\n`
      successMessage += `🔧 Usa ${usedPrefix}usar ${itemId} para usarlo.\n\n`
    }

    successMessage += `💳 Saldo restante: ${formatNumber(user.economy.waguri)} WC\n`
    successMessage += `📦 Total items: ${user.economy.inventory.length}`

    await m.reply(successMessage)
    return
  }
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    inventory: [],
    bankLimit: 10000,
    hasSafe: false,
    protected: false,
    protectionExpires: 0,
    totalSpent: 0,
    transactions: []
  }
}

handler.help = ['tienda', 'comprar <item> [cantidad]', 'vender <item> [cantidad]']
handler.tags = ['economy', 'shop']
handler.command = /^(tienda|shop|comprar|buy|vender|sell)$/i
handler.group = true
handler.register = true

export default handler