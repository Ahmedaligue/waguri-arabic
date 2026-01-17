import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json')

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

  // Prevenir NaN
  user.wallet = Number(user.wallet) || 0
  user.bank   = Number(user.bank)   || 0

  // Obtener cantidad del mensaje
  if (!text) {
    return conn.reply(m.chat, `🌸 Usa: *\( {usedPrefix + command} <cantidad>*\nEjemplo: \){usedPrefix + command} 500`, m)
  }

  let cantidad = Number(text.trim())
  if (isNaN(cantidad) || cantidad <= 0) {
    return conn.reply(m.chat, `🌸 La cantidad debe ser un número positivo.`, m)
  }

  if (cantidad > user.wallet) {
    return conn.reply(m.chat, `🌸 No tienes suficientes Waguri Coins en mano.\nTienes solo ${user.wallet} en cartera.`, m)
  }

  // Transferir
  user.wallet -= cantidad
  user.bank += cantidad

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  let txt = `🌸 *¡Depósito realizado con éxito!*

Depositaste **${cantidad} Waguri Coins** 🪙 al banco.

Saldo actual:
En mano: **${user.wallet}**
En banco: **${user.bank}** ✨`

  conn.reply(m.chat, txt, m)
}

handler.help = ['depositar <cantidad>']
handler.tags = ['economy']
handler.command = /^(depositar|dep|deposit)$/i
handler.group = true
handler.register = true

export default handler