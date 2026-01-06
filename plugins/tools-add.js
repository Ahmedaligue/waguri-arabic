let handler = async (m, { conn, text, args, usedPrefix, command, isAdmin, isOwner, groupMetadata }) => {
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo funciona en grupos.')
  }
  
  // Obtener configuración del grupo desde base de datos
  const groupId = m.chat
  let groupSettings = global.db.data.groups?.[groupId] || {}
  
  // Configuración por defecto
  const defaultSettings = {
    addCommand: 'admins', // 'admins', 'owner', 'all'
    welcomeMessage: true,
    antiLink: false,
    // ... otras configuraciones
  }
  
  // Combinar configuraciones
  groupSettings = { ...defaultSettings, ...groupSettings }
  
  // Verificar permisos según configuración del grupo
  const userCanUseCommand = () => {
    switch(groupSettings.addCommand) {
      case 'admins':
        return isAdmin || isOwner
      case 'owner':
        return isOwner
      case 'all':
        return true
      default:
        return isAdmin || isOwner
    }
  }
  
  if (!userCanUseCommand()) {
    const permissionMessage = {
      'admins': 'Solo administradores pueden usar este comando.',
      'owner': 'Solo el dueño del grupo puede usar este comando.',
      'all': 'Todos pueden usar este comando.'
    }
    return m.reply(`❌ ${permissionMessage[groupSettings.addCommand]}`)
  }
  
  // Resto del código igual que arriba...
  // [El mismo código de procesamiento de números y envío de invitaciones]
}

// Comando para configurar permisos del grupo
handler.before = async (m, { conn, usedPrefix, args, isOwner, groupMetadata }) => {
  if (m.text && m.text.toLowerCase().startsWith(`${usedPrefix}setadd`)) {
    if (!m.isGroup) {
      await m.reply('❌ Este comando solo funciona en grupos.')
      return true
    }
    
    if (!isOwner) {
      await m.reply('❌ Solo el dueño del grupo puede configurar permisos.')
      return true
    }
    
    const option = args[0]?.toLowerCase()
    const validOptions = ['admins', 'owner', 'all']
    
    if (!option || !validOptions.includes(option)) {
      await m.reply(
        `⚙️ *CONFIGURAR PERMISOS DE /add*\n\n` +
        `Uso: ${usedPrefix}setadd <opción>\n\n` +
        `📋 *OPCIONES:*\n` +
        `• admins - Solo administradores\n` +
        `• owner - Solo dueño del grupo\n` +
        `• all - Todos los miembros\n\n` +
        `📌 *Ejemplo:* ${usedPrefix}setadd admins`
      )
      return true
    }
    
    // Guardar configuración en base de datos
    const groupId = m.chat
    if (!global.db.data.groups) global.db.data.groups = {}
    if (!global.db.data.groups[groupId]) global.db.data.groups[groupId] = {}
    
    global.db.data.groups[groupId].addCommand = option
    
    const optionNames = {
      'admins': '👮 Solo administradores',
      'owner': '👑 Solo dueño del grupo',
      'all': '👥 Todos los miembros'
    }
    
    await m.reply(
      `✅ *CONFIGURACIÓN ACTUALIZADA*\n\n` +
      `🔧 *Comando:* /add\n` +
      `👥 *Permitido para:* ${optionNames[option]}\n\n` +
      `📝 Los cambios se aplicarán inmediatamente.`
    )
    
    return true
  }
  
  if (m.text && m.text.toLowerCase().startsWith(`${usedPrefix}groupconfig`)) {
    if (!m.isGroup) {
      await m.reply('❌ Este comando solo funciona en grupos.')
      return true
    }
    
    const groupId = m.chat
    const groupSettings = global.db.data.groups?.[groupId] || {}
    const defaultSettings = {
      addCommand: 'admins',
      welcomeMessage: true,
      antiLink: false
    }
    
    const settings = { ...defaultSettings, ...groupSettings }
    
    await m.reply(
      `⚙️ *CONFIGURACIÓN DEL GRUPO*\n\n` +
      `👥 *Grupo:* ${groupMetadata?.subject || 'Desconocido'}\n\n` +
      `🔧 *AJUSTES:*\n` +
      `• /add: ${settings.addCommand}\n` +
      `• Welcome: ${settings.welcomeMessage ? '✅' : '❌'}\n` +
      `• Anti-link: ${settings.antiLink ? '✅' : '❌'}\n\n` +
      `📌 *Para cambiar:* ${usedPrefix}setadd <opción>`
    )
    
    return true
  }
  
  return false
}

handler.help = ['add <número>', 'setadd <admins/owner/all>', 'groupconfig', 'invitelink']
handler.tags = ['group', 'admin', 'config']
handler.command = /^(add|añadir|invitar|invite|agregar)$/i
handler.group = true
handler.botAdmin = true

export default handler