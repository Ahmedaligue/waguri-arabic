// ============================================
// COMANDO: PFP (Foto de Perfil)
// Archivo: pfp.js
// ============================================
async function handler(m, { conn, mentionedJid, quoted }) {
    // Obtener el usuario objetivo
    let targetUser;
    
    if (mentionedJid && mentionedJid.length > 0) {
        targetUser = mentionedJid[0];
    } else if (quoted && quoted.sender) {
        targetUser = quoted.sender;
    } else {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `📸 *FOTO DE PERFIL*\n\n` +
                      `❌ *Menciona o responde a un usuario*\n\n` +
                      `*Uso:*\n` +
                      `• .pfp @usuario\n` +
                      `• .pfp (respondiendo a un mensaje)\n\n` +
                      `*Ejemplo:*\n` +
                      `.pfp @${m.sender.split('@')[0]}`);
    }

    try {
        // Obtener foto de perfil
        const profilePicture = await conn.profilePictureUrl(targetUser, 'image').catch(() => null);
        
        if (!profilePicture) {
            const username = targetUser.split('@')[0];
            return m.reply(`❌ No se pudo obtener la foto de perfil de @${username}\n` +
                         `El usuario puede tener la foto privada o no tener foto.`, null, {
                mentions: [targetUser]
            });
        }
        
        // Enviar la foto de perfil
        await conn.sendMessage(m.chat, {
            image: { url: profilePicture },
            caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                    `📸 *Foto de Perfil*\n` +
                    `👤 @${targetUser.split('@')[0]}`,
            mentions: [targetUser]
        }, { quoted: m });
        
    } catch (error) {
        console.error('Error en comando pfp:', error);
        await m.reply(`❌ Error al obtener la foto de perfil:\n${error.message}`);
    }
}

handler.help = ['pfp <@usuario>'];
handler.tags = ['utils'];
handler.command = ['pfp', 'getpic', 'fotoperfil', 'profilepic'];
handler.group = true;
handler.limit = true;

export default handler;