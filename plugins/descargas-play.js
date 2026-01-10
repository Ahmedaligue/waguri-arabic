import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users?.[m.sender];
  if (!user || !user.registered) {
    try {
      await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
    } catch (e) {}
    return m.reply(
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para descargar música y videos! 🎵`
    )
  }

  try {
    if (!text) {
      try {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      } catch (e) {}
      return m.reply(
        `🌸 *WAGURI BOT - DESCARGAS* 🌸\n\n` +
        `Por favor, ingresa el nombre o enlace de YouTube.\n\n` +
        `📝 *Ejemplos:*\n` +
        `${usedPrefix}play Bad Bunny\n` +
        `${usedPrefix}play https://youtu.be/...\n` +
        `${usedPrefix}ytmp4 nombre del video\n\n` +
        `✨ *Funciones disponibles:*\n` +
        `• play / yta / ytmp3 - Audio MP3\n` +
        `• play2 / ytv / ytmp4 - Video MP4`
      )
    }

    // Enviar reacción de procesando
    try {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    } catch (e) {}

    const processingMsg = await m.reply(
      `🎵 *BUSCANDO EN YOUTUBE...* 🎵\n\n` +
      `🔍 *Búsqueda:* "${text}"\n` +
      `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
      `🌸 Procesando solicitud...`
    )

    // Buscar video
    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
    
    let search
    try {
      search = await yts(query)
    } catch (searchError) {
      throw '❌ Error al buscar en YouTube. Intenta con otro término.'
    }
    
    if (!search || !search.videos || search.videos.length === 0) {
      throw '🌸 No se encontraron resultados para tu búsqueda.'
    }
    
    const result = videoMatch 
      ? search.videos.find(v => v.videoId === videoMatch[1]) || search.videos[0]
      : search.videos[0]
    
    if (!result) {
      throw '🌸 No se pudo encontrar el video específico.'
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = result
    
    // Verificar duración máxima (30 minutos = 1800 segundos)
    if (result.seconds > 1800) {
      throw '⚠️ El video supera el límite de 30 minutos.\nSolo se permiten videos de hasta 30 minutos.'
    }

    const vistas = formatViews(views)
    
    const info = `🌸 *WAGURI BOT - YOUTUBE DOWNLOAD* 🌸\n\n` +
                `🎵 *Título:* ${title}\n` +
                `👤 *Canal:* ${author?.name || 'Desconocido'}\n` +
                `👁️ *Vistas:* ${vistas}\n` +
                `⏱️ *Duración:* ${timestamp}\n` +
                `📅 *Publicado:* ${ago}\n` +
                `🔗 *Enlace:* ${url}\n\n` +
                `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n` +
                `🌸 *Procesando descarga...*`

    // Intentar obtener thumbnail
    let thumbBuffer
    try {
      const thumbRes = await fetch(thumbnail)
      thumbBuffer = Buffer.from(await thumbRes.arrayBuffer())
    } catch (e) {
      thumbBuffer = null
    }

    // Enviar información del video
    if (thumbBuffer) {
      await conn.sendMessage(m.chat, {
        image: thumbBuffer,
        caption: info
      }, { quoted: m })
    } else {
      await m.reply(info)
    }

    // Determinar si es audio o video
    const isAudio = ['play', 'yta', 'ytmp3', 'playaudio'].includes(command)
    const isVideo = ['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)

    if (isAudio) {
      const audioMsg = await m.reply(
        `🎧 *PROCESANDO AUDIO...* 🎧\n\n` +
        `🎵 *Título:* ${title}\n` +
        `⏱️ *Duración:* ${timestamp}\n\n` +
        `🌸 Descargando audio MP3...`
      )

      const audio = await getAudio(url)
      if (!audio?.url) {
        throw '❌ No se pudo descargar el audio. Intenta con otro video.'
      }

      // Enviar reacción de éxito
      try {
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } catch (e) {}

      await m.reply(
        `✅ *AUDIO LISTO* ✅\n\n` +
        `🎵 *Título:* ${title}\n` +
        `🔄 *Servidor:* ${audio.api}\n` +
        `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
        `🌸 Enviando audio...`
      )

      // Enviar audio
      await conn.sendMessage(m.chat, {
        audio: { url: audio.url },
        mimetype: 'audio/mpeg',
        fileName: `${cleanFilename(title)}.mp3`
      }, { quoted: m })

    } else if (isVideo) {
      const videoMsg = await m.reply(
        `🎬 *PROCESANDO VIDEO...* 🎬\n\n` +
        `🎵 *Título:* ${title}\n` +
        `⏱️ *Duración:* ${timestamp}\n\n` +
        `🌸 Descargando video MP4...`
      )

      const video = await getVideo(url)
      if (!video?.url) {
        throw '❌ No se pudo descargar el video. Intenta con otro video.'
      }

      // Enviar reacción de éxito
      try {
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } catch (e) {}

      await m.reply(
        `✅ *VIDEO LISTO* ✅\n\n` +
        `🎵 *Título:* ${title}\n` +
        `🔄 *Servidor:* ${video.api}\n` +
        `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
        `🌸 Enviando video...`
      )

      // Enviar video
      await conn.sendMessage(m.chat, {
        video: { url: video.url },
        caption: `🌸 *WAGURI BOT*\n\n🎬 ${title}\n👤 ${user.name || conn.getName(m.sender)}`,
        fileName: `${cleanFilename(title)}.mp4`
      }, { quoted: m })

    } else {
      throw `❌ Comando no reconocido: ${command}`
    }

  } catch (error) {
    console.error('Error en play command:', error)
    
    try {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    } catch (e) {}
    
    return m.reply(
      `⚠️ *ERROR EN LA DESCARGA* ⚠️\n\n` +
      `${error.message || error}\n\n` +
      `🔧 *Solución:*\n` +
      `• Verifica el nombre o enlace\n` +
      `• Intenta con otro video\n` +
      `• Espera unos minutos\n` +
      `• Reporta el problema si persiste`
    )
  }
}

// Funciones de descarga simplificadas
async function getAudio(url) {
  // API simple y confiable para audio
  const apis = [
    {
      api: 'TikDown',
      endpoint: `https://api.tikdown.app/ytmp3?url=${encodeURIComponent(url)}`,
      extractor: res => res.download_url || res.url
    },
    {
      api: 'Alya',
      endpoint: `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=stellar-t1opU0P4`,
      extractor: res => res.data?.url || res.data?.dl
    },
    {
      api: 'Stellar',
      endpoint: `https://api.stellarwa.xyz/dl/ytmp3?url=${encodeURIComponent(url)}`,
      extractor: res => res.data?.url || res.url
    }
  ]
  
  return await fetchFromApis(apis)
}

async function getVideo(url) {
  // API simple y confiable para video
  const apis = [
    {
      api: 'TikDown',
      endpoint: `https://api.tikdown.app/ytmp4?url=${encodeURIComponent(url)}`,
      extractor: res => res.download_url || res.url
    },
    {
      api: 'Alya',
      endpoint: `https://rest.alyabotpe.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&key=stellar-t1opU0P4&quality=360`,
      extractor: res => res.data?.url || res.data?.dl
    },
    {
      api: 'Stellar',
      endpoint: `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(url)}`,
      extractor: res => res.data?.url || res.url
    }
  ]
  
  return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      console.log(`Intentando con API: ${api}`)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        console.log(`API ${api} respondió con error: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      console.log(`Respuesta de ${api}:`, data)
      
      const url = extractor(data)
      if (url && url.startsWith('http')) {
        console.log(`✅ Éxito con API: ${api}, URL: ${url}`)
        return { url, api }
      }
      
    } catch (error) {
      console.log(`Error con API ${api}:`, error.message)
      continue
    }
    
    // Pequeña pausa entre APIs
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('❌ Todas las APIs fallaron')
  return null
}

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
  return views.toString()
}

function cleanFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

handler.help = ['play', 'yta', 'ytmp3', 'playaudio', 'play2', 'ytv', 'ytmp4', 'mp4']
handler.tags = ['descargas']
handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
handler.group = true
handler.register = true

export default handler