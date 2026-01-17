let handler = async (m, { conn, text, usedPrefix }) => {
  // Mensaje de prueba inmediato para ver si el comando se ejecuta
  conn.reply(m.chat, '¡El comando !trabajar se ejecutó! Ahora vamos a ver si hay error...', m)

  // Intento de leer DB
  let db
  try {
    db = JSON.parse(fs.readFileSync('./database.json', 'utf-8') || '{}')
    conn.reply(m.chat, 'DB leída correctamente. Usuarios: ' + Object.keys(db.users || {}).length, m)
  } catch (e) {
    conn.reply(m.chat, 'Error al leer database.json: ' + e.message, m)
    return
  }

  // Mensaje final para confirmar
  conn.reply(m.chat, `🌸 Comando terminado sin crash. Prueba con !balance ahora.`, m)
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = /^(trabajar)$/i
handler.group = true

export default handler