// by Rufino 
import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, usedPrefix, command }) => {
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
      coin: 1000,  // bono inicial si es nuevo
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
    db.users[m.sender] = user
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  }

  let coin = Number(user.coin) || 0
  let bank = Number(user.bank) || 0
  let total = coin + bank

  let txt = `🌸 *Tu saldo en Waguri Coins* 🪙

En mano (coin): **${coin}**
En banco (seguro): **${bank}**
─────────────────────
Total: **${total}** ✨

¡Sigue trabajando para aumentar tu fortuna! 🔥`

  conn.reply(m.chat, txt, m)
}

handler.help = ['balance', 'bal', 'dinero', 'saldo']
handler.tags = ['economy']
handler.command = /^(balance|bal|dinero|saldo)$/i
handler.group = true
handler.register = true

export default handler