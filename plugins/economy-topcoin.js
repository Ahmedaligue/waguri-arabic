let handler = async (m, { conn, usedPrefix }) => {
  const users = global.db.data.users
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  // Obtener todos los usuarios con economía
  const richUsers = Object.entries(users)
    .filter(([_, userData]) => userData.economy)
    .map(([jid, userData]) => {
      const cash = userData.economy.waguri || 0
      const bank = userData.economy.bank || 0
      const total = cash + bank
      
      return {
        jid,
        name: conn.getName(jid) || `@${jid.split('@')[0]}`,
        total,
        cash,
        bank,
        level: userData.economy.workLevel || 1,
        job: userData.economy.job || 'Sin trabajo'
      }
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10) // Top 10
  
  if (richUsers.length === 0) {
    return m.reply('📊 No hay usuarios económicos registrados.')
  }
  
  // También obtener estadísticas globales
  let totalCoins = 0
  let totalUsers = 0
  let averageWealth = 0
  
  Object.values(users).forEach(userData => {
    if (userData.economy) {
      const cash = userData.economy.waguri || 0
      const bank = userData.economy.bank || 0
      totalCoins += cash + bank
      totalUsers++
    }
  })
  
  if (totalUsers > 0) {
    averageWealth = Math.floor(totalCoins / totalUsers)
  }
  
  let topMessage = `🏆 *TOP 10 WAGURI COINS*\n\n`
  topMessage += `📊 Estadísticas globales:\n`
  topMessage += `💰 Total en circulación: ${formatNumber(totalCoins)} WC\n`
  topMessage += `👥 Usuarios económicos: ${totalUsers}\n`
  topMessage += `📈 Riqueza promedio: ${formatNumber(averageWealth)} WC\n\n`
  
  // Top 10
  topMessage += `🥇 *TOP 10 MÁS RICOS:*\n\n`
  
  richUsers.forEach((user, index) => {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    const medal = medals[index] || `${index + 1}.`
    
    topMessage += `${medal} @${user.jid.split('@')[0]}\n`
    topMessage += `   👤 ${user.name}\n`
    topMessage += `   💰 ${formatNumber(user.total)} WC\n`
    topMessage += `   💼 ${user.job} | ⭐ ${user.level}\n`
    
    if (index === 0) {
      topMessage += `   👑 *Rey de Waguri*\n`
    }
    
    topMessage += `\n`
  })
  
  // Ver posición del usuario actual
  const currentUser = users[m.sender]
  if (currentUser && currentUser.economy) {
    const currentCash = currentUser.economy.waguri || 0
    const currentBank = currentUser.economy.bank || 0
    const currentTotal = currentCash + currentBank
    
    // Encontrar posición
    const allUsers = Object.entries(users)
      .filter(([_, userData]) => userData.economy)
      .map(([jid, userData]) => {
        const cash = userData.economy.waguri || 0
        const bank = userData.economy.bank || 0
        return { jid, total: cash + bank }
      })
      .sort((a, b) => b.total - a.total)
    
    const userPosition = allUsers.findIndex(u => u.jid === m.sender) + 1
    const totalRanked = allUsers.length
    
    if (userPosition > 0) {
      topMessage += `📊 *TU POSICIÓN:*\n`
      topMessage += `🎯 Lugar: ${userPosition}/${totalRanked}\n`
      topMessage += `💰 Riqueza: ${formatNumber(currentTotal)} WC\n`
      
      if (userPosition > 10) {
        const nextUser = allUsers[userPosition - 2] // El de arriba
        const difference = nextUser.total - currentTotal
        topMessage += `📈 Para top 10 necesitas: ${formatNumber(difference)} WC más\n`
      }
      
      topMessage += `💡 Consejo: Usa ${usedPrefix}trabajar y ${usedPrefix}daily\n`
    }
  }
  
  topMessage += `\n⏰ Actualizado: ${new Date().toLocaleTimeString()}`
  
  // Mencionar a los top 3
  const mentions = richUsers.slice(0, 3).map(u => u.jid)
  
  await conn.sendMessage(m.chat, {
    text: topMessage,
    mentions
  }, { quoted: m })
}

handler.help = ['topcoins', 'ranking', 'top10', 'richest']
handler.tags = ['economy']
handler.command = /^(topcoins|ranking|top10|ricos|richest)$/i
handler.group = true
handler.register = true

export default handler