const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  // Emblema floral de la nobleza
  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '🌸';
  m.react(customEmoji);

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const pesan = args.join` `;
  const oi = `*⚜️  Anuncio de la Casa Floral:* ${pesan ? `\n"${pesan}"` : 'Se requiere su presencia.'}`;
  
  let teks = `*╔════════════════════╗*\n` +
             `*┃    ⚜️ CONVOCATORIA NOBILITAS ⚜️    ┃*\n` +
             `*╚════════════════════╝*\n\n` +
             `*🌸 Orden de la Flor:* ${participants.length} nobles convocados\n\n` +
             `${oi}\n\n` +
             `*╭══ ≪ °❀° ≫ ══･････････････････････････╮*\n`;

  for (const mem of participants) {
    teks += `*┃* • 🌷 @${mem.id.split('@')[0]}\n`;
  }

  teks += `*╰══ ≪ °❀° ≫ ══･････････････････････････╯*\n\n` +
          `*« Que cada pétalo responda al llamado del jardín »*`;

  conn.sendMessage(m.chat, { 
    text: teks, 
    mentions: participants.map((a) => a.id),
    contextInfo: {
      mentionedJid: participants.map((a) => a.id),
      forwardingScore: 999,
      isForwarded: false
    }
  });
};

handler.help = ['todos *<mensaje noble>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true;
handler.group = true;

export default handler;