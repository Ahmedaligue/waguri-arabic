import fetch from 'node-fetch';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

const API_KEY = 'stellar-3Tjfq4Rj';
const API_URL = 'https://api.stellarwa.xyz/tools/upload';

async function handler(m, { text, conn, quoted }) {
    // Verificar si hay archivo para subir
    let fileToUpload = null;
    let fileName = '';
    let mimeType = '';
    let fileBuffer = null;

    // Verificar si hay mensaje citado con archivo
    if (quoted && (quoted.mtype === 'imageMessage' || 
                   quoted.mtype === 'videoMessage' || 
                   quoted.mtype === 'audioMessage' || 
                   quoted.mtype === 'documentMessage')) {
        
        try {
            // Enviar reacción de reloj (⌚)
            await conn.sendReaction(m.chat, m.key, '⌚');
            
            const processingMsg = await conn.sendMessage(
                m.chat,
                {
                    text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n📤 *Preparando archivo para subir...*\n> Por favor, espera...`
                },
                { quoted: m }
            );

            // Descargar el archivo del mensaje citado
            fileBuffer = await quoted.download();
            
            // Detectar tipo de archivo
            const fileType = await fileTypeFromBuffer(fileBuffer);
            mimeType = fileType ? fileType.mime : quoted.mimetype || 'application/octet-stream';
            
            // Asignar nombre de archivo
            if (quoted.mtype === 'imageMessage') {
                fileName = quoted.fileName || `image_${Date.now()}.${fileType ? fileType.ext : 'jpg'}`;
            } else if (quoted.mtype === 'videoMessage') {
                fileName = quoted.fileName || `video_${Date.now()}.${fileType ? fileType.ext : 'mp4'}`;
            } else if (quoted.mtype === 'audioMessage') {
                fileName = quoted.fileName || `audio_${Date.now()}.mp3`;
            } else if (quoted.mtype === 'documentMessage') {
                fileName = quoted.fileName || `document_${Date.now()}.${fileType ? fileType.ext : 'bin'}`;
            }
            
            fileToUpload = fileBuffer;
            
            // Actualizar mensaje
            await conn.sendMessage(
                m.chat,
                {
                    text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n📤 *Subiendo archivo...*\n> Nombre: ${fileName}\n> Tipo: ${mimeType}\n> Tamaño: ${formatBytes(fileBuffer.length)}\n\n⏳ *Esto puede tomar unos segundos...*`,
                    edit: processingMsg.key
                }
            );
            
        } catch (error) {
            console.error('Error al preparar archivo:', error);
            return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n❌ *Error al preparar el archivo*\n> ${error.message}`);
        }
    } 
    // Verificar si el mensaje actual contiene archivo
    else if (m.mtype === 'imageMessage' || 
             m.mtype === 'videoMessage' || 
             m.mtype === 'audioMessage' || 
             m.mtype === 'documentMessage') {
        
        try {
            // Enviar reacción de reloj (⌚)
            await conn.sendReaction(m.chat, m.key, '⌚');
            
            const processingMsg = await conn.sendMessage(
                m.chat,
                {
                    text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n📤 *Preparando archivo para subir...*\n> Por favor, espera...`
                },
                { quoted: m }
            );

            // Descargar el archivo del mensaje actual
            fileBuffer = await m.download();
            
            // Detectar tipo de archivo
            const fileType = await fileTypeFromBuffer(fileBuffer);
            mimeType = fileType ? fileType.mime : m.mimetype || 'application/octet-stream';
            
            // Asignar nombre de archivo
            if (m.mtype === 'imageMessage') {
                fileName = m.fileName || `image_${Date.now()}.${fileType ? fileType.ext : 'jpg'}`;
            } else if (m.mtype === 'videoMessage') {
                fileName = m.fileName || `video_${Date.now()}.${fileType ? fileType.ext : 'mp4'}`;
            } else if (m.mtype === 'audioMessage') {
                fileName = m.fileName || `audio_${Date.now()}.mp3`;
            } else if (m.mtype === 'documentMessage') {
                fileName = m.fileName || `document_${Date.now()}.${fileType ? fileType.ext : 'bin'}`;
            }
            
            fileToUpload = fileBuffer;
            
            // Actualizar mensaje
            await conn.sendMessage(
                m.chat,
                {
                    text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n📤 *Subiendo archivo...*\n> Nombre: ${fileName}\n> Tipo: ${mimeType}\n> Tamaño: ${formatBytes(fileBuffer.length)}\n\n⏳ *Esto puede tomar unos segundos...*`,
                    edit: processingMsg.key
                }
            );
            
        } catch (error) {
            console.error('Error al preparar archivo:', error);
            return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n❌ *Error al preparar el archivo*\n> ${error.message}`);
        }
    }
    // Si no hay archivo, mostrar instrucciones
    else {
        const helpText = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n📤 *COMANDO UPLOAD*\n\n` +
                        `*Descripción:* Sube archivos y obtén una URL pública\n\n` +
                        `*Formas de uso:*\n` +
                        `1. *Respondiendo a un archivo:*\n` +
                        `   Envía o responde a un archivo (imagen, video, audio, documento) con el comando:\n` +
                        `   \`.upload\` o \`.up\`\n\n` +
                        `2. *Con archivo adjunto:*\n` +
                        `   Adjunta un archivo en el mismo mensaje que el comando:\n` +
                        `   \`.upload\` + archivo adjunto\n\n` +
                        `*Tipos de archivo soportados:*\n` +
                        `📷 Imágenes (jpg, png, gif, etc.)\n` +
                        `🎥 Videos (mp4, mov, avi, etc.)\n` +
                        `🎵 Audio (mp3, wav, ogg, etc.)\n` +
                        `📄 Documentos (pdf, txt, doc, etc.)\n\n` +
                        `*Ejemplo:*\n` +
                        `Responde a una imagen con: .upload`;
        
        return m.reply(helpText);
    }

    // Si hay archivo para subir, proceder con la API
    if (fileToUpload) {
        try {
            // Preparar FormData
            const formData = new FormData();
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: mimeType
            });
            
            // Configurar headers
            const headers = {
                ...formData.getHeaders(),
                'apikey': API_KEY
            };
            
            // Hacer la petición a la API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`❌ Error en la API: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Verificar respuesta de la API
            if (data.status === false || data.error) {
                throw new Error(data.message || data.error || 'Error desconocido de la API');
            }
            
            const result = data.result || data;
            const fileUrl = result.url || result.link || result.downloadUrl;
            
            if (!fileUrl) {
                throw new Error('❌ No se recibió una URL válida de la API');
            }
            
            // Crear mensaje de éxito
            const successMessage = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                                 `✅ *ARCHIVO SUBIDO EXITOSAMENTE*\n\n` +
                                 `📌 *Información del archivo:*\n` +
                                 `📄 *Nombre:* ${fileName}\n` +
                                 `📊 *Tamaño:* ${formatBytes(fileBuffer.length)}\n` +
                                 `📝 *Tipo:* ${mimeType}\n\n` +
                                 `🔗 *URL Pública:*\n\`\`\`${fileUrl}\`\`\`\n\n` +
                                 `*Enlaces rápidos:*\n` +
                                 `🔗 [Abrir en navegador](${fileUrl})\n` +
                                 `📥 [Descargar directamente](${fileUrl})\n\n` +
                                 `⚠️ *Nota:* La URL estará disponible temporalmente\n` +
                                 `*Tiempo de expiración:* ${result.expiry || 'Desconocido'}`;
            
            // Enviar mensaje con la URL
            await conn.sendMessage(
                m.chat,
                {
                    text: successMessage
                },
                { quoted: m }
            );
            
            // Enviar reacción de éxito (✅)
            try {
                await conn.sendReaction(m.chat, m.key, '✅');
            } catch (error) {
                console.error('Error enviando reacción de éxito:', error);
            }
            
        } catch (error) {
            console.error('Error al subir archivo:', error);
            
            // Mensaje de error
            const errorMessage = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧 🌸*\n\n` +
                               `❌ *ERROR AL SUBIR ARCHIVO*\n\n` +
                               `> *Detalles:* ${error.message}\n\n` +
                               `*Posibles causas:*\n` +
                               `• El archivo es muy grande\n` +
                               `• Tipo de archivo no soportado\n` +
                               `• Problema temporal del servidor\n` +
                               `• Límite de uso excedido\n\n` +
                               `*Intenta con:*\n` +
                               `• Un archivo más pequeño\n` +
                               `• Diferente tipo de archivo\n` +
                               `• Esperar unos minutos`;
            
            await conn.sendMessage(
                m.chat,
                {
                    text: errorMessage
                },
                { quoted: m }
            );
            
            // Enviar reacción de error (❌)
            try {
                await conn.sendReaction(m.chat, m.key, '❌');
            } catch (reactionError) {
                console.error('Error enviando reacción de error:', reactionError);
            }
        }
    }
}

// Función para formatear bytes a tamaño legible
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

handler.help = ["upload", "up <archivo>"];
handler.tags = ["herramientas", "utilidades"];
handler.command = ["upload", "up", "subir"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;