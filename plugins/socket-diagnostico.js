[11/1 11:10 a. m.] 𓏲ּ𝄢αи∂єя ׂ𓈒་༘࿐ ₊: Pero azlo si es fácil
[11/1 11:10 a. m.] .: // diag.js - Comando de diagnóstico
let handler = async (m, { conn, usedPrefix }) => {
  const diagnostics = `
🔍 *DIAGNÓSTICO DEL BOT*

📡 Estado conexión: ${conn?.user ? '✅ Conectado' : '❌ Desconectado'}
👤 Usuario ID: ${conn?.user?.id || 'N/A'}
📱 Dispositivo: ${conn?.user?.device || 'N/A'}

🖥️ *SERVIDOR:*
• RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime: ${formatTime(process.uptime())}
• Node: ${process.version}

💾 *SESSION:*
• Archivo existe: ${fs.existsSync('./session.json') ? '✅' : '❌'}
• Tamaño: ${fs.existsSync('./session.json') ? 
  (fs.statSync('./session.json').size / 1024).toFixed(2) + ' KB' : 'N/A'}
  `
  
  await m.reply(diagnostics)
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours}h ${minutes}m ${secs}s`
}

handler.help = ['diagnostico', 'diag']
handler.tags = ['info']
handler.command = /^(diag|diagnostico|status|ping)$/i
export default handler