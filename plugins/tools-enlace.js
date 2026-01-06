var handler = async (m, { conn }) => {
    let communityLink = 'https://chat.whatsapp.com/EFUkB3vLyAzAc4ZQzLabsp'
    let channelLink = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
    let instagramLink = 'https://www.instagram.com/rufino_felipe.15?igsh=MWE1dnZuYnRmeDFpaA=='
    
    // URL de imagen para el banner
    const pp = 'https://cdn.hostrta.win/fl/85rm.jpg'
    
    let message = `*⌁☍꒷₊˚ 𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 ꒷₊˚⌁☍*\n\n` +
                 `🌸 *ENLACES OFICIALES*\n\n` +
                 `📱 *Grupo Oficial:*\n` +
                 `> \`Enlace:\` ${communityLink}\n\n` +
                 `📢 *Canal de Noticias:*\n` +
                 `> \`Enlace:\` ${channelLink}\n\n` +
                 `📸 *Instagram:*\n` +
                 `> \`Enlace:\` ${instagramLink}\n\n` +
                 `━━━━━━━━━━━━━━━━━━\n` +
                 `*¡Síguenos en todas las redes!* ✨`
    
    // Enviar mensaje con imagen
    await conn.sendMessage(m.chat, { 
        image: { url: pp }, 
        caption: message 
    }, { quoted: m })
}

handler.help = ['links']
handler.tags = ['grupo']
handler.command = ['links', 'link', 'grupo', 'canal', 'redes']
handler.group = true
handler.botAdmin = false

export default handler