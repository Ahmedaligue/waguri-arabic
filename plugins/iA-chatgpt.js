// by Rufino 

import fetch from 'node-fetch';

const API_KEY = 'stellar-3Tjfq4Rj';
const API_URL = 'https://api.stellarwa.xyz/ai/chatgpt';

async function handler(m, { text, conn, usedPrefix, command }) {
    // Verificar si el usuario está registrado
    const user = global.db.data.users[m.sender];
    if (!user || !user.registered) {
        await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
        return m.reply(
            `🔒 *REGISTRO REQUERIDO* 🔒\n\n` +
            `Para usar el comando *${command}* necesitas estar registrado.\n\n` +
            `📋 *Regístrate con:*\n` +
            `${usedPrefix}reg nombre.edad\n\n` +
            `*Ejemplo:* ${usedPrefix}reg ${conn.getName(m.sender) || 'Usuario'}.18\n\n` +
            `¡Regístrate para usar ChatGPT! 🤖`
        );
    }

    if (!text) {
        return m.reply("Por favor, ingresa una petición para consultar a ChatGPT.\n> *Ejemplo:* .gpt ¿quién eres?");
    }

    // Enviar reacción de reloj (⌚) al comenzar
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch (error) {
        console.error('Error enviando reacción:', error);
    }

    // Enviar mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat, 
        { text: '> *ChatGPT está procesando tu petición...*' }, 
        { quoted: m }
    );

    try {
        const url = `${API_URL}?text=${encodeURIComponent(text)}&key=${API_KEY}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const responseText = data.result || data.response || data.answer || data.text || data.message || "No se recibió respuesta válida";

        // Enviar respuesta y cambiar reacción a check (✅)
        await conn.sendMessage(
            m.chat,
            { 
                text: `${responseText}`,
                edit: processingMsg.key 
            }
        );

        // Cambiar reacción a check (✅)
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch (error) {
            console.error('Error enviando reacción de éxito:', error);
        }

    } catch (error) {
        console.error('Error en ChatGPT:', error);

        // Enviar mensaje de error
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error al conectar con ChatGPT. Por favor, intenta nuevamente.",
                edit: processingMsg.key 
            }
        );

        // Cambiar reacción a error (❌)
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch (error) {
            console.error('Error enviando reacción de error:', error);
        }
    }
}

handler.help = ["gpt <texto>"];
handler.tags = ["ai"];
handler.command = ["gpt", "chatgpt"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;