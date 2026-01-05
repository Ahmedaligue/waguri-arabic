let handler = async (m, { conn, usedPrefix, command, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) initEconomy(user)
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Inicializar lotería global si no existe
  if (!global.lottery) {
    global.lottery = {
      pot: 0,
      participants: [],
      lastDraw: 0,
      drawCooldown: 7 * 24 * 60 * 60 * 1000 // 1 semana
    }
  }
  
  const lottery = global.lottery
  const now = Date.now()
  
  // Mostrar información de la lotería
  if (!args[0]) {
    const timeSinceLast = now - lottery.lastDraw
    const nextDrawIn = Math.max(0, lottery.drawCooldown - timeSinceLast)
    
    const days = Math.floor(nextDrawIn / (24 * 60 * 60 * 1000))
    const hours = Math.floor((nextDrawIn % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    
    let lotteryMessage = `🎫 *LOTERÍA WAGURI*\n\n`
    lotteryMessage += `💰 Bote actual: ${formatNumber(lottery.pot)} WC\n`
    lotteryMessage += `👥 Participantes: ${lottery.participants.length}\n`
    lotteryMessage += `⏰ Próximo sorteo: ${days}d ${hours}h\n\n`
    
    if (user.economy.inventory?.includes('loteria')) {
      const tickets = user.economy.inventory.filter(i => i === 'loteria').length
      lotteryMessage += `🎫 Tus tickets: ${tickets}\n`
      lotteryMessage += `🔧 ${usedPrefix}loteria participar\n\n`
    } else {
      lotteryMessage += `🎫 No tienes tickets\n`
      lotteryMessage += `🛒 Compra en: ${usedPrefix}tienda\n\n`
    }
    
    lotteryMessage += `📌 *CÓMO FUNCIONA:*\n`
    lotteryMessage += `1. Compra tickets (${usedPrefix}tienda)\n`
    lotteryMessage += `2. Participa (${usedPrefix}loteria participar)\n`
    lotteryMessage += `3. Espera al sorteo semanal\n`
    lotteryMessage += `4. ¡Gana el bote!\n\n`
    
    lotteryMessage += `🏆 *ÚLTIMO GANADOR:*\n`
    if (lottery.lastWinner) {
      lotteryMessage += `${lottery.lastWinner.name}\n`
      lotteryMessage += `💰 Ganó: ${formatNumber(lottery.lastWinner.prize)} WC\n`
    } else {
      lotteryMessage += `Ninguno aún\n`
    }
    
    await m.reply(lotteryMessage)
    return
  }
  
  // Participar en la lotería
  if (args[0].toLowerCase() === 'participar') {
    // Verificar si tiene tickets
    const inventory = user.economy.inventory || []
    const ticketIndex = inventory.indexOf('loteria')
    
    if (ticketIndex === -1) {
      return m.reply(
        `❌ *NO TIENES TICKETS*\n\n` +
        `🎫 Necesitas un ticket de lotería.\n` +
        `🛒 Compra en: ${usedPrefix}tienda\n` +
        `💰 Precio: 50 WC por ticket`
      )
    }
    
    // Verificar si ya participó
    const alreadyParticipating = lottery.participants.some(p => p.jid === m.sender)
    
    if (alreadyParticipating) {
      return m.reply('❌ Ya estás participando en esta lotería.')
    }
    
    // Usar ticket
    inventory.splice(ticketIndex, 1)
    
    // Añadir al bote
    const ticketValue = 50
    lottery.pot += ticketValue
    
    // Registrar participante
    lottery.participants.push({
      jid: m.sender,
      name: conn.getName(m.sender) || `@${m.sender.split('@')[0]}`,
      ticketNumber: lottery.participants.length + 1
    })
    
    await m.reply(
      `✅ *PARTICIPACIÓN REGISTRADA*\n\n` +
      `🎫 Ticket usado: 1\n` +
      `💰 Bote actual: ${formatNumber(lottery.pot)} WC\n` +
      `👥 Total participantes: ${lottery.participants.length}\n` +
      `🎯 Número de ticket: ${lottery.participants.length}\n\n` +
      `⏰ El sorteo es semanal.\n` +
      `🏆 ¡Buena suerte!`
    )
    
    return
  }
  
  // Forzar sorteo (solo admin)
  if (args[0].toLowerCase() === 'sorteo' && m.sender === global.opts.owner) {
    if (lottery.participants.length === 0) {
      return m.reply('❌ No hay participantes para el sorteo.')
    }
    
    // Seleccionar ganador aleatorio
    const winnerIndex = Math.floor(Math.random() * lottery.participants.length)
    const winner = lottery.participants[winnerIndex]
    
    // Dar premio
    const winnerUser = global.db.data.users[winner.jid]
    if (!winnerUser.economy) initEconomy(winnerUser)
    
    winnerUser.economy.waguri += lottery.pot
    
    // Guardar información del ganador
    lottery.lastWinner = {
      jid: winner.jid,
      name: winner.name,
      prize: lottery.pot,
      date: new Date().toISOString()
    }
    
    // Notificar a todos
    const winnerMessage = `🏆 *¡SORTEO DE LOTERÍA!*\n\n` +
                         `🎉 Ganador: @${winner.jid.split('@')[0]}\n` +
                         `💰 Premio: ${formatNumber(lottery.pot)} WC\n` +
                         `👥 Participantes: ${lottery.participants.length}\n\n` +
                         `🎫 Nuevo sorteo en una semana.`
    
    await conn.sendMessage(m.chat, {
      text: winnerMessage,
      mentions: [winner.jid]
    })
    
    // Resetear lotería
    lottery.pot = 0
    lottery.participants = []
    lottery.lastDraw = now
    
    return
  }
  
  // Comando no reconocido
  return m.reply(
    `❌ Comando no reconocido.\n\n` +
    `📌 Comandos disponibles:\n` +
    `• ${usedPrefix}loteria - Ver información\n` +
    `• ${usedPrefix}loteria participar - Participar\n` +
    `• ${usedPrefix}loteria sorteo - Sorteo (admin)`
  )
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    inventory: []
  }
}

handler.help = ['loteria [participar]', 'lottery']
handler.tags = ['economy', 'games']
handler.command = /^(loteria|lottery|sorteo)$/i
handler.group = true
handler.register = true

export default handler