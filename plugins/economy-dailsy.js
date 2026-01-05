let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) initEconomy(user)
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  
  // Verificar última reclamación
  if (!user.economy.lastDaily) user.economy.lastDaily = 0
  
  const timeSinceLast = now - user.economy.lastDaily
  
  // Si ya reclamó hoy
  if (timeSinceLast < oneDay && user.economy.lastDaily !== 0) {
    const hoursLeft = 24 - Math.floor(timeSinceLast / (60 * 60 * 1000))
    const minutesLeft = 60 - Math.floor((timeSinceLast % (60 * 60 * 1000)) / 60000)
    
    return m.reply(
      `⏳ *YA RECLAMASTE HOY*\n\n` +
      `🕐 Vuelve en: ${hoursLeft}h ${minutesLeft}m\n` +
      `🔥 Racha actual: ${user.economy.dailyStreak || 0} días\n\n` +
      `💡 Reclama diariamente para aumentar tu racha y ganar más.`
    )
  }
  
  // Calcular racha
  let newStreak = 1
  if (timeSinceLast < oneDay * 2) {
    // Mantiene la racha (reclamó ayer)
    newStreak = (user.economy.dailyStreak || 0) + 1
  }
  // Si pasaron más de 2 días, pierde la racha (newStreak = 1)
  
  user.economy.dailyStreak = newStreak
  user.economy.lastDaily = now
  
  // Calcular recompensa base
  const baseReward = 100
  const streakBonus = newStreak * 20
  const totalReward = baseReward + streakBonus
  
  // Bonus por rachas especiales
  let bonusMessage = ''
  let extraBonus = 0
  
  if (newStreak === 7) {
    extraBonus = 200
    bonusMessage = `🎯 *Bonus x7 días:* +${extraBonus} WC\n`
  } else if (newStreak === 30) {
    extraBonus = 1000
    bonusMessage = `🏆 *Bonus x30 días:* +${extraBonus} WC\n`
  }
  
  const finalReward = totalReward + extraBonus
  
  // Dar recompensa
  user.economy.waguri += finalReward
  user.economy.totalEarned += finalReward
  
  // Registrar transacción
  if (!user.economy.transactions) user.economy.transactions = []
  user.economy.transactions.unshift({
    type: 'daily',
    amount: finalReward,
    description: `Recompensa diaria (racha: ${newStreak})`,
    date: new Date().toISOString(),
    timestamp: now
  })
  
  let message = `🎁 *RECOMPENSA DIARIA*\n\n`
  message += `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n`
  message += `🔥 Racha: ${newStreak} días consecutivos\n\n`
  
  message += `💰 *DESGLOSE:*\n`
  message += `• Base: ${formatNumber(baseReward)} WC\n`
  message += `• Bonus racha: +${formatNumber(streakBonus)} WC\n`
  
  if (extraBonus > 0) {
    message += bonusMessage
  }
  
  message += `\n💰 *TOTAL: ${formatNumber(finalReward)} WC*\n`
  message += `💳 Saldo actual: ${formatNumber(user.economy.waguri)} WC\n\n`
  
  // Consejos basados en racha
  if (newStreak < 3) {
    message += `💡 *Consejo:* Sigue así por 7 días para un bonus especial.\n`
  } else if (newStreak < 7) {
    message += `💡 *Consejo:* ¡Vas por buen camino! Faltan ${7 - newStreak} días para el bonus x7.\n`
  } else if (newStreak < 30) {
    message += `💡 *Consejo:* ¡Increíble! Sigue para el bonus x30 (faltan ${30 - newStreak} días).\n`
  } else {
    message += `💡 *Consejo:* ¡Leyenda! Has reclamado ${newStreak} días seguidos.\n`
  }
  
  message += `\n⏰ Próxima recompensa en 24 horas`
  
  await m.reply(message)
}

function initEconomy(user) {
  user.economy = {
    waguri: 1000,
    bank: 0,
    bankLimit: 10000,
    lastDaily: 0,
    dailyStreak: 0,
    transactions: [],
    totalEarned: 1000
  }
}

handler.help = ['daily', 'diario', 'recompensa']
handler.tags = ['economy']
handler.command = /^(daily|diario|recompensa|claim)$/i
handler.group = true
handler.register = true

export default handler