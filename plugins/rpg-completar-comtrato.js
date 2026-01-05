let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  if (!user.cyberHunter.activeContract) {
    return m.reply('❌ No tienes ningún contrato activo.\nUsa /contratos para ver opciones.')
  }
  
  const contract = user.cyberHunter.activeContract
  const timeElapsed = Date.now() - contract.acceptedAt
  
  // Verificar si ha pasado el tiempo mínimo (5 minutos)
  const MIN_TIME = 5 * 60 * 1000 // 5 minutos
  
  if (timeElapsed < MIN_TIME) {
    const remainingMinutes = Math.ceil((MIN_TIME - timeElapsed) / 60000)
    return m.reply(`⏳ Contrato en progreso...\nEspera ${remainingMinutes} minuto(s) más.`)
  }
  
  // Simular misión del contrato
  const successChance = 0.8 // 80% de éxito
  const isSuccess = Math.random() < successChance
  
  if (isSuccess) {
    // Éxito
    const bonus = Math.floor(Math.random() * 100) // Bonus aleatorio
    const totalReward = contract.reward + bonus
    
    user.credit = (user.credit || 0) + totalReward
    user.cyberHunter.missionsCompleted += 1
    user.cyberHunter.reputation += 10
    user.cyberHunter.cyberware += 25
    
    await m.reply(
      `✅ *CONTRATO COMPLETADO*\n\n` +
      `📝 ${contract.title}\n` +
      `💰 Recompensa base: ${contract.reward} créditos\n` +
      `✨ Bonus: +${bonus} créditos\n` +
      `🎯 Total: ${totalReward} créditos\n` +
      `🌟 +10 reputación\n` +
      `💾 +25 cyberware\n\n` +
      `💳 Saldo actual: ${user.credit} ⚡`
    )
  } else {
    // Fracaso
    user.cyberHunter.missionsFailed += 1
    user.cyberHunter.hp = Math.max(1, user.cyberHunter.hp - 20) // Pérdida de HP
    
    await m.reply(
      `❌ *CONTRATO FALLIDO*\n\n` +
      `📝 ${contract.title}\n` +
      `💥 Te encontraron o algo salió mal\n` +
      `❤️ Pérdida: 20 HP\n` +
      `😔 No recibes recompensa\n\n` +
      `🏥 Tu HP actual: ${user.cyberHunter.hp}/${user.cyberHunter.maxHp}`
    )
  }
  
  // Eliminar contrato activo
  delete user.cyberHunter.activeContract
}

handler.help = ['completar', 'complete', 'finish']
handler.tags = ['rpg']
handler.command = /^(completar|complete|finish|terminar)$/i
handler.group = true
handler.register = true

export default handler