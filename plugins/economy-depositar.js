import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let db
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  } catch (e) {
    return conn.reply(m.chat, 'Error al leer la base de datos 😔', m)
  }

  if (!db.users) db.users = {}

  let user = db.users[m.sender]

  if (!user) {
    user = {
      coin: 1000,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
    db.users[m.sender] = user
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  }

  user.coin = Number(user.coin) || 0
  user.bank = Number(user.bank) || 0

  if (!text) {
    return conn.reply(m.chat, `🌸 Usa: *\( {usedPrefix + command} <cantidad>*\nEjemplo: \){usedPrefix + command} 500`, m)
  }

  let cantidad = Number(text.trim())
  if (isNaN(cantidad) || cantidad <= 0) {
    return conn.reply(m.chat, `🌸 La cantidad debe ser un número positivo.`, m)
  }

  if (cantidad > user.coin) {
    return conn.reply(m.chat, `🌸 No tienes suficientes en mano. Solo tienes ${user.coin} coin.`, m)
  }

  user.coin -= cantidad
  user.bank += cantidad

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  let txt = `🌸 *¡Depósito realizado!*

Moviste **${cantidad} Waguri Coins** de mano a banco.

Ahora tienes:
En mano: **${user.coin}**
En banco: **${user.bank}** ✨`

  conn.reply(m.chat, txt, m)
}

handler.help = ['depositar <cantidad>']
handler.tags = ['economy']
handler.command = /^(depositar|dep|deposit)$/i
handler.group = true
handler.register = true

export default handler