let handler = async (m, { conn, args, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  const CYBERWARE_STORE = [
    { id: 1, name: "🦿 Implante de Piernas", price: 500, effect: { maxHp: 10 } },
    { id: 2, name: "💪 Brazos Cibernéticos", price: 750, effect: { attack: 15 } },
    { id: 3, name: "👁️ Ojo Cibernético", price: 600, effect: { specialEventChance: 0.1 } },
    { id: 4, name: "🛡️ Escudo Nanotecnológico", price: 900, effect: { defense: 20, maxHp: 10 } },
    { id: 5, name: "⚡ Neuro-acelerador", price: 1200, effect: { cooldownReduction: 60000 } },
    { id: 6, name: "💾 Chip de Hacking", price: 800, effect: { dataRewardBoost: 0.25 } }
  ]
  
  if (!args[0]) return m.reply(`⚠️ Usa: ${usedPrefix}comprar <ID>\nEjemplo: ${usedPrefix}comprar 1`)
  
  const itemId = parseInt(args[0])
  const item = CYBERWARE_STORE.find(i => i.id === itemId)
  
  if (!item) return m.reply(`❌ ID no válido. Usa ${usedPrefix}tienda para ver los items.`)
  
  if (!user.cyberHunter) {
    user.cyberHunter = {
      rank: "Novato",
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      cyberware: 0,
      reputation: 0,
      missionsCompleted: 0,
      missionsFailed: 0,
      lastMission: 0,
      upgrades: []
    }
  }
  
  if (!user.cyberHunter.upgrades) user.cyberHunter.upgrades = []
  
  if (user.credit < item.price) {
    return m.reply(`❌ Créditos insuficientes.\nNecesitas: ${item.price} ⚡\nTienes: ${user.credit || 0} ⚡`)
  }
  
  if (user.cyberHunter.upgrades.includes(item.id)) {
    return m.reply(`⚠️ Ya posees este upgrade: ${item.name}`)
  }
  
  // Aplicar compra
  user.credit -= item.price
  user.cyberHunter.upgrades.push(item.id)
  
  // Aplicar efectos
  if (item.effect.maxHp) {
    user.cyberHunter.maxHp += item.effect.maxHp
    user.cyberHunter.hp += item.effect.maxHp
  }
  if (item.effect.attack) user.cyberHunter.attack += item.effect.attack
  if (item.effect.defense) user.cyberHunter.defense += item.effect.defense
  
  await m.reply(
    `✅ *COMPRA EXITOSA*\n\n` +
    `🛒 Item: ${item.name}\n` +
    `💰 Costo: ${item.price} créditos\n` +
    `💳 Saldo restante: ${user.credit} ⚡\n\n` +
    `⚡ Mejora aplicada a tu sistema.`
  )
}

handler.help = ['comprar', 'buy']
handler.tags = ['rpg']
handler.command = /^(comprar|buy|adquirir)$/i
export default handler