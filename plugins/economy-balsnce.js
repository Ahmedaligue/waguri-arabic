// by Rufino 
import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, usedPrefix, command }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}

  const sender = m.sender
  let user = db.users[sender]

  // Si el usuario no existe, crearlo con bono inicial (igual que en !trabajar)
  if (!user) {
    user = {
      wallet: 1000,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
    db.users[sender] = user
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  }

  // Forzar valores a número (evita NaN o undefined)
  let wallet = Number(user.wallet) || 0
  let bank   = Number(user.bank)   || 0
  let total  = wallet + bank

  // Mensaje con interpolación correcta usando ${}
  let txt = `🌸 *Tu saldo en Waguri Coins* 🪙

En mano (cartera): **${wallet}**
En banco (seguro): **${bank}**
─────────────────────
Total acumulado: **${total}** ✨

¡Sigue trabajando para aumentar tu fortuna! 🔥`

  conn.reply(m.chat, txt, m)
}

handler.help = ['balance', 'bal', 'dinero', 'saldo']
handler.tags = ['economy']
handler.command = /^(balance|bal|dinero|saldo)$/i
handler.group = true
handler.register = true

export default handler