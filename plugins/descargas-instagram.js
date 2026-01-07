import fetch from 'node-fetch';
import axios from 'axios';

const handler = async (m, { args, conn, usedPrefix, command }) => {
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
            `¡Regístrate para descargar contenido de Instagram! 📸`,
            m
        );
    }

    if (!args[0]) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `🌸 *DESCARGADOR INSTAGRAM* 🌸\n\n` +
            `Por favor, ingresa un enlace de Instagram.\n\n` +
            `📝 *Ejemplos:*\n` +
            `${usedPrefix}${command} https://www.instagram.com/p/...\n` +
            `${usedPrefix}${command} https://www.instagram.com/reel/...\n` +
            `${usedPrefix}${command} https://www.instagram.com/stories/...`,
            m
        );
    }

    try {
        // Enviar reacción de procesando
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const processingMsg = await conn.reply(m.chat, 
            `📸 *DESCARGANDO DE INSTAGRAM...* 📸\n\n` +
            `🔗 *Enlace:* ${args[0].substring(0, 50)}...\n` +
            `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
            `⏳ Procesando contenido...`,
            m
        );

        // Primero intentar con APIs más rápidas
        let mediaData;
        try {
            mediaData = await downloadInstagramFast(args[0]);
        } catch (fastError) {
            console.log('API rápida falló, intentando con ruhend-scraper...');
            // Fallback a ruhend-scraper
            const { igdl } = await import('ruhend-scraper');
            const res = await igdl(args[0]);
            mediaData = res.data;
        }

        if (!mediaData || mediaData.length === 0) {
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
            return conn.reply(m.chat, 
                `😔 *CONTENIDO NO DISPONIBLE*\n\n` +
                `No se pudo descargar el contenido de Instagram.\n\n` +
                `💡 *Posibles causas:*\n` +
                `• El contenido es privado\n` +
                `• El enlace no es válido\n` +
                `• Restricciones de la cuenta\n` +
                `• El contenido fue eliminado`,
                m
            );
        }

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

        // Enviar reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        // Contador para archivos enviados
        let sentCount = 0;
        const totalMedia = mediaData.length;
        
        for (let i = 0; i < mediaData.length; i++) {
            const media = mediaData[i];
            
            if (!media.url) continue;
            
            try {
                // Determinar si es imagen o video
                const isVideo = media.url.includes('.mp4') || media.type === 'video';
                const isImage = media.url.includes('.jpg') || media.url.includes('.jpeg') || media.url.includes('.png') || media.type === 'image';
                
                const caption = `📸 *INSTAGRAM DESCARGADO* 📸\n\n` +
                               `🎯 *Contenido ${i + 1}/${totalMedia}*\n` +
                               `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n` +
                               `🌸 *Descargado por waguri Bot*\n\n` +
                               `✨ ¡Disfruta del contenido!`;
                
                if (isVideo) {
                    await conn.sendMessage(m.chat, {
                        video: { url: media.url },
                        caption: caption,
                        fileName: `instagram_${Date.now()}.mp4`
                    }, { quoted: m });
                } else if (isImage) {
                    await conn.sendMessage(m.chat, {
                        image: { url: media.url },
                        caption: caption
                    }, { quoted: m });
                } else {
                    // Enviar como archivo genérico
                    await conn.sendMessage(m.chat, {
                        document: { url: media.url },
                        fileName: `instagram_${Date.now()}`,
                        mimetype: 'application/octet-stream',
                        caption: caption
                    }, { quoted: m });
                }
                
                sentCount++;
                
                // Pequeña pausa entre envíos para no saturar
                if (i < mediaData.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (mediaError) {
                console.error(`Error enviando medio ${i + 1}:`, mediaError);
                // Continuar con el siguiente medio
            }
        }

        // Mensaje de resumen
        if (sentCount > 0) {
            await conn.reply(m.chat, 
                `✅ *DESCARGA COMPLETADA*\n\n` +
                `📊 *Resumen:*\n` +
                `• Medios encontrados: ${totalMedia}\n` +
                `• Medios enviados: ${sentCount}\n` +
                `• Usuario: ${user.name || conn.getName(m.sender)}\n\n` +
                `¡Contenido descargado exitosamente! 🎉`,
                m
            );
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            await conn.reply(m.chat, 
                `⚠️ *NO SE PUDIERON ENVIAR LOS ARCHIVOS*\n\n` +
                `Se encontraron ${totalMedia} medios pero no se pudieron enviar.\n\n` +
                `🔧 *Posibles causas:*\n` +
                `• Problemas de conexión\n` +
                `• Enlaces inválidos\n` +
                `• Restricciones de tamaño`,
                m
            );
        }

    } catch (error) {
        console.error('Error en descarga de Instagram:', error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❌ *ERROR EN LA DESCARGA*\n\n` +
            `*Detalles:* ${error.message}\n\n` +
            `💡 *Soluciones:*\n` +
            `• Verifica que el enlace sea público\n` +
            `• Intenta con otro enlace\n` +
            `• Verifica tu conexión a internet\n` +
            `• Espera unos minutos e intenta de nuevo`,
            m
        );
    }
};

// Función para descarga rápida de Instagram
async function downloadInstagramFast(url) {
    try {
        console.log('Usando API rápida para Instagram...');
        
        // Intentar con múltiples APIs rápidas
        const apis = [
            // API 1: API pública común
            async () => {
                const response = await fetch(`https://api.pointmp3.com/dl/instagram?url=${encodeURIComponent(url)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 15000
                });
                
                const data = await response.json();
                if (data.media && data.media.length > 0) {
                    return data.media.map(m => ({
                        url: m.url,
                        type: m.type || (m.url.includes('.mp4') ? 'video' : 'image')
                    }));
                }
                throw new Error('No media found');
            },
            
            // API 2: SnapTik API
            async () => {
                const response = await fetch(`https://snaptik.app/abc.php?url=${encodeURIComponent(url)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 15000
                });
                
                const html = await response.text();
                // Extraer URLs de medios del HTML
                const videoMatches = html.match(/href="([^"]*\.mp4[^"]*)"/g);
                const imageMatches = html.match(/src="([^"]*\.(?:jpg|jpeg|png)[^"]*)"/g);
                
                const media = [];
                if (videoMatches) {
                    videoMatches.forEach(match => {
                        const videoUrl = match.replace('href="', '').replace('"', '');
                        if (videoUrl.startsWith('http')) {
                            media.push({ url: videoUrl, type: 'video' });
                        }
                    });
                }
                if (imageMatches) {
                    imageMatches.forEach(match => {
                        const imageUrl = match.replace('src="', '').replace('"', '');
                        if (imageUrl.startsWith('http')) {
                            media.push({ url: imageUrl, type: 'image' });
                        }
                    });
                }
                
                if (media.length > 0) return media;
                throw new Error('No media found in HTML');
            },
            
            // API 3: Savetik API
            async () => {
                const response = await fetch(`https://savetik.co/api/ajaxSearch`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    body: `q=${encodeURIComponent(url)}&lang=en`,
                    timeout: 15000
                });
                
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    const html = data.data;
                    const videoMatch = html.match(/href="([^"]*\.mp4[^"]*)"/);
                    if (videoMatch && videoMatch[1]) {
                        return [{ url: videoMatch[1], type: 'video' }];
                    }
                }
                throw new Error('No video found');
            }
        ];
        
        // Intentar cada API
        for (const api of apis) {
            try {
                const result = await api();
                if (result && result.length > 0) {
                    console.log(`API rápida exitosa, ${result.length} medios encontrados`);
                    return result;
                }
            } catch (apiError) {
                console.log(`API falló: ${apiError.message}`);
                continue;
            }
        }
        
        throw new Error('Todas las APIs rápidas fallaron');
        
    } catch (error) {
        console.error('Error en API rápida:', error);
        throw error;
    }
}

handler.command = ['instagram', 'ig', 'igdl'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig', 'igdl'];
handler.group = true;
handler.register = true;
handler.limit = true;

export default handler;