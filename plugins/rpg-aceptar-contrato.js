let handler = async (m, { conn, usedPrefix, args }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.cyberHunter) {
    return m.reply('❌ Primero usa /cazar para crear tu perfil')
  }
  
  if (!args[0]) {
    return m.reply(`📌 Usa: ${usedPrefix}aceptar <ID>\nEjemplo: ${usedPrefix}aceptar 1`)
  }
  
  const contractId = parseInt(args[0])
  
  // Definir contratos disponibles
  const CONTRACTS = {
    1: {
      title: "🚚 Entrega Express",
      reward: 200,
      checkRequirements: (player) => player.level >= 1,
      requirementsText: "Nivel 1+"
    },
    2: {
      title: "🔍 Vigilancia", 
      reward: 450,
      checkRequirements: (player) => player.level >= 3 && player.reputation >= 50,
      requirementsText: "Nivel 3+, 50+ reputación"
    },
    3: {
      title: "💾 Recuperación de Datos",
      reward: 700,
      checkRequirements: (player) => player.level >= 5 && player.attack >= 30,
      requirementsText: "Nivel 5+, 30+ ATK"
    },
    4: {
      title: "⚔️ Eliminación",
      reward: 1200,
      checkRequirements: (player) => player.level >= 8 && player.missionsCompleted >= 15,
      requirementsText: "Nivel 8+, 15+ misiones"
    }
  }
  
  const contract = CONTRACTS[contractId]
  
  if (!contract) {
    return m.reply(`❌ Contrato no encontrado. Usa ${usedPrefix}contratos para ver la lista`)
  }
  
  // Verificar requisitos
  if (!contract.checkRequirements(user.cyberHunter)) {
    return m.reply(`❌ No cumples los requisitos para este contrato.\n📋 Requerido: ${contract.requirementsText}`)
  }
  
  // Verificar si ya tiene un contrato activo
  if (user.cyberHunter.activeContract) {
    return m.reply(`⚠️ Ya tienes un contrato activo: "${user.cyberHunter.activeContract.title}"\nComplétalo antes de aceptar otro.`)
  }
  
  // Aceptar contrato
  user.cyberHunter.activeContract = {
    id: contractId,
    title: contract.title,
    acceptedAt: Date.now(),
    reward: contract.reward
  }
  
  await m.reply(
    `✅ *CONTRATO ACEPTADO*\n\n` +
    `📝 ${contract.title}\n` +
    `💰 Recompensa: ${contract.reward} créditos\n` +
    `⏰ Tiempo estimado: 5 minutos\n\n` +
    `🔧 Completa el contrato usando ${usedPrefix}completar`
  )
}

handler.help = ['aceptar', 'accept', 'tomar']
handler.tags = ['rpg']
handler.command = /^(aceptar|accept|tomar)$/i
handler.group = true
handler.register = true

export default handler