
// Escuchar comandos
conn.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message || m.key.fromMe) return;

  const msg = m.message.conversation || m.message.extendedTextMessage?.text || '';
  const command = msg.trim().toLowerCase().split(' ')[0];

  // Comando .hackear
  if (command === '.hackear') {
    if (!m.message.extendedTextMessage?.mentionedJid?.[0]) {
      return conn.sendMessage(m.key.remoteJid, { text: '✳️ *Menciona a alguien para hackear!*' }, { quoted: m });
    }

    const target = m.message.extendedTextMessage.mentionedJid[0];
    const hackSteps = [
      '🔍 Iniciando hackeo...',
      '📡 Conectando con los servidores...',
      '📁 Robando archivos...',
      '💳 Clonando tarjeta...',
      '📲 Accediendo al WhatsApp...',
      '📷 Descargando fotos privadas...',
      '✅ Hackeo completado con éxito.'
    ];

    for (let i = 0; i < hackSteps.length; i++) {
      setTimeout(() => {
        conn.sendMessage(m.key.remoteJid, {
          text: `👨‍💻 Hackeando a @target.split('@')[0]...{hackSteps[i]}`,
          mentions: [target]
        }, { quoted: m });
      }, i * 2000);
    }
  }
});
