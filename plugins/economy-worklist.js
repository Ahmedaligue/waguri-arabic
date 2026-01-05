let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user.economy) {
    user.economy = { workLevel: 1 }
  }
  
  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num)
  
  const jobs = {
    'repartidor': { name: '🚚 Repartidor', pay: 150, level: 1, time: '2h', desc: 'Reparte paquetes' },
    'cajero': { name: '💵 Cajero', pay: 200, level: 2, time: '3h', desc: 'Atención al cliente' },
    'constructor': { name: '👷 Constructor', pay: 300, level: 3, time: '4h', desc: 'Construcción' },
    'cocinero': { name: '👨‍🍳 Cocinero', pay: 350, level: 4, time: '4h', desc: 'Prepara comida' },
    'programador': { name: '💻 Programador', pay: 500, level: 5, time: '6h', desc: 'Desarrollo software' },
    'doctor': { name: '👨‍⚕️ Doctor', pay: 800, level: 8, time: '8h', desc: 'Atención médica' },
    'abogado': { name: '⚖️ Abogado', pay: 1000, level: 10, time: '10h', desc: 'Asesoría legal' },
    'ceo': { name: '👔 CEO', pay: 1500, level: 12, time: '12h', desc: 'Dirección empresa' },
    'inversor': { name: '📈 Inversor', pay: 2000, level: 15, time: '24h', desc: 'Inversiones' }
  }
  
  let message = `💼 *LISTA DE TRABAJOS*\n\n`
  message += `👤 Tu nivel: ${user.economy.workLevel || 1}\n`
  message += `💼 Trabajo actual: ${user.economy.job ? jobs[user.economy.job]?.name || user.economy.job : 'Ninguno'}\n\n`
  
  Object.entries(jobs).forEach(([id, job]) => {
    const canWork = (user.economy.workLevel || 1) >= job.level
    const status = canWork ? '🟢' : '🔴'
    const locked = canWork ? '' : ` (Nivel ${job.level})`
    
    message += `${status} *${job.name}${locked}*\n`
    message += `   💰 ${formatNumber(job.pay)} WC | ⏰ ${job.time} | ⭐ ${job.level}\n`
    message += `   📝 ${job.desc}\n`
    
    if (canWork && !user.economy.job) {
      message += `   🔧 ${usedPrefix}trabajar ${id}\n`
    }
    
    message += `\n`
  })
  
  message += `📌 *INSTRUCCIONES:*\n`
  if (user.economy.job) {
    message += `• Usa ${usedPrefix}trabajar para trabajar\n`
    message += `• Usa ${usedPrefix}renunciar para cambiar\n`
  } else {
    message += `• ${usedPrefix}trabajar <nombre> para conseguir trabajo\n`
    message += `• Ejemplo: ${usedPrefix}trabajar repartidor\n`
  }
  
  message += `\n💡 *CONSEJOS:*\n`
  message += `• Sube de nivel trabajando\n`
  message += `• Mejores trabajos = más dinero\n`
  message += `• Trabaja regularmente`
  
  await m.reply(message)
}

handler.help = ['trabajos', 'jobs', 'empleos']
handler.tags = ['economy']
handler.command = /^(trabajos|jobs|empleos|listatrabajos)$/i
handler.group = true
handler.register = true

export default handler