import axios from 'axios';
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  // Verificar si el usuario está registrado
  const user = global.db.data.users[message.sender];
  if (!user || !user.registered) {
    await conn.sendMessage(message.chat, { react: { text: "🔒", key: message.key } });
    return conn.reply(message.chat, 
      `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
      `Para usar este comando necesitas estar registrado.\n\n` +
      `📋 *Regístrate con:*\n` +
      `${usedPrefix}reg nombre.edad\n\n` +
      `*Ejemplo:* ${usedPrefix}reg ${conn.getName(message.sender) || 'Usuario'}.18\n\n` +
      `¡Regístrate para desbloquear todas las funciones! 🌟`,
      message
    );
  }

  // Verificar si se proporcionó texto
  if (!text) {
    await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
    return conn.reply(message.chat, 
      `🌸 *BÚSQUEDA TIKTOK* 🌸\n\n` +
      `Por favor, ingrese un texto para buscar en TikTok.\n\n` +
      `📝 *Uso:* ${usedPrefix + command} <texto>\n` +
      `*Ejemplo:* ${usedPrefix + command} música trending`,
      message
    );
  }

  // Función para crear mensaje de video
  async function createVideoMessage(url) {
    try {
      const { videoMessage } = await generateWAMessageContent({
        video: { url }
      }, {
        upload: conn.waUploadToServer
      });
      return videoMessage;
    } catch (error) {
      console.error('Error creando videoMessage:', error);
      return null;
    }
  }

  // Función para mezclar array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    // Enviar reacción de "procesando"
    await conn.sendMessage(message.chat, { react: { text: "⏳", key: message.key } });
    
    // Mensaje de procesamiento
    const processingMsg = await conn.reply(message.chat, 
      `🔍 *BUSCANDO EN TIKTOK...* 🔍\n` +
      `*Búsqueda:* "${text}"\n\n` +
      `⏳ Buscando videos... Por favor espera.`,
      message
    );

    // Configurar headers con API key
    const apiKey = 'stellar-3Tjfq4Rj';
    const apiUrl = `https://api.stellarwa.xyz/dl/tiktok?query=${encodeURIComponent(text)}`;
    
    console.log(`Realizando búsqueda a: ${apiUrl}`);
    
    // Realizar la búsqueda con la nueva API
    let { data } = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 45000 // 45 segundos timeout
    });
    
    console.log('Respuesta de la API:', data);
    
    // Validar respuesta de la API
    if (!data || !data.data || !Array.isArray(data.data)) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `😔 *NO SE ENCONTRARON RESULTADOS*\n\n` +
        `La API no devolvió resultados válidos para: "${text}"\n\n` +
        `💡 *Posibles causas:*\n` +
        `• La API puede estar temporalmente fuera de servicio\n` +
        `• Intenta con otra búsqueda\n` +
        `• Verifica tu conexión a internet`,
        message
      );
    }

    let searchResults = data.data;
    
    // Filtrar resultados válidos
    const validResults = searchResults.filter(result => {
      return result && 
             result.video && 
             result.video.noWatermark && 
             typeof result.video.noWatermark === 'string' && 
             result.video.noWatermark.startsWith('http');
    });
    
    if (validResults.length === 0) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `⚠️ *VIDEOS NO DISPONIBLES*\n\n` +
        `Se encontraron resultados pero no hay videos disponibles para: "${text}"\n\n` +
        `• Los videos pueden tener restricciones\n` +
        `• Intenta con otra búsqueda`,
        message
      );
    }
    
    shuffleArray(validResults);
    let topResults = validResults.slice(0, Math.min(5, validResults.length));

    // Preparar los resultados
    let results = [];
    for (let i = 0; i < topResults.length; i++) {
      let result = topResults[i];
      try {
        const videoMsg = await createVideoMessage(result.video.noWatermark);
        if (videoMsg) {
          results.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
              text: `👤 ${result.author?.nickname || 'Usuario'} • ❤️ ${result.stats?.diggCount || 0}`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: result.desc ? 
                (result.desc.length > 40 ? result.desc.substring(0, 40) + '...' : result.desc) :
                `Video de TikTok ${i + 1}`,
              hasMediaAttachment: true,
              videoMessage: videoMsg
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🎬 Ver en TikTok",
                    url: result.share_url || `https://www.tiktok.com/@${result.author?.uniqueId || 'user'}`,
                    merchant_url: ""
                  })
                }
              ]
            })
          });
        }
      } catch (error) {
        console.error(`Error procesando video ${i + 1}:`, error);
      }
    }

    if (results.length === 0) {
      await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
      return conn.reply(message.chat, 
        `⚠️ *ERROR AL PROCESAR VIDEOS*\n\n` +
        `No se pudieron cargar los videos encontrados.\n` +
        `Intenta con otra búsqueda o más tarde.`,
        message
      );
    }

    // Eliminar mensaje de procesamiento si existe
    if (processingMsg && processingMsg.key && processingMsg.key.id) {
      try {
        await conn.sendMessage(message.chat, { 
          delete: { 
            remoteJid: message.chat, 
            fromMe: true, 
            id: processingMsg.key.id
          } 
        });
      } catch (e) {
        console.log('No se pudo eliminar mensaje de procesamiento:', e);
      }
    }

    // Enviar reacción de éxito
    await conn.sendMessage(message.chat, { react: { text: "✅", key: message.key } });

    // Crear y enviar el carrusel de resultados
    const messageContent = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🎬 *RESULTADOS TIKTOK* 🎬\n\n` +
                    `🔍 *Búsqueda:* "${text}"\n` +
                    `📊 *Videos encontrados:* ${results.length}\n` +
                    `👤 *Tu registro:* ${user.name || conn.getName(message.sender)}\n\n` +
                    `*Desliza para ver los videos 👉*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `Powered by Stellar API • ${new Date().toLocaleDateString('es-ES')}`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: [...results]
            })
          })
        }
      }
    }, {
      quoted: message
    });

    await conn.relayMessage(message.chat, messageContent.message, {
      messageId: messageContent.key.id
    });

    // Mensaje de éxito adicional
    await conn.reply(message.chat, 
      `✨ *BÚSQUEDA EXITOSA* ✨\n\n` +
      `✅ Se enviaron ${results.length} videos para: "${text}"\n\n` +
      `📱 *Cómo usar:*\n` +
      `• Desliza para ver todos los videos\n` +
      `• Toca "Ver en TikTok" para abrir el original\n` +
      `• Los videos son de una sola vista\n\n` +
      `🔍 *¿Buscar algo más?*\n` +
      `Usa: ${usedPrefix + command} <texto>`,
      message
    );

  } catch (error) {
    // Enviar reacción de error
    await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
    
    console.error('Error completo en tiktoksearch:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = `⚠️ *ERROR EN LA BÚSQUEDA*\n\n`;
    
    if (error.response) {
      // Error de respuesta HTTP
      if (error.response.status === 401) {
        errorMessage += `• Error de autenticación con la API\n`;
        errorMessage += `• La API key puede no ser válida\n`;
      } else if (error.response.status === 429) {
        errorMessage += `• Límite de solicitudes excedido\n`;
        errorMessage += `• Espera unos minutos e intenta de nuevo\n`;
      } else if (error.response.status === 404) {
        errorMessage += `• La API de búsqueda no está disponible\n`;
      } else {
        errorMessage += `• Error HTTP ${error.response.status}\n`;
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += `• No se pudo conectar con la API\n`;
      errorMessage += `• El servicio puede estar caído\n`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage += `• La búsqueda tardó demasiado\n`;
      errorMessage += `• Intenta con un término más específico\n`;
    } else if (error.message?.includes('timeout')) {
      errorMessage += `• Tiempo de espera agotado\n`;
    } else {
      errorMessage += `• Error: ${error.message || 'Desconocido'}\n`;
    }
    
    errorMessage += `\n🔧 *Solución:*\n`;
    errorMessage += `• Verifica tu conexión a internet\n`;
    errorMessage += `• Intenta con otra búsqueda\n`;
    errorMessage += `• Espera 1-2 minutos\n`;
    errorMessage += `• Reporta el problema si persiste\n`;
    
    await conn.reply(message.chat, errorMessage, message);
  }
};

// Configuración del comando
handler.help = ["tiktoksearch <texto>"];
handler.register = true;
handler.group = true;
handler.tags = ["buscador", "entretenimiento"];
handler.command = ["tiktoksearch", "ttss", "tiktoks", "buscatiktok"];
handler.premium = false;
handler.limit = true;
handler.cooldown = 15000; // 15 segundos de cooldown

export default handler;