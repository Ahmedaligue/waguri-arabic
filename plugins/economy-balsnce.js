import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn }) => {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}')
  if (!db.users) db.users = {}
  
  let user = db.users[m.sender]
  if (!user) {
    user = db.users[m.sender] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    }
  }

  // Prevenir NaN o valores raros
  user.wallet = Number(user.wallet) || 0
  user.bank   = Number(user.bank)   || 0

  let total = user.wallet + user.bank

  let txt = `🌸 *Tu saldo en Waguri Coins* 🪙

En mano: **${user.wallet}**
En banco: **${user.bank}**
──────────────────
Total: **${total} Waguri Coins** ✨`

  conn.reply(m.chat, txt, m)
}

handler.help = ['balance', 'bal']
handler.tags = ['economy']
handler.command = /^(balance|bal)$/i
handler.group = true
handler.register = true

export default handler