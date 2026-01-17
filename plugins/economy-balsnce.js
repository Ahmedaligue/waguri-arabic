// by Rufino 

import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, usedPrefix, command }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}

  let user = db.users[m.sender]

  // Si no existe el usuario → crearlo con bono inicial (igual que en work)
  if (!user) {
    user = db.users[m.sender] = {
      wallet: 1000,   // bono de bienvenida como en !trabajar
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)) // guardar inmediatamente
  }

  // Forzar números (evita NaN o undefined)
  let wallet = Number(user.wallet) || 0
  let bank   = Number(user.bank)   || 0
  let total  = wallet + bank

  let txt = `🌸 *Tu saldo en Waguri Coins* 🪙

En mano (cartera): **${wallet}**
En banco (seguro): **${bank}**
─────────────────────
Total acumulado: **${total}** ✨

¡Sigue trabajando y creciendo tu fortuna! 🔥`

  conn.reply(m.chat, txt, m)
}

handler.help = ['balance', 'bal', 'dinero']
handler.tags = ['economy']
handler.command = /^(balance|bal|dinero|saldo)$/i
handler.group = true
handler.register = true

export default handler