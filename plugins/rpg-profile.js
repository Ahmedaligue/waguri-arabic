module.exports = {
  name: "profile",
  alias: ["perfil", "me", "stats"],
  desc: "Muestra tu perfil RPG completo",
  category: "RPG",
  
  async execute(ctx, { m, args, prefix, bot, pushName }) {
    const userId = m.sender;
    const db = global.RPGDatabase;
    
    let user = db.getUser(userId);
    if (!user) {
      user = db.saveUser(userId, db.createNewUser(pushName || "Jugador"));
    }
    
    // Calcular XP para siguiente nivel
    const xpNeeded = user.level * 100;
    const xpPercent = Math.round((user.xp / xpNeeded) * 100);
    
    // Barra de progreso
    const progressBar = (percent) => {
      const filled = '█'.repeat(Math.floor(percent / 5));
      const empty = '░'.repeat(20 - Math.floor(percent / 5));
      return `[${filled}${empty}]`;
    };
    
    // Determinar rango
    const getRank = (level) => {
      if (level >= 50) return '🏆 Leyenda';
      if (level >= 30) return '👑 Maestro';
      if (level >= 20) return '⚔️ Héroe';
      if (level >= 10) return '🛡️ Guerrero';
      if (level >= 5) return '🎒 Aventurero';
      return '👶 Novato';
    };
    
    const profileMsg = `👤 *PERFIL DE ${user.username.toUpperCase()}*

🏅 *INFORMACIÓN BÁSICA*
• Nivel: ${user.level} ${getRank(user.level)}
• XP: ${user.xp}/${xpNeeded}
${progressBar(xpPercent)} ${xpPercent}%
• Clase: ${user.class}

❤️ *ESTADÍSTICAS*
• Salud: ${user.health}/${user.maxHealth}
• Ataque: ${user.attack} ⚔️
• Defensa: ${user.defense} 🛡️

💰 *ECONOMÍA*
• Monedas: ${user.coins.toLocaleString()} 🪙
• Gemas: ${user.gems} 💎
• Items: ${user.inventory.length}/50

🎖️ *LOGROS*
• Batallas: ${user.stats.battlesWon} victorias
• Monstruos: ${user.stats.monstersKilled} eliminados
• Recaudado: ${user.stats.coinsEarned.toLocaleString()} monedas
• Días: ${user.missions.daily || 0}

📅 *Registrado:* ${new Date(user.createdAt).toLocaleDateString()}

💡 *Comandos:* ${prefix}daily, ${prefix}battle, ${prefix}work`;

    await bot.sendMessage(m.chat, { text: profileMsg }, { quoted: m });
  }
};
