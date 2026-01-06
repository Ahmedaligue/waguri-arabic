
var handler = async (m, { conn, participants }) => {
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
    
    if (!user) return m.reply('❌ Menciona o responde a un usuario para expulsar.')
    
    // Tu número como creador del bot (protegido)
    const creatorBot = '240222646582@s.whatsapp.net'
    
    // Verificar que no sea el creador del bot
    if (user === creatorBot) {
        return m.reply('❌ No puedo expulsar al creador del bot.')
    }
    
    // Verificar que no sea el bot mismo
    if (user === conn.user.jid) {
        return m.reply('❌ No puedo expulsarme a mí mismo.')
    }
    
    // Expulsar al usuario
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    
    m.reply('✅ Usuario expulsado correctamente.')
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
