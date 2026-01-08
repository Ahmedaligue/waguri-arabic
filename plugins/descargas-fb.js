const handler = async (m, { args, conn, usedPrefix, command }) => {
try {
if (!args[0]) return conn.reply(m.chat, `🌸 *waguri bot* ❀\nPor favor, ingresa un enlace de *Facebook*.\n\nEjemplo: ${usedPrefix + command} https://fb.watch/...`, m)

let videoUrl = null
const url = encodeURIComponent(args[0])
await m.react('🕒')

// Verificar que sea un enlace de Facebook
if (!/(facebook\.com|fb\.watch)/i.test(args[0])) {
return conn.reply(m.chat, `🌸 *waguri bot* ❀\nPor favor, ingresa solo enlaces de *Facebook*.\nEjemplo: ${usedPrefix + command} https://fb.watch/...`, m)
}

// Intentar con el primer servicio (Adonix)
try {
const api1 = `${global.APIs.adonix.url}/download/facebook?apikey=${global.APIs.adonix.key}&url=${url}`
const res1 = await fetch(api1)
const json1 = await res1.json()
if (json1.status && json1.result?.media?.video_hd) {
videoUrl = json1.result.media.video_hd
}
} catch (e) {}

// Si no funciona, intentar con el segundo servicio (Vreden)
if (!videoUrl) {
try {
const api2 = `${global.APIs.vreden.url}/api/fbdownload?url=${url}`
const res2 = await fetch(api2)
const json2 = await res2.json()
if (json2.resultado?.respuesta?.datos?.[0]?.url) {
videoUrl = json2.resultado.respuesta.datos[0].url
}
} catch (e) {}
}

// Si no funciona, intentar con el tercer servicio (Delirius)
if (!videoUrl) {
try {
const api3 = `${global.APIs.delirius.url}/download/facebook?url=${url}`
const res3 = await fetch(api3)
const json3 = await res3.json()
if (json3.status && json3.data?.[0]?.url) {
videoUrl = json3.data[0].url
}
} catch (e) {}
}

if (!videoUrl) {
await m.react('❌')
return conn.reply(m.chat, `🌸 *waguri bot* ❀\nꕥ No se pudo descargar el video de Facebook.\nPuede que:\n• El enlace sea privado\n• El video sea muy largo\n• El servicio esté temporalmente inactivo`, m)
}

// Enviar el video con el nombre del bot
await conn.sendFile(
m.chat, 
videoUrl, 
'facebook_video.mp4', 
`🌸 *waguri bot* ❀\n✅ Video de Facebook descargado\n\nฅ^•ﻌ•^ฅ Descarga completada`, 
m
)

await m.react('✅')

} catch (error) {
await m.react('❌')
console.error('Error en comando facebook:', error)
await conn.reply(m.chat, `🌸 *waguri bot* ❀\n⚠︎ Ocurrió un error al procesar tu solicitud.\n\n> Usa *${usedPrefix}report* para informar este problema.\n\nError: ${error.message}`, m)
}}

handler.command = ['facebook', 'fb', 'facebookdl', 'fbdl']
handler.tags = ['descargas']
handler.help = [
'facebook <enlace>',
'fb <enlace>',
'facebookdl <enlace>',
'fbdl <enlace>'
].map(v => v + '\n▸ Descarga videos de Facebook')
handler.group = true

export default handler