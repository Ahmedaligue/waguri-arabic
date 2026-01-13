// ============================================
// COMANDO: DADO
// ============================================
async function handler(m, { conn, usedPrefix, command }) {
    const user = m.sender;
    const apuesta = 30; // Waguri coins a apostar
    
    // Revisar si tiene suficientes coins
    const userCoins = global.db.data.users?.[user]?.waguriCoins || 0;
    if (userCoins < apuesta) {
        return m.reply(`❌ No tienes suficientes Waguri Coins\n💳 Necesitas: ${apuesta} coins\n💰 Tienes: ${userCoins} coins`);
    }
    
    const dadoUsuario = parseInt(m.text.split(' ')[1]);
    
    if (!dadoUsuario || dadoUsuario < 1 || dadoUsuario > 6) {
        return m.reply(`🎲 *DADO*\n\n💡 *Uso:* ${usedPrefix}dado [1-6]\n🎯 *Ejemplo:* ${usedPrefix}dado 3\n💰 *Apuesta:* ${apuesta} Waguri Coins`);
    }
    
    // Tirar dado
    const resultado = Math.floor(Math.random() * 6) + 1;
    
    let mensaje = `🎲 *DADO*\n\n`;
    mensaje += `🎯 *Tu número:* ${dadoUsuario}\n`;
    mensaje += `🎲 *Dado salió:* ${resultado}\n\n`;
    
    global.db.data.users[user] = global.db.data.users[user] || {};
    
    if (dadoUsuario === resultado) {
        const ganancia = apuesta * 3;
        global.db.data.users[user].waguriCoins = (global.db.data.users[user].waguriCoins || 0) + ganancia;
        mensaje += `🎉 *¡JACKPOT!*\n`;
        mensaje += `💰 *Ganaste:* ${ganancia} Waguri Coins\n`;
        mensaje += `💳 *Total ahora:* ${global.db.data.users[user].waguriCoins} coins`;
    } else {
        global.db.data.users[user].waguriCoins = (global.db.data.users[user].waguriCoins || 0) - apuesta;
        mensaje += `❌ *¡PERDISTE!*\n`;
        mensaje += `💸 *Perdiste:* ${apuesta} Waguri Coins\n`;
        mensaje += `💳 *Total ahora:* ${global.db.data.users[user].waguriCoins} coins`;
    }
    
    await m.reply(mensaje);
}

handler.help = ['dado [1-6]'];
handler.tags = ['juegos'];
handler.command = ['dado', 'dice', 'roll'];
handler.group = true;
handler.limit = true;

export default handler;