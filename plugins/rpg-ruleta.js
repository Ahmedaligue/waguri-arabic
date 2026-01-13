// ============================================
// COMANDO: RULETA
// ============================================
async function handler(m, { conn, usedPrefix, command }) {
    const user = m.sender;
    const apuesta = 25; // Waguri coins a apostar
    
    // Revisar si tiene suficientes coins
    const userCoins = global.db.data.users?.[user]?.waguriCoins || 0;
    if (userCoins < apuesta) {
        return m.reply(`❌ No tienes suficientes Waguri Coins\n💳 Necesitas: ${apuesta} coins\n💰 Tienes: ${userCoins} coins`);
    }
    
    const colores = ['rojo', 'negro', 'verde'];
    const resultado = colores[Math.floor(Math.random() * colores.length)];
    const eleccionUsuario = m.text.split(' ')[1]?.toLowerCase();
    
    if (!eleccionUsuario || !colores.includes(eleccionUsuario)) {
        return m.reply(`🎰 *RULETA*\n\n💡 *Uso:* ${usedPrefix}ruleta [rojo|negro|verde]\n🎯 *Ejemplo:* ${usedPrefix}ruleta rojo\n💰 *Apuesta:* ${apuesta} Waguri Coins`);
    }
    
    let mensaje = `🎰 *RULETA*\n\n`;
    mensaje += `🎯 *Tu elección:* ${eleccionUsuario}\n`;
    mensaje += `🔴⚫🟢 *Resultado:* ${resultado}\n\n`;
    
    global.db.data.users[user] = global.db.data.users[user] || {};
    
    if (eleccionUsuario === resultado) {
        let ganancia;
        if (resultado === 'verde') {
            ganancia = apuesta * 14; // Premio mayor para verde
        } else {
            ganancia = apuesta * 2; // Premio normal para rojo/negro
        }
        global.db.data.users[user].waguriCoins = (global.db.data.users[user].waguriCoins || 0) + ganancia;
        mensaje += `✅ *¡GANASTE!*\n`;
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

handler.help = ['ruleta [rojo|negro|verde]'];
handler.tags = ['juegos'];
handler.command = ['ruleta', 'roulette', 'rl'];
handler.group = true;
handler.limit = true;

export default handler;