import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.botNumber = '' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
['212625457341', 'ahmed aligue', true],
['212625457341','ahmedd ishigami',true],

  
// <-- Número @lid -->
  ['225924406595742', true]
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = ['212625457341'] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = '🌷 Waguri-Bot-MD 🌷'
global.namebot = 'W A G U R I B O T'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 


//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packname = 'Waguri-Bot-MD'
global.botname = 'Waguri bot'
global.wm = '💗𝕎𝕒𝕘𝕦𝕣𝕚 𝔹𝕠𝕥💗'
global.author = '© ahmed ishigami'
global.dev = '© Powered by ahmed'
global.banner = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1764986888437.jpg'
global.textbot = 'أنا واجوري بوت 🌸، روح لطيفة وهادئة.';
global.etiqueta = 'Waguri-Bot-MD'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.moneda = 'Waguricoins'
global.welcom1 = '🌷 أهلاً وسهلاً بك في هذا البستان! 🌷 \n✨ أنا واجوري بوت ✨ \n🌸 عدّل هذه الرسالة باستخدام setwelcome 🌸';
global.welcom2 = '🌸 واجوري بوت يودّعك بهدوء، نتمنى أن يزهر طريقك بالحكمة 🌸 \n🌸 عدّل هذه الرسالة باستخدام setbye 🌸';
global.avatar = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1764986888437.jpg'

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'Angelithixyz'
}

global.playlistApiKey = 'f9e54e5c6amsh8b4dfc0bfb94abap19bab2jsne8b65338207e'


global.apikey = 'adonix-key'
global.APIKeys = {
  'https://api.xteam.xyz': 'YOUR_XTEAM_KEY',
  'https://api.lolhuman.xyz': 'API_KEY',
  'https://api.betabotz.eu.org': 'API_KEY',
  'https://mayapi.ooguy.com': 'may-f53d1d49'
}

global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  xteam: 'https://api.xteam.xyz',
  lol: 'https://api.lolhuman.xyz',
  delirius: 'https://delirius-apiofc.vercel.app',
  siputzx: 'https://api.siputzx.my.id',
  mayapi: 'https://mayapi.ooguy.com'
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gp1 = 'https://chat.whatsapp.com/FiInFgPI1AK8HzvcnMxIRt'
global.comunidad1 = 'https://chat.whatsapp.com/FiInFgPI1AK8HzvcnMxIRt'
global.channel = 'https://whatsapp.com/channel/0029Vb6YJqq0lwgzYNWVN21u'
global.channel2 = 'https://whatsapp.com/channel/0029Vb6YJqq0lwgzYNWVN21u'
global.md = 'https://github.com/Ahmedaligue'
global.correo = 'https://www.instagram.com/aa18.aligue/' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: "120363405848897016@newsletter", 
      serverMessageId: 100, 
      newsletterName: "🌸WAGURI-BOT-MD"
    }
  }
}


global.redes = 'https://whatsapp.com/channel/0029Vb6YJqq0lwgzYNWVN21u '
global.dev = '© by ahmed ishigami'
global.emoji = '💗'
global.emoji2 = '🌸'
global.emoji3 = '🌷'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
global.catalogo = 'mienlace'
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
  channel1: '120363405848897016@newsletter',
  channel1name: '🌸❖𝗪𝗔𝗚𝗨𝗥𝗜 𝗕𝗢𝗧❖🌸'
}
global.multiplier = 60

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

global.opts = {
  ...global.opts,
  autoread: true,  
  queque: false 
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
