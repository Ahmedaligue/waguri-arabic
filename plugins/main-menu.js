import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '❖ WAGURI BOT ❖'
const menuImage = 'https://cdn.hostrta.win/fl/85rm.jpg'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  const uptime = clockString(process.uptime() * 1000)

  let txt = `
╔══════════════════════╗
   ✦ ${botname.toUpperCase()} ✦
╚══════════════════════╝

╭─❖ INFORMACIÓN ❖─╮
│ › Hola, ${name}
│ › Tipo: ${conn.user.jid == global.conn.user.jid ? 'PRINCIPAL' : 'SUB-BOT'}
│ › Activo: ${uptime}
│ › Usuarios: ${totalreg}
│ › Biblioteca: Baileys
│ › Prefijo: [ ${_p} ]
╰─────────────────╯

╭─❖ HERRAMIENTAS ❖─╮
│ • autoadmin - Hace admin al bot
│ • ping - Comprueba latencia
│ • demote - Remueve admin
│ • join - Une al bot a un grupo
│ • quitarprefijo - Elimina prefijo
│ • update - Actualiza el bot
│ • setprefijo - Establece prefijo
│ • bots - Lista de sub-bots
│ • leave - Sale del grupo
│ • reload - Reinicia el bot
│ • setname - Cambia nombre
│ • tag - Menciona a todos
│ • invocar - Invoca miembros
│ • sticker - Crea stickers
│ • kick - Expulsa usuarios
│ • antilink - Anti-enlaces
│ • del - Elimina mensajes
╰──────────────────╯

╭─❖ DIVERTIDOS ❖─╮
│ • doxear - Simula doxeo
│ • facto - Facto aleatorio
│ • piropo - Piropo random
│ • reto - Reto aleatorio
│ • top - Top 10 de categoría
│ • iqtest - Test de IQ
│ • gey - Detecta nivel gay
╰────────────────╯

╭─❖ ANIME REACCIONES ❖─╮
│ • bath - Bañarse
│ • bite - Morder
│ • blush - Sonrojarse
│ • bored - Aburrirse
│ • cry - Llorar
│ • dance - Bailar
│ • hug - Abrazar
│ • kiss - Besar
│ • sleep - Dormir
│ • slap - Cachetada
│ • pensar - Pensar
│ • fumar - Fumar
╰─────────────────────╯

╭─❖ INTELIGENCIA ARTIFICIAL ❖─╮
│ • copilot - Microsoft Copilot
│ • gemini - Google Gemini
│ • gpt - ChatGPT
╰────────────────────────────╯

╭─❖ DESCARGAS ❖─╮
│ • play - YouTube Audio
│ • play2 - YouTube Video
│ • tiktoksearch - TikTok
│ • ig - Instagram
│ • apk - Aplicaciones
│ • pin - Pinterest
╰────────────────╯

╭─❖ RPG Y AVENTURAS ❖─╮
│ • cazar - Misión de caza
│ • contratos - Contratos
│ • aceptar - Aceptar contrato
│ • perfil - Tu perfil
│ • diario - Recompensa diaria
│ • minar - Minar cripto
│ • transferir - Transferir
│ • taller - Tienda mejoras
│ • comprar - Comprar items
│ • duelo - PvP
│ • hack - Hackeo
│ • best - Ranking
│ • inventario - Inventario
╰────────────────────╯

╭─❖ ECONOMÍA ❖─╮
│ • balance - Saldo
│ • daily - Recompensa diaria
│ • trabajar - Trabajar
│ • trabajos - Lista trabajos
│ • casino - Casino
│ • tienda - Tienda
│ • loteria - Lotería
│ • topcoins - Ranking rico
│ • pay - Enviar dinero
│ • economia - Stats económicas
╰────────────────╯

╭─❖ INFORMACIÓN ADICIONAL ❖─╮
│ • creador - Info del creador
│ • repo - Repositorio del bot
│ • link - Enlaces oficiales
│ • reg - Registrarse en el bot
│ • Canal: @whatsapp/channel
│ • Soporte: @soporte
╰─────────────────────────╯

✧ *Usa ${_p}help <comando> para más detalles*
`.trim()

  await conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      mentionedJid: [m.sender, userId],
      forwardingScore: 1,
      externalAdReply: {
        title: channelName,
        body: `Activo por: ${uptime} | Usuarios: ${totalreg}`,
        thumbnailUrl: menuImage,
        sourceUrl: 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'menucompleto', 'comandos', 'helpcompleto', 'allmenu']

export default handler

function clockString(ms) {
  let hours = Math.floor(ms / (1000 * 60 * 60))
  let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  let seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}