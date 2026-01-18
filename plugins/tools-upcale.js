// ============================================
// الأمر: تحسين جودة الصورة (Upscale)
// الملف: upscale.js
// ============================================
import fetch from 'node-fetch';

const API_KEY = 'stellar-yJFoP0BO';
const API_URL = 'https://rest.alyabotpe.xyz/tools/upscale';

async function handler(m, { text, conn, quoted }) {
    // التحقق من وجود صورة لتحسينها
    let imageBuffer = null;
    let imageUrl = null;
    
    // التحقق من صورة مقتبسة
    if (quoted && (quoted.mtype === 'imageMessage' || quoted.mtype === 'stickerMessage')) {
        imageBuffer = await quoted.download();
    }
    // التحقق من صورة في الرسالة الحالية
    else if (m.mtype === 'imageMessage') {
        imageBuffer = await m.download();
    }
    // التحقق من وجود رابط صورة
    else if (text && text.startsWith('http')) {
        imageUrl = text.trim();
    }
    else {
        return m.reply(`🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                      `🖼️ *تحسين جودة الصورة*\n\n` +
                      `❌ *أرسل صورة أو رابط صورة*\n\n` +
                      `*طرق الاستخدام:*\n` +
                      `• رد على صورة بالأمر .upscale\n` +
                      `• أرسل صورة مع الأمر .upscale\n` +
                      `• .upscale [رابط صورة]\n\n` +
                      `✨ *تحسين جودة الصور باستخدام الذكاء الاصطناعي*`);
    }

    const waitMsg = await m.reply('🔄 جارٍ تحسين جودة الصورة...');

    try {
        let response;
        
        if (imageBuffer) {
            // رفع الصورة باستخدام FormData
            const formData = new FormData();
            const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
            formData.append('image', blob, 'image.jpg');
            formData.append('key', API_KEY);
            
            response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
        } else if (imageUrl) {
            // استخدام الرابط
            const url = `${API_URL}?url=${encodeURIComponent(imageUrl)}&key=${API_KEY}`;
            response = await fetch(url);
        }
        
        if (!response.ok) {
            throw new Error(`خطأ ${response.status}`);
        }
        
        const data = await response.json();
        console.log('استجابة تحسين الصورة:', JSON.stringify(data, null, 2));
        
        // التحقق من وجود خطأ
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'خطأ أثناء معالجة الصورة');
        }
        
        const result = data.result || data.data || data;
        const upscaledImageUrl = result.url || result.image || result.result;
        
        if (!upscaledImageUrl) {
            throw new Error('لم يتم استلام صورة محسّنة');
        }
        
        // إرسال الصورة المحسّنة
        await conn.sendMessage(m.chat, {
            image: { url: upscaledImageUrl },
            caption: `🌸 *𝗪𝗔𝗚𝗨𝗥𝗨 𝗕𝗢𝗧 🌸*\n\n` +
                    `✅ *تم تحسين الصورة*\n\n` +
                    `🖼️ *الجودة محسّنة بالذكاء الاصطناعي*\n` +
                    `✨ *تمت معالجة الصورة بنجاح*`
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { delete: waitMsg.key });
        
    } catch (error) {
        console.error('خطأ في تحسين الصورة:', error);
        await m.reply(`❌ خطأ أثناء تحسين الصورة: ${error.message}`);
        try { await conn.sendMessage(m.chat, { delete: waitMsg.key }); } catch {}
    }
}

handler.help = ['تحسين <صورة|رابط>'];
handler.tags = ['tools', 'صورة'];
handler.command = ['upscale', 'mejorar', 'hd', 'enhance', 'تحسين'];
handler.group = true;
handler.limit = true;

export default handler;
