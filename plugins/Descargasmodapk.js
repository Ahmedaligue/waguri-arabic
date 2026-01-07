import { search, download } from 'aptoide-scraper'

var handler = async (m, { conn, usedPrefix, command, text }) => {
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
            `¡Regístrate para descargar APKs modded de Aptoide! 📱`,
            m
        );
    }

    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `❀ *DESCARGADOR APTOIDE* ❀\n\n` +
            `Por favor, ingrese el nombre de la APK para descargarlo.\n\n` +
            `📝 *Uso:* ${usedPrefix}${command} <nombre>\n` +
            `*Ejemplos:*\n` +
            `${usedPrefix}${command} WhatsApp Plus\n` +
            `${usedPrefix}${command} Spotify Premium\n` +
            `${usedPrefix}${command} YouTube ReVanced`,
            m
        )
    }
    
    try {
        // Enviar reacción de procesando
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const processingMsg = await conn.reply(m.chat, 
            `🔍 *BUSCANDO APK EN APTOIDE...* 🔍\n\n` +
            `📱 *Búsqueda:* "${text}"\n` +
            `👤 *Usuario:* ${user.name || conn.getName(m.sender)}\n\n` +
            `⏳ Buscando aplicaciones disponibles...`,
            m
        );

        let searchA = await search(text)
        
        if (!searchA || searchA.length === 0) {
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
                `😔 *NO SE ENCONTRARON RESULTADOS*\n\n` +
                `No se encontraron APKs para: "${text}"\n\n` +
                `💡 *Sugerencias:*\n` +
                `• Verifica la ortografía\n` +
                `• Intenta con el nombre exacto\n` +
                `• Busca variantes del nombre`,
                m
            )
        }

        let data5 = await download(searchA[0].id)
        
        let txt = `*乂 APTOIDE - DESCARGAS 乂*\n\n`
        txt += `≡ *Nombre:* ${data5.name}\n`
        txt += `≡ *Package:* ${data5.package}\n`
        txt += `≡ *Actualización:* ${data5.lastup}\n`
        txt += `≡ *Tamaño:* ${data5.size}\n`
        txt += `≡ *Versión:* ${data5.version}\n`
        txt += `≡ *Usuario:* ${user.name || conn.getName(m.sender)}\n\n`
        txt += `📱 *Descargado por waguri Bot*`

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

        await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', txt, m)
        
        if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
            await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
            return await conn.reply(m.chat, 
                `ꕥ *ARCHIVO DEMASIADO PESADO*\n\n` +
                `El archivo "${data5.name}" pesa ${data5.size} y es demasiado grande para enviar por WhatsApp.\n\n` +
                `💡 *Alternativas:*\n` +
                `• Busca una versión más ligera\n` +
                `• Busca en otro sitio de descargas\n` +
                `• Intenta con una versión anterior`,
                m
            )
        }

        // Enviar reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        
        await conn.sendMessage(m.chat, { 
            document: { 
                url: data5.dllink 
            }, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: `${data5.name}_${data5.version}.apk`, 
            caption: `✅ *${data5.name} ${data5.version}*\n📦 Descarga completada`
        }, { quoted: m })

    } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 
            `⚠︎ *ERROR EN LA DESCARGA*\n\n` +
            `Se ha producido un problema al descargar la APK.\n\n` +
            `*Detalles:* ${error.message}\n\n` +
            `🔧 *Soluciones:*\n` +
            `• Verifica el nombre de la aplicación\n` +
            `• Intenta con otra aplicación\n` +
            `• Espera unos minutos\n` +
            `• Usa *${usedPrefix}report* para informar el problema`,
            m
        )
    }
}

handler.tags = ['descargas']
handler.help = ['apkmod']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = true
handler.register = true

export default handler