let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar si no existe
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
      lastMission: 0
    }
  }
  
  const AVAILABLE_CONTRACTS = [
    {
      id: 1,
      title: "🚚 Entrega Express",
      client: "Corporación Velocity",
      description: "Transporta un paquete sensible al Distrito Norte",
      reward: 200,
      requirements: "Nivel 1+",
      difficulty: "🟢 Fácil"
    },
    {
      id: 2,
      title: "🔍 Vigilancia",
      client: "Agencia Shadow",
      description: "Monitorea movimientos de un ejecutivo por 24h",
      reward: 450,
      requirements: "Nivel 3+, 50+ reputación",
      difficulty: "🟡 Media"
    },
    {
      id: 3,
      title: "💾 Recuperación de Datos",
      client: "Dr. Synapse",
      description: "Extrae información de un servidor seguro",
      reward: 700,
      requirements: "Nivel 5+, 30+ ATK",
      difficulty: "🟠 Difícil"
    },
    {
      id: 4,
      title: "⚔️ Eliminación",
      client: "Consejo Corporativo",
      description: "Neutraliza una amenaza de alto riesgo",
      reward: 1200,
      requirements: "Nivel 8+, 15+ misiones completadas",
      difficulty: "🔴 Extrema"
    }
  ]
  
  let contractsMessage = []
  contractsMessage.push(`📋 *TABLERO DE CONTRATOS* 📋`)
  contractsMessage.push(`👤 Cazador: ${user.name || "Anónimo"}`)
  contractsMessage.push(`🏅 Rango: ${user.cyberHunter.rank} | ⭐ Nivel: ${user.cyberHunter.level}`)
  contractsMessage.push(``)
  
  AVAILABLE_CONTRACTS.forEach(contract => {
    contractsMessage.push(`📌 *${contract.id}. ${contract.title}*`)
    contractsMessage.push(`👥 Cliente: ${contract.client}`)
    contractsMessage.push(`📝 ${contract.description}`)
    contractsMessage.push(`💰 Recompensa: ${contract.reward} créditos`)
    contractsMessage.push(`⚡ Dificultad: ${contract.difficulty}`)
    contractsMessage.push(`📋 Requisitos: ${contract.requirements}`)
    contractsMessage.push(``)
  })
  
  contractsMessage.push(`🔧 *ACEPTAR CONTRATO:*`)
  contractsMessage.push(`${usedPrefix}aceptar <ID>`)
  contractsMessage.push(`📌 Ejemplo: ${usedPrefix}aceptar 1`)
  
  await m.reply(contractsMessage.join('\n'))
}

handler.help = ['contratos', 'misiones', 'contracts']
handler.tags = ['rpg']
handler.command = /^(contratos|misiones|contracts|missions)$/i
handler.group = true
handler.register = true

export default handler