// By DuarteXV

import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users[m.sender];
  if (!user || !user.registered) {
    await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
    return conn.reply(m.chat, 
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para usar Gemini AI! 💎`,
      m
    );
  }

  const username = `${conn.getName(m.sender)}`

  if (!text) {
    return conn.reply(m.chat, `*[ ❁ ] Por favor, escribe tu mensaje para hablar con gemini.*`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const response = await geminiChat(text)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('Error:', error)
    await conn.reply(m.chat, '*Error al conectar con la API.*', m)
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.register = true
handler.command = ['gemini']
export default handler

async function geminiChat(q) {
  try {
    const response = await axios.get(
      `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(q)}&role=user`
    )
    return response.data.message
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}