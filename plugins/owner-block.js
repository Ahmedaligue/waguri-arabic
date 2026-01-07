// Comando: /bloquear, /block, /ban
// Comando: /desbloquear, /unblock, /unban
// Comando: /listablock, /blocklist, /bloqueados

// Agrega esto al inicio de tu archivo principal o en la configuración global
if (!global.db.data.users) global.db.data.users = {}
if (!global.db.data.settings) global.db.data.settings = {}
if (!global.db.data.settings.blockedUsers) global.db.data.settings.blockedUsers = []
if (!global.db.data.settings.blockedCreators) global.db.data.settings.blockedCreators = []

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  let who
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
  } else {
    who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
  }
  
  let user = global.db.data.users[who]
  let name = who ? conn.getName(who) : 'Usuario'
  let blockList = global.db.data.settings.blockedUsers || []
  let creatorList = global.db.data.settings.blockedCreators || []
  
  // Comando: BLOQUEAR USUARIO NORMAL
  if (command === 'bloquear' || command === 'block' || command === 'ban') {
    if (!isOwner && !isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo los propietarios pueden usar este comando.')
    }
    
    if (!who) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix + command} @usuario\n${usedPrefix + command} 521234567890\n${usedPrefix + command} (respondiendo a un mensaje)`)
    }
    
    if (who === conn.user.jid) {
      return m.reply('❌ No puedo bloquearme a mí mismo.')
    }
    
    if (who === m.sender) {
      return m.reply('❌ No puedes bloquearte a ti mismo.')
    }
    
    // Verificar si ya está bloqueado
    if (blockList.includes(who)) {
      return m.reply(`⚠️ *${name}* ya está en la lista de bloqueados.`)
    }
    
    // Bloquear usuario
    blockList.push(who)
    global.db.data.settings.blockedUsers = blockList
    
    // Guardar en la base de datos
    global.db.write()
    
    m.reply(`✅ *Usuario bloqueado*\n\n• Nombre: ${name}\n• ID: ${who.split('@')[0]}\n• Fecha: ${new Date().toLocaleString()}\n\n⚠️ Este usuario ya no podrá usar comandos del bot.`)
  }
  
  // Comando: DESBLOQUEAR USUARIO
  if (command === 'desbloquear' || command === 'unblock' || command === 'unban') {
    if (!isOwner && !isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo los propietarios pueden usar este comando.')
    }
    
    if (!who) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix + command} @usuario\n${usedPrefix + command} 521234567890\n${usedPrefix + command} (respondiendo a un mensaje)`)
    }
    
    // Verificar si está bloqueado
    if (!blockList.includes(who)) {
      return m.reply(`⚠️ *${name}* no se encuentra en la lista de bloqueados.`)
    }
    
    // Desbloquear usuario
    const index = blockList.indexOf(who)
    blockList.splice(index, 1)
    global.db.data.settings.blockedUsers = blockList
    
    // Guardar en la base de datos
    global.db.write()
    
    m.reply(`✅ *Usuario desbloqueado*\n\n• Nombre: ${name}\n• ID: ${who.split('@')[0]}\n• Fecha: ${new Date().toLocaleString()}\n\n⚠️ Este usuario ahora puede usar comandos del bot nuevamente.`)
  }
  
  // Comando: BLOQUEAR CREADOR
  if (command === 'bloquearcreador' || command === 'blockcreator') {
    if (!isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo el propietario raíz puede usar este comando.')
    }
    
    if (!who) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix + command} @creador\n${usedPrefix + command} 521234567890`)
    }
    
    if (creatorList.includes(who)) {
      return m.reply(`⚠️ *${name}* ya está bloqueado como creador.`)
    }
    
    // Bloquear creador
    creatorList.push(who)
    global.db.data.settings.blockedCreators = creatorList
    
    // Guardar en la base de datos
    global.db.write()
    
    m.reply(`🔒 *Creador bloqueado*\n\n• Nombre: ${name}\n• ID: ${who.split('@')[0]}\n• Tipo: Creador\n• Fecha: ${new Date().toLocaleString()}\n\n⚠️ Este creador perderá todos los privilegios.`)
  }
  
  // Comando: DESBLOQUEAR CREADOR
  if (command === 'desbloquearcreador' || command === 'unblockcreator') {
    if (!isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo el propietario raíz puede usar este comando.')
    }
    
    if (!who) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix + command} @creador\n${usedPrefix + command} 521234567890`)
    }
    
    if (!creatorList.includes(who)) {
      return m.reply(`⚠️ *${name}* no está bloqueado como creador.`)
    }
    
    // Desbloquear creador
    const index = creatorList.indexOf(who)
    creatorList.splice(index, 1)
    global.db.data.settings.blockedCreators = creatorList
    
    // Guardar en la base de datos
    global.db.write()
    
    m.reply(`🔓 *Creador desbloqueado*\n\n• Nombre: ${name}\n• ID: ${who.split('@')[0]}\n• Fecha: ${new Date().toLocaleString()}\n\n✅ Privilegios de creador restaurados.`)
  }
  
  // Comando: LISTAR BLOQUEADOS
  if (command === 'listablock' || command === 'blocklist' || command === 'bloqueados') {
    if (!isOwner && !isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo los propietarios pueden ver esta lista.')
    }
    
    let blockedUsers = global.db.data.settings.blockedUsers || []
    let blockedCreators = global.db.data.settings.blockedCreators || []
    
    if (blockedUsers.length === 0 && blockedCreators.length === 0) {
      return m.reply('📭 *Lista vacía*\nNo hay usuarios bloqueados actualmente.')
    }
    
    let userList = ''
    let creatorListText = ''
    
    // Listar usuarios bloqueados normales
    if (blockedUsers.length > 0) {
      userList = '👥 *USUARIOS BLOQUEADOS:*\n'
      blockedUsers.forEach((user, index) => {
        let userName = conn.getName(user) || 'Desconocido'
        userList += `\n${index + 1}. ${userName}\n   📱 ${user.split('@')[0]}`
      })
    }
    
    // Listar creadores bloqueados
    if (blockedCreators.length > 0) {
      creatorListText = '\n\n👑 *CREADORES BLOQUEADOS:*\n'
      blockedCreators.forEach((creator, index) => {
        let creatorName = conn.getName(creator) || 'Desconocido'
        creatorListText += `\n${index + 1}. ${creatorName}\n   📱 ${creator.split('@')[0]}`
      })
    }
    
    m.reply(`📋 *LISTA DE BLOQUEADOS*\n\n${userList}${creatorListText}\n\n📊 *Totales:*\n• Usuarios: ${blockedUsers.length}\n• Creadores: ${blockedCreators.length}\n\nℹ️ Usa ${usedPrefix}bloquear @usuario para bloquear\nℹ️ Usa ${usedPrefix}desbloquear @usuario para desbloquear`)
  }
  
  // Comando: BLOQUEAR POR NÚMERO (sin mencionar)
  if (command === 'bloquearnum' || command === 'blocknum') {
    if (!isOwner && !isROwner) {
      return m.reply('🚫 *Acceso denegado*\nSolo los propietarios pueden usar este comando.')
    }
    
    if (!text) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix + command} 521234567890`)
    }
    
    let number = text.replace(/[^0-9]/g, '')
    if (!number) {
      return m.reply('❌ Número inválido. Asegúrate de incluir el código de país.')
    }
    
    let jid = number + '@s.whatsapp.net'
    
    if (blockList.includes(jid)) {
      return m.reply(`⚠️ El número ${number} ya está bloqueado.`)
    }
    
    // Bloquear por número
    blockList.push(jid)
    global.db.data.settings.blockedUsers = blockList
    global.db.write()
    
    m.reply(`✅ *Número bloqueado*\n\n• Número: ${number}\n• Fecha: ${new Date().toLocaleString()}`)
  }
}

handler.help = [
  'bloquear @usuario',
  'desbloquear @usuario',
  'listablock',
  'bloquearcreador @usuario',
  'desbloquearcreador @usuario',
  'bloquearnum 521234567890'
]

handler.tags = ['owner']
handler.command = [
  'bloquear', 'block', 'ban',
  'desbloquear', 'unblock', 'unban',
  'listablock', 'blocklist', 'bloqueados',
  'bloquearcreador', 'blockcreator',
  'desbloquearcreador', 'unblockcreator',
  'bloquearnum', 'blocknum'
]

handler.rowner = false
handler.owner = true
handler.group = false
handler.private = false

export default handler