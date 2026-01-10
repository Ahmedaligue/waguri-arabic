import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users[m.sender];
  if (!user || !user.registered) {
    await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
    return conn.reply(m.chat, 
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para descargar música y videos! 🎵`,
      m
    );
  }

  try {
    if (!text.trim()) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return conn.reply(m.chat, 
        `🌸 *WAGURI BOT - DESCARGAS* 🌸\n\n` +
        `Por favor, ingresa el nombre o enlace de YouTube.\n\n` +
        `📝 *Ejemplos:*\n` +
        `${usedPrefix}play Bad Bunny\n` +
        `${usedPrefix}play https://youtu.be/...\n` +
        `${usedPrefix}ytmp4 nombre del video\n\n` +
        `✨ *Funciones disponibles:*\n` +
        `• play / yta / ytmp3 - Audio MP3\n` +
        `• play2 / ytv / ytmp4 - Video MP4`,
        m
      )
    }

    // Enviar reacción de procesando
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const processingMsg = await conn.reply(m.chat, 
      `🎵 *BUSCANDO EN YOUTUBE...* 🎵\n\n` +
      `🔍 *Búsqueda:* "${text}"\n` +
      `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
      `🌸 Procesando solicitud...`,
      m
    );

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
    const search = await yts(query)
    
    const result = videoMatch ? 
      search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : 
      search.all[0]
    
    if (!result) {
      // Eliminar mensaje de procesamiento
      if (processingMsg && processingMsg.key && processingMsg.key.id) {
        try {
          await conn.sendMessage(m.chat, { 
            delete: { 
              remoteJid: m.chat, 
              fromMe: true, 
              id: processingMsg.key.id
            } 
          });
        } catch (e) {}
      }
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      throw '🌸 *No se encontraron resultados para tu búsqueda.*'
    }

    const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
    
    if (seconds > 1800) {
      // Eliminar mensaje de procesamiento
      if (processingMsg && processingMsg.key && processingMsg.key.id) {
        try {
          await conn.sendMessage(m.chat, { 
            delete: { 
              remoteJid: m.chat, 
              fromMe: true, 
              id: processingMsg.key.id
            } 
          });
        } catch (e) {}
      }
      await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
      throw '⚠️ *El video supera el límite de 30 minutos.*\n\nSolo se permiten videos de hasta 30 minutos.'
    }

    const vistas = formatViews(views)
    
    const info = `🌸 *WAGURI BOT - YOUTUBE DOWNLOAD* 🌸\n\n` +
                `🎵 *Título:* ${title}\n` +
                `👤 *Canal:* ${author.name}\n` +
                `👁️ *Vistas:* ${vistas}\n` +
                `⏱️ *Duración:* ${timestamp}\n` +
                `📅 *Publicado:* ${ago}\n` +
                `🔗 *Enlace:* ${url}\n\n` +
                `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n` +
                `🌸 *Procesando descarga...*`

    const thumb = (await conn.getFile(thumbnail))?.data
    
    // Eliminar mensaje de procesamiento
    if (processingMsg && processingMsg.key && processingMsg.key.id) {
      try {
        await conn.sendMessage(m.chat, { 
          delete: { 
            remoteJid: m.chat, 
            fromMe: true, 
            id: processingMsg.key.id
          } 
        });
      } catch (e) {}
    }

    await conn.sendMessage(m.chat, { 
      image: thumb, 
      caption: info 
    }, { quoted: m })

    // Enviar reacción de búsqueda exitosa
    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      const audioMsg = await conn.reply(m.chat, 
        `🎧 *PROCESANDO AUDIO...* 🎧\n\n` +
        `🎵 *Título:* ${title}\n` +
        `⏱️ *Duración:* ${timestamp}\n\n` +
        `🌸 Descargando audio MP3...`,
        m
      )

      const audio = await getAud(url)
      if (!audio?.url) {
        // Eliminar mensaje de audio
        if (audioMsg && audioMsg.key && audioMsg.key.id) {
          try {
            await conn.sendMessage(m.chat, { 
              delete: { 
                remoteJid: m.chat, 
                fromMe: true, 
                id: audioMsg.key.id
              } 
            });
          } catch (e) {}
        }
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        throw '⚠️ *No se pudo obtener el audio.*\n\nIntenta con otro video o más tarde.'
      }

      // Eliminar mensaje de audio
      if (audioMsg && audioMsg.key && audioMsg.key.id) {
        try {
          await conn.sendMessage(m.chat, { 
            delete: { 
              remoteJid: m.chat, 
              fromMe: true, 
              id: audioMsg.key.id
            } 
          });
        } catch (e) {}
      }

      await conn.reply(m.chat, 
        `✅ *AUDIO LISTO* ✅\n\n` +
        `🎵 *Título:* ${title}\n` +
        `🔄 *Servidor:* ${audio.api}\n` +
        `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
        `🌸 Enviando audio...`,
        m
      )

      // Enviar reacción de éxito
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

      await conn.sendMessage(m.chat, { 
        audio: { url: audio.url }, 
        fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`, 
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      const videoMsg = await conn.reply(m.chat, 
        `🎬 *PROCESANDO VIDEO...* 🎬\n\n` +
        `🎵 *Título:* ${title}\n` +
        `⏱️ *Duración:* ${timestamp}\n\n` +
        `🌸 Descargando video MP4...`,
        m
      )

      const video = await getVid(url)
      if (!video?.url) {
        // Eliminar mensaje de video
        if (videoMsg && videoMsg.key && videoMsg.key.id) {
          try {
            await conn.sendMessage(m.chat, { 
              delete: { 
                remoteJid: m.chat, 
                fromMe: true, 
                id: videoMsg.key.id
              } 
            });
          } catch (e) {}
        }
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        throw '⚠️ *No se pudo obtener el video.*\n\nIntenta con otro video o más tarde.'
      }

      // Eliminar mensaje de video
      if (videoMsg && videoMsg.key && videoMsg.key.id) {
        try {
          await conn.sendMessage(m.chat, { 
            delete: { 
              remoteJid: m.chat, 
              fromMe: true, 
              id: videoMsg.key.id
            } 
          });
        } catch (e) {}
      }

      await conn.reply(m.chat, 
        `✅ *VIDEO LISTO* ✅\n\n` +
        `🎵 *Título:* ${title}\n` +
        `🔄 *Servidor:* ${video.api}\n` +
        `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
        `🌸 Enviando video...`,
        m
      )

      // Enviar reacción de éxito
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

      await conn.sendFile(m.chat, video.url, 
        `${title.replace(/[^\w\s]/gi, '')}.mp4`, 
        `🌸 *WAGURI BOT - VIDEO DESCARGADO* 🌸\n\n` +
        `🎬 *Título:* ${title}\n` +
        `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n` +
        `✨ *¡Disfruta del video!*`, 
        m
      )
    }

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return conn.reply(m.chat, 
      `⚠️ *ERROR EN LA DESCARGA* ⚠️\n\n` +
      `${typeof e === 'string' ? e : e.message || 'Error desconocido'}\n\n` +
      `🔧 *Solución:*\n` +
      `• Verifica el nombre o enlace\n` +
      `• Intenta con otro video\n` +
      `• Espera unos minutos\n` +
      `• Usa *${usedPrefix}report* para informar\n\n` +
      `🌸 *waguri Bot*`,
      m
    )
  }
}

// Funciones de descarga (igual que tu código original)
async function getAud(url) {
  const apis = [
    { api: 'Adonix', endpoint: `${global.APIs.adonix.url}/download/ytaudio?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor: res => res.data?.url },
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download_url },
    { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.link },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`, extractor: res => res.result?.download?.url },
    { api: 'Vreden v2', endpoint: `${global.APIs.vreden.url}/api/v1/download/play/audio?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download }
  ]
  return await fetchFromApis(apis)
}

async function getVid(url) {
  const apis = [
    { api: 'Adonix', endpoint: `${global.APIs.adonix.url}/download/ytvideo?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor: res => res.data?.url },
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4?url=${encodeURIComponent(url)}&resolution=360p`, extractor: res => res.data?.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4v2?url=${encodeURIComponent(url)}&resolution=360`, extractor: res => res.data?.download_url },
    { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.result?.formats?.[0]?.url },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download?.url },
    { api: 'Vreden v2', endpoint: `${global.APIs.vreden.url}/api/v1/download/play/video?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp4?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download }
  ]
  return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500))
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

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true
handler.register = true

export default handler      