import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Verificar registro del usuario
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
      await m.react('🔒')
      return conn.reply(m.chat, 
        `🔒 *REGISTRO REQUERIDO*\n\n` +
        `Para usar *${command}* necesitas registrarte:\n\n` +
        `📝 ${usedPrefix}reg nombre.edad\n\n` +
        `Ejemplo: ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18`,
        m
      )
    }

    if (!text.trim()) {
      await m.react('❌')
      return conn.reply(m.chat, 
        `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝘁\n\n` +
        `❀ Por favor, ingresa el nombre o enlace de YouTube.\n\n` +
        `📝 *Ejemplos:*\n` +
        `${usedPrefix}play Bad Bunny\n` +
        `${usedPrefix}play https://youtu.be/...\n` +
        `${usedPrefix}play2 video musical`,
        m
      )
    }
    
    await m.react('🕒')
    
    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
    const search = await yts(query)
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
    
    if (!result) {
      await m.react('❌')
      throw 'ꕥ No se encontraron resultados.'
    }
    
    const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
    
    if (seconds > 1800) {
      await m.react('❌')
      throw '⚠ El contenido supera el límite de duración (30 minutos).'
    }
    
    const vistas = formatViews(views)
    const info = `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝘁\n\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                 `⚡ 𝗧𝗶𝘁𝘂𝗹𝗼: *${title}*\n` +
                 `👁️ 𝗩𝗶𝘀𝘁𝗮𝘀: *${vistas}*\n` +
                 `⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼𝗻: *${timestamp}*\n` +
                 `📅 𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼: *${ago}*\n` +
                 `👤 𝗖𝗮𝗻𝗮𝗹: *${author.name}*\n` +
                 `🔗 𝗘𝗻𝗹𝗮𝗰𝗲: ${url}\n\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `🌸 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝗻𝗱𝗼 𝘁𝘂 𝗮𝗿𝗰𝗵𝗶𝘃𝗼...`
    
    const thumb = (await conn.getFile(thumbnail)).data
    
    // Enviar mensaje con imagen de miniatura
    await conn.sendMessage(m.chat, { 
      image: thumb, 
      caption: info,
      contextInfo: {
        externalAdReply: {
          title: '🎵 YouTube Download',
          body: 'Waguri Bot',
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: m })
    
    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      // Descargar audio
      const audio = await getAud(url)
      if (!audio?.url) {
        await m.react('❌')
        throw '⚠ No se pudo obtener el audio.'
      }
      
      await m.reply(`> ❀ *Audio procesado. Servidor:* \`${audio.api}\``)
      await m.react('✅')
      
      await conn.sendMessage(m.chat, { 
        audio: { url: audio.url }, 
        fileName: `${title.replace(/[<>:"/\\|?*]/g, '')}.mp3`, 
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: title.substring(0, 60),
            body: '🎵 Descargado con Waguri Bot',
            mediaType: 2,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb
          }
        }
      }, { quoted: m })
      
    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      // Descargar video
      const video = await getVid(url)
      if (!video?.url) {
        await m.react('❌')
        throw '⚠ No se pudo obtener el video.'
      }
      
      await m.reply(`> ❀ *Vídeo procesado. Servidor:* \`${video.api}\``)
      await m.react('✅')
      
      await conn.sendFile(m.chat, video.url, 
        `${title.replace(/[<>:"/\\|?*]/g, '')}.mp4`, 
        `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝘁\n\n` +
        `✅ *${title}*\n\n` +
        `📹 Video descargado exitosamente.`,
        m
      )
    }
    
  } catch (e) {
    await m.react('❌')
    return conn.reply(m.chat, 
      `🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝙒𝙖𝙜𝙪𝙧𝙞 𝘽𝙤𝘁\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `❌ *Error*\n\n` +
      `${typeof e === 'string' ? e : e.message || 'Error desconocido'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Reporta el problema con: ${usedPrefix}report`,
      m
    )
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true
handler.register = true

export default handler

async function getAud(url) {
  const apis = [
    { 
      api: 'AlyaBot MP3', 
      endpoint: `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(url)}`, 
      extractor: res => res.data?.dl || res.data?.url || res.dl || res.url 
    },
    { 
      api: 'AlyaBot YTDL', 
      endpoint: `https://rest.alyabotpe.xyz/dl/ytdlv2?url=${encodeURIComponent(url)}&type=audio`, 
      extractor: res => res.data?.dl || res.data?.url || res.dl || res.url 
    }
  ]
  return await fetchFromApis(apis)
}

async function getVid(url) {
  const apis = [
    { 
      api: 'AlyaBot MP4', 
      endpoint: `https://rest.alyabotpe.xyz/dl/ytmp4?url=${encodeURIComponent(url)}`, 
      extractor: res => res.data?.dl || res.data?.url || res.dl || res.url 
    },
    { 
      api: 'AlyaBot YTDL', 
      endpoint: `https://rest.alyabotpe.xyz/dl/ytdlv2?url=${encodeURIComponent(url)}&type=video`, 
      extractor: res => res.data?.dl || res.data?.url || res.dl || res.url 
    }
  ]
  return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      console.log(`[${api}] Intentando: ${endpoint}`)
      
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      
      const res = await fetch(endpoint, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      }).then(r => r.json())
      
      clearTimeout(timeout)
      console.log(`[${api}] Respuesta:`, JSON.stringify(res).substring(0, 200))
      
      const link = extractor(res)
      if (link) {
        console.log(`[${api}] Enlace obtenido: ${link}`)
        return { url: link, api }
      }
      
    } catch (e) {
      console.log(`[${api}] Error:`, e.message)
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return null
}

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}