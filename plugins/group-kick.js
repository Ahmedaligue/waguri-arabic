var handler = async (m, { conn, participants, usedPrefix, command }) => {
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
    
    if (!user) return conn.reply(m.chat, 
        `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
        `❌ *Uso incorrecto*\n\n` +
        `*Formato:* \`${usedPrefix}kick\`\n` +
        `• Menciona a un usuario\n` +
        `• Responde a un mensaje\n\n` +
        `*Ejemplo:*\n` +
        `\`${usedPrefix}kick @usuario\``, m)
    
    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        
        // Tu número como creador del bot
        const creatorBot = '240222646582@s.whatsapp.net'
        const ownerBot = global.owner?.[0]?.[0] ? global.owner[0][0] + '@s.whatsapp.net' : creatorBot
        
        // Verificar que el remitente es administrador
        const senderParticipant = participants.find(p => p.id === m.sender)
        if (!senderParticipant || !senderParticipant.admin) {
            return conn.reply(m.chat, 
                `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                `❌ *Permiso denegado*\n\n` +
                `Solo los administradores pueden usar este comando.`, m)
        }
        
        // Lista de usuarios ABSOLUTAMENTE protegidos (nadie puede expulsarlos)
        const absolutelyProtected = [
            conn.user.jid,                    // El bot mismo
            ownerGroup,                       // Dueño del grupo (absoluto)
            creatorBot,                       // Creador del bot (tú)
            ownerBot                          // Dueño del bot (configuración)
        ]
        
        // Verificar si el usuario está absolutamente protegido
        if (absolutelyProtected.includes(user)) {
            let reason = ''
            
            if (user === conn.user.jid) {
                reason = '🤖 *No puedo expulsarme a mí mismo*'
            } else if (user === ownerGroup) {
                reason = '👑 *No puedo expulsar al dueño del grupo*'
            } else if (user === creatorBot || user === ownerBot) {
                reason = '⚙️ *No puedo expulsar al creador/dueño del bot*'
            }
            
            return conn.reply(m.chat, 
                `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                `${reason}\n\n` +
                `*Usuario con protección absoluta*`, m)
        }
        
        // Obtener información del usuario objetivo
        const targetParticipant = participants.find(p => p.id === user)
        if (!targetParticipant) {
            return conn.reply(m.chat, 
                `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                `❌ *Usuario no encontrado*\n\n` +
                `El usuario ya no está en el grupo o el ID es incorrecto.`, m)
        }
        
        const username = targetParticipant.notify || '@' + user.split('@')[0]
        const senderName = senderParticipant.notify || '@' + m.sender.split('@')[0]
        
        // Verificar si el objetivo es admin
        const isTargetAdmin = targetParticipant.admin
        
        // Si el objetivo es admin, verificar si el remitente es también admin (ya verificado arriba)
        // Permitir que admin expulse a otro admin
        
        // Antes de expulsar, notificar
        await conn.sendMessage(m.chat, {
            text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                  `⚠️ *PROCESANDO EXPULSIÓN*\n\n` +
                  `👤 *Usuario:* ${username}\n` +
                  `👮 *Expulsado por:* ${senderName}\n` +
                  `${isTargetAdmin ? '⚠️ *Nota:* El usuario es administrador\n' : ''}` +
                  `⏳ *Procesando...*`,
            mentions: [user, m.sender]
        }, { quoted: m })
        
        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        
        // Mensaje de éxito
        const successMessage = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                             `✅ *EXPULSIÓN EXITOSA*\n\n` +
                             `👤 *Usuario expulsado:* ${username}\n` +
                             `${isTargetAdmin ? '👮 *Era:* Administrador\n' : '👤 *Era:* Miembro regular\n'}` +
                             `👮 *Expulsado por:* ${senderName}\n` +
                             `📅 *Fecha:* ${new Date().toLocaleString()}\n\n` +
                             `*Acción completada correctamente*`
        
        await conn.sendMessage(m.chat, { text: successMessage })
        
    } catch (e) {
        console.error('Error en comando kick:', e)
        
        // Mensaje de error específico
        let errorMsg = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `❌ *ERROR EN LA EXPULSIÓN*\n\n`
        
        if (e.message.includes('not authorized')) {
            errorMsg += `*Motivo:* Permisos insuficientes\n` +
                       `*Solución:* Asegúrate que el bot es administrador\n\n`
        } else if (e.message.includes('not in group')) {
            errorMsg += `*Motivo:* El usuario ya no está en el grupo\n\n`
        } else {
            errorMsg += `*Error:* ${e.message}\n\n`
        }
        
        errorMsg += `*Reporta problemas con:* \`${usedPrefix}report\``
        
        await conn.reply(m.chat, errorMsg, m)
    }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban', 'expulsar']
handler.admin = true  // Solo administradores pueden usar el comando
handler.group = true
handler.botAdmin = true  // El bot debe ser administrador

export default handler