let handler = async (m, { conn, mentionedJid }) => {
  let targetJid = m.sender
  
  // Si mencionan a alguien, ver sus stats
  if (mentionedJid && mentionedJid.length > 0) {
    targetJid = mentionedJid[0]
  }
  
  const user = global.db.data.users[targetJid]
  
  if (!user || !user.cyberHunter) {
    if (targetJid === m.sender) {
      return m.reply('❌ Primero usa /cazar para crear tu perfil')
    } else {
      return m.reply('❌ Este usuario no tiene perfil de cazador.')
    }
  }
  
  const stats = user.cyberHunter
  const userName = conn.getName(targetJid)
  
  // Calcular ratios y estadísticas
  const totalMissions = stats.missionsCompleted + stats.missionsFailed
  const winRate = totalMissions > 0 
    ? Math.round((stats.missionsCompleted / totalMissions) * 100)
    : 0
  
  const powerScore = (
    stats.level * 100 +
    stats.attack * 2 +
    stats.defense * 1.5 +
    stats.maxHp * 0.5 +
    stats.reputation * 3
  )
  
  const nextLevelExp = stats.level * 100
  const progressPercentage = Math.min(100, Math.round((stats.cyberware / nextLevelExp) * 100))
  
  // Crear estadísticas detalladas
  let statsMessage = []
  statsMessage.push(`📊 *ESTADÍSTICAS DETALLADAS* 📊`)
  statsMessage.push(`👤 Cazador: ${userName}`)
  statsMessage.push(`🆔 ID: @${targetJid.split('@')[0]}`)
  statsMessage.push(``)
  
  // Sección de combate
  statsMessage.push(`⚔️ *ESTADÍSTICAS DE COMBATE*`)
  statsMessage.push(`🏅 Rango: ${stats.rank}`)
  statsMessage.push(`⭐ Nivel: ${stats.level}`)
  statsMessage.push(`❤️ HP: ${stats.hp}/${stats.maxHp}`)
  statsMessage.push(`⚔️ ATK: ${stats.attack}`)
  statsMessage.push(`🛡️ DEF: ${stats.defense}`)
  statsMessage.push(`💪 Poder: ${Math.floor(powerScore)}`)
  statsMessage.push(``)
  
  // Sección de progreso
  statsMessage.push(`📈 *PROGRESO*`)
  statsMessage.push(`💾 Cyberware: ${stats.cyberware}/${nextLevelExp}`)
  statsMessage.push(`📊 Progreso: ${progressPercentage}%`)
  statsMessage.push(`🌟 Reputación: ${stats.reputation}`)
  statsMessage.push(``)
  
  // Sección de misiones
  statsMessage.push(`🎯 *HISTORIAL DE MISIONES*`)
  statsMessage.push(`✅ Completadas: ${stats.missionsCompleted}`)
  statsMessage.push(`❌ Fallidas: ${stats.missionsFailed}`)
  statsMessage.push(`📊 Total: ${totalMissions}`)
  statsMessage.push(`🎖️ Tasa de éxito: ${winRate}%`)
  statsMessage.push(``)
  
  // Sección de economía
  statsMessage.push(`💰 *ECONOMÍA*`)
  statsMessage.push(`💳 Créditos: ${user.credit || 0} ⚡`)
  if (user.transactions && user.transactions.length > 0) {
    const sent = user.transactions.filter(t => t.type === 'sent').length
    const received = user.transactions.filter(t => t.type === 'received').length
    statsMessage.push(`💸 Transacciones: ${sent} enviadas | ${received} recibidas`)
  }
  statsMessage.push(``)
  
  // Sección de tiempos
  statsMessage.push(`⏰ *TIEMPOS*`)
  if (stats.lastMission) {
    const lastMissionTime = new Date(stats.lastMission)
    const hoursAgo = Math.floor((Date.now() - stats.lastMission) / (60 * 60 * 1000))
    statsMessage.push(`🕐 Última misión: ${hoursAgo}h atrás`)
  }
  
  if (stats.lastDaily) {
    const nextDaily = stats.lastDaily + (24 * 60 * 60 * 1000)
    const dailyHoursLeft = Math.max(0, Math.floor((nextDaily - Date.now()) / (60 * 60 * 1000)))
    statsMessage.push(`🎁 Próxima diaria: ${dailyHoursLeft}h`)
  }
  statsMessage.push(``)
  
  // Logros destacados
  statsMessage.push(`🏆 *LOGROS DESTACADOS*`)
  
  if (stats.missionsCompleted >= 50) {
    statsMessage.push(`🎯 Veterano (+50 misiones)`)
  }
  
  if (stats.reputation >= 100) {
    statsMessage.push(`🌟 Respetado (+100 reputación)`)
  }
  
  if (stats.level >= 10) {
    statsMessage.push(`💪 Experto (Nivel 10+)`)
  }
  
  if (!statsMessage.includes(`🎯 Veterano`) && 
      !statsMessage.includes(`🌟 Respetado`) && 
      !statsMessage.includes(`💪 Experto`)) {
    statsMessage.push(`✨ Sin logros destacados aún`)
  }
  
  statsMessage.push(``)
  statsMessage.push(`🔄 Actualizado: ${new Date().toLocaleTimeString()}`)
  
  await conn.sendMessage(m.chat, {
    text: statsMessage.join('\n'),
    mentions: [targetJid]
  }, { quoted: m })
}

handler.help = ['estadisticas', 'stats', 'detalles', 'info']
handler.tags = ['rpg']
handler.command = /^(estad[ií]sticas|stats|detalles|info|detalle)$/i
handler.group = true
handler.register = true

export default handler