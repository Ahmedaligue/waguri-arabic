import fetch from 'node-fetch';

const API_KEY = 'stellar-SSfb2OPw';
const API_URL = 'https://rest.alyabotpe.xyz/stalking/github';

async function handler(m, { text, conn }) {
    if (!text) {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🐙 *STALKING GITHUB*\n\n` +
                      `❌ *Ingresa un nombre de usuario*\n\n` +
                      `*Uso:* .stg [usuario]\n` +
                      `*Ejemplo:* .stg octocat`);
    }

    const username = text.trim();
    
    // Enviar reacción ⌚
    try {
        await conn.sendReaction(m.chat, m.key, '⌚');
    } catch {}
    
    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(
        m.chat,
        {
            text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                  `🔍 *Buscando en GitHub...*\n\n` +
                  `👤 *Usuario:* ${username}\n` +
                  `⏳ *Obteniendo información...*`
        },
        { quoted: m }
    );

    try {
        // Construir URL de la API
        const url = `${API_URL}?username=${encodeURIComponent(username)}&key=${API_KEY}`;
        console.log('URL API GitHub:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`Error API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Respuesta GitHub:', JSON.stringify(data, null, 2));
        
        // Verificar si la API devolvió error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'Usuario no encontrado');
        }
        
        const result = data.result || data;
        
        // Crear mensaje con la información
        let message = `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                     `🐙 *INFORMACIÓN DE GITHUB*\n\n`;
        
        // Información básica
        if (result.name) message += `👤 *Nombre:* ${result.name}\n`;
        if (result.login) message += `🔖 *Usuario:* ${result.login}\n`;
        if (result.bio) message += `📝 *Bio:* ${result.bio}\n`;
        if (result.company) message += `🏢 *Compañía:* ${result.company}\n`;
        if (result.location) message += `📍 *Ubicación:* ${result.location}\n`;
        if (result.blog) message += `🌐 *Blog/Sitio:* ${result.blog}\n`;
        
        message += `\n📊 *ESTADÍSTICAS*\n`;
        if (result.public_repos !== undefined) message += `📁 *Repos públicos:* ${result.public_repos}\n`;
        if (result.public_gists !== undefined) message += `📝 *Gists:* ${result.public_gists}\n`;
        if (result.followers !== undefined) message += `👥 *Seguidores:* ${result.followers}\n`;
        if (result.following !== undefined) message += `👣 *Siguiendo:* ${result.following}\n`;
        
        message += `\n📅 *FECHAS*\n`;
        if (result.created_at) {
            const created = new Date(result.created_at).toLocaleDateString('es-ES');
            message += `📅 *Creado:* ${created}\n`;
        }
        if (result.updated_at) {
            const updated = new Date(result.updated_at).toLocaleDateString('es-ES');
            message += `🔄 *Actualizado:* ${updated}\n`;
        }
        
        // URL del perfil
        if (result.html_url) {
            message += `\n🔗 *URL del perfil:*\n\`\`\`${result.html_url}\`\`\`\n`;
        }
        
        // Avatar si está disponible
        let avatarBuffer = null;
        if (result.avatar_url) {
            message += `\n📸 *Imagen de perfil disponible*`;
            
            // Intentar descargar avatar para enviarlo
            try {
                const avatarRes = await fetch(result.avatar_url);
                if (avatarRes.ok) {
                    avatarBuffer = await avatarRes.buffer();
                }
            } catch (avatarError) {
                console.error('Error descargando avatar:', avatarError);
            }
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n` +
                  `✨ *Información obtenida de GitHub*`;
        
        // Enviar mensaje con o sin imagen
        if (avatarBuffer) {
            // Enviar con imagen del avatar
            await conn.sendMessage(m.chat, {
                image: avatarBuffer,
                caption: message
            }, { quoted: m });
        } else {
            // Enviar solo texto
            await conn.sendMessage(m.chat, {
                text: message
            }, { quoted: m });
        }
        
        // Reacción ✅
        try {
            await conn.sendReaction(m.chat, m.key, '✅');
        } catch {}
        
        // Eliminar mensaje de procesamiento
        await conn.sendMessage(m.chat, { delete: processingMsg.key });

    } catch (error) {
        console.error('Error GitHub Stalking:', error);
        
        // Reacción ❌
        try {
            await conn.sendReaction(m.chat, m.key, '❌');
        } catch {}
        
        // Mensaje de error
        const errorMessage = await conn.sendMessage(
            m.chat,
            {
                text: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `❌ *ERROR AL BUSCAR USUARIO*\n\n` +
                      `👤 *Usuario buscado:* ${username}\n\n` +
                      `⚠️ *Error:* ${error.message}\n\n` +
                      `*Posibles causas:*\n` +
                      `• El usuario no existe\n` +
                      `• Nombre de usuario incorrecto\n` +
                      `• API temporalmente no disponible\n` +
                      `• Límite de consultas excedido\n\n` +
                      `💡 *Sugerencias:*\n` +
                      `• Verifica la ortografía\n` +
                      `• Usa el nombre exacto de GitHub\n` +
                      `• Espera unos minutos`
            },
            { quoted: m }
        );

        // Actualizar mensaje de procesamiento
        await conn.sendMessage(
            m.chat,
            { 
                text: "❌ Usuario no encontrado",
                edit: processingMsg.key 
            }
        );
    }
}

handler.help = ["stg <usuario>"];
handler.tags = ["stalk", "github", "info"];
handler.command = ["stg", "github", "gitstalk", "stalkgithub", "gh"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;