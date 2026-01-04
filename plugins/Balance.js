// En plugins/economy.js - agregar este caso en el switch
case "balance":
case "bal":
    const userData = await getUserData(userId);
    
    const balanceMsg = `💰 *BALANCE COMPLETO DE ${userData.username || 'Usuario'}*
    
💵 *EFECTIVO DISPONIBLE*
Monedas en mano: ${userData.money.toLocaleString()} 🪙

🏦 *CUENTA BANCARIA*
Depositado: ${userData.bank.toLocaleString()} 🪙
Interés diario: ${Math.floor(userData.bank * 0.01)} 🪙 (1%)

📊 *TOTAL PATRIMONIO*
Suma total: ${(userData.money + userData.bank).toLocaleString()} 🪙

🎯 *ESTADÍSTICAS*
• Ganado total: ${userData.totalEarned.toLocaleString()} 🪙
• Transferencias: ${userData.stats?.transactions || 0}
• Días activo: ${userData.dailyStreak || 0}
• Robos exitosos: ${userData.stats?.robSuccess || 0}

📈 *PRÓXIMOS OBJETIVOS*
${getNextMilestone(userData.money + userData.bank)}`;
    
    await bot.sendMessage(m.chat, { text: balanceMsg }, { quoted: m });
    break;
