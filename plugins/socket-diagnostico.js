// diag.js - Comando de diagnóstico CORREGIDO
import fs from 'fs'
import os from 'os'
import process from 'process'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Información del sistema
    const totalMem = os.totalmem() / 1024 / 1024 / 1024
    const freeMem = os.freemem() / 1024 / 1024 / 1024
    const usedMem = totalMem - freeMem
    const uptime = process.uptime()
    
    // Información de la conexión
    const isConnected = conn && conn.user
    const connectionStatus = isConnected ? '✅ CONECTADO' : '❌ DESCONECTADO'
    const userInfo = conn?.user ? 
      `👤 ID: ${conn.user.id}\n📱 Device: ${conn.user.device || 'N/A'}` : 
      '👤 No hay información de usuario'
    
    // Información de la sesión
    const sessionFiles = []
    try {
      const files = fs.readdirSync('.')
      sessionFiles.push(...files.filter(f => 
        f.includes('session') || f.includes('creds') || f.includes('auth')
      ))
    } catch (e) {}
    
    // Información de grupos/chats
    let groupInfo = 'N/A'
    try {
      if (m.chat.endsWith('@g.us') && conn.groupMetadata) {
        const metadata = await conn.groupMetadata(m.chat)
        groupInfo = `👥 ${metadata.participants.length} miembros`
      }
    } catch (e) {}
    
    // Crear mensaje de diagnóstico
    const diagnostics = `
🔍 *DIAGNÓSTICO DEL BOT - WAGURI*

📡 *CONEXIÓN:*
${connectionStatus}
${userInfo}

💻 *SERVIDOR/SISTEMA:*
🖥️ Plataforma: ${os.platform()} ${os.arch()}
🧠 CPU: ${os.cpus()[0]?.model || 'N/A'}
💾 RAM: ${usedMem.toFixed(2)}GB / ${totalMem.toFixed(2)}GB (${((usedMem/totalMem)*100).toFixed(1)}%)
⏱️ Uptime Bot: ${formatTime(uptime)}
🔢 Node.js: ${process.version}

📁 *ARCHIVOS DE SESIÓN:*
${sessionFiles.length > 0 ? 
  sessionFiles.map(f => `📄 ${f} (${(fs.statSync(f).size/1024).toFixed(1)} KB)`).join('\n') : 
  '⚠️ No se encontraron archivos de sesión'}

💬 *CHAT ACTUAL:*
${m.chat.endsWith('@g.us') ? '👥 Grupo' : '👤 Privado'}
${groupInfo}
📨 Mensaje ID: ${m.id || 'N/A'}

🔄 *RECOMENDACIONES:*
${!isConnected ? '⚠️ El bot está desconectado. Usa .reconnect' : '✅ Conexión estable'}
${sessionFiles.length === 0 ? '⚠️ No hay sesión guardada' : '✅ Sesión encontrada'}
    `.trim()
    
    await conn.sendMessage(m.chat, { 
      text: diagnostics,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: '🔧 Diagnóstico Bot',
          body: 'Estado del sistema',
          thumbnail: await (await conn.getFile('https://i.imgur.com/6JqQH3v.png')).data
        }
      }
    })
    
  } catch (error) {
    console.error('Error en diagnóstico:', error)
    await m.reply(`❌ Error al generar diagnóstico:\n${error.message}`)
  }
}

function formatTime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0) parts.push(`${secs}s`)
  
  return parts.join(' ') || '0s'
}

handler.help = ['diagnostico', 'diag', 'ping', 'estado']
handler.tags = ['info', 'tools']
handler.command = /^(diag|diagnostico|status|ping|estado|debug)$/i
handler.register = true
handler.group = true

export default handler