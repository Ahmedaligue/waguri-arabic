//código creado por Rufino 
import fetch from 'node-fetch';

const API_KEY = 'stellar-SSfb2OPw';
const API_URL = 'https://rest.alyabotpe.xyz/ai/texttoimage';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🎨 *GENERADOR DE IMÁGENES*\n\n` +
                      `❌ *Escribe una descripción*\n\n` +
                      `*Ejemplo:* .tti un paisaje de montaña al atardecer`);
    }

    try {
        // Enviar reacción ⌚
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch {}

    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat,
        {
            text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                  `🎨 *Generando imagen...*\n\n` +
                  `📝 *Prompt:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                  `⏳ *Por favor espera...*`
        },
        { quoted: m }
    );

    try {
        // Construir URL con API key
        const url = `${API_URL}?text=${encodeURIComponent(text)}&key=${API_KEY}`;
        console.log('URL API:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 60000 // 60 segundos timeout
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta API:', JSON.stringify(data, null, 2));
        
        // Extraer URL de imagen
        const imageUrl = data.result || data.url || data.image || data.link || data.data;
        
        if (!imageUrl) {
            throw new Error('No se recibió URL de imagen');
        }

        // Verificar que la URL sea válida
        if (!imageUrl.startsWith('http')) {
            throw new Error('URL de imagen inválida');
        }

        // Enviar la imagen
        await conn.sendMessage(
            m.chat,
            {
                image: { url: imageUrl },
                caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                        `✅ *IMAGEN GENERADA*\n\n` +
                        `📝 *Descripción:*\n${text}\n\n` +
                        `🖼️ *Generado con IA*\n` +
                        `✨ *¡Imagen creada exitosamente!*`
            },
            { quoted: m }
        );

        // Reacción ✅
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch {}

        // Eliminar mensaje de procesamiento
        await conn.sendMessage(m.chat, { delete: processingMsg.key });

    } catch (error) {
        console.error('Error TTI:', error);
        
        // Mensaje de error
        const errorMsg = await conn.sendMessage(
            m.chat,
            {
                text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `❌ *ERROR AL GENERAR*\n\n` +
                      `📝 *Prompt:* ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}\n\n` +
                      `⚠️ *Error:* ${error.message}\n\n` +
                      `*Posibles soluciones:*\n` +
                      `• Descripción muy larga/compleja\n` +
                      `• Intenta con palabras más simples\n` +
                      `• Espera unos minutos\n` +
                      `• Contenido no permitido`
            },
            { quoted: m }
        );

        // Reacción ❌
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch {}

        // Actualizar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Error en la generación",
                edit: processingMsg.key 
            }
        );
    }
}

handler.help = ["tti <texto>"];
handler.tags = ["ai", "imagen"];
handler.command = ["tti", "textoimagen", "imagenai", "dibujar"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;