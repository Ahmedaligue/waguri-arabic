// eliminarsub.js - Comando para eliminar sub-bots (solo owner)

import fs from 'fs/promises'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command, isOwner, participants }) => {
  // Verificar si es el owner
  if (!isOwner) {
    return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el owner del bot puede usar este comando.')
  }

  // Mostrar ayuda si no hay argumentos
  if (!text) {
    const helpMessage = 
      `🤖 *GESTIÓN DE SUB-BOTS*\n\n` +
      `📌 *Uso:*\n` +
      `• ${usedPrefix}${command} listar - Ver lista de sub-bots\n` +
      `• ${usedPrefix}${command} <@tag/número> - Eliminar sub-bot\n` +
      `• ${usedPrefix}${command} eliminar <@tag/número> - Eliminar sub-bot\n` +
      `• ${usedPrefix}${command} todos - Eliminar todos los sub-bots\n\n` +
      `💡 *Nota:* Este comando desconectará y eliminará los sub-bots del grupo.`
    
    return m.reply(helpMessage)
  }

  // Listar sub-bots
  if (text.toLowerCase() === 'listar') {
    try {
      // Obtener todos los participantes
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      // Filtrar números que parezcan ser bots (puedes ajustar estos patrones)
      const botPatterns = [
        /^\d+@s\.whatsapp\.net$/,
        /^bot/i,
        /^subbot/i,
        /-\s?bot$/i
      ]
      
      const subBots = allParticipants.filter(participant => {
        const phone = participant.id.split('@')[0]
        const name = participant.name || participant.notify || ''
        
        // Verificar si es el bot principal
        if (participant.id === conn.user.id) return false
        
        // Verificar patrones de bot
        return botPatterns.some(pattern => 
          pattern.test(phone) || pattern.test(name)
        )
      })

      if (subBots.length === 0) {
        return m.reply('🤖 *NO HAY SUB-BOTS*\n\nNo se encontraron sub-bots en este grupo.')
      }

      let listMessage = `🤖 *LISTA DE SUB-BOTS*\n\n`
      listMessage += `📊 Total: ${subBots.length}\n\n`

      subBots.forEach((bot, index) => {
        const phone = bot.id.split('@')[0]
        const name = bot.name || bot.notify || 'Sin nombre'
        const isAdmin = bot.admin ? '👑 Admin' : '👤 Miembro'
        
        listMessage += `${index + 1}. *${name}*\n`
        listMessage += `   📱 ${phone}\n`
        listMessage += `   ${isAdmin}\n`
        listMessage += `   🔧 Eliminar: ${usedPrefix}${command} ${phone}\n\n`
      })

      listMessage += `💡 Para eliminar todos: ${usedPrefix}${command} todos`

      await m.reply(listMessage)
    } catch (error) {
      console.error('Error al listar sub-bots:', error)
      await m.reply('❌ Error al obtener la lista de sub-bots.')
    }
    return
  }

  // Eliminar todos los sub-bots
  if (text.toLowerCase() === 'todos') {
    try {
      // Obtener todos los participantes
      const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
      
      // Filtrar sub-bots (excluyendo el bot principal)
      const botPatterns = [
        /^\d+@s\.whatsapp\.net$/,
        /^bot/i,
        /^subbot/i,
        /-\s?bot$/i
      ]
      
      const subBots = allParticipants.filter(participant => {
        if (participant.id === conn.user.id) return false
        
        const phone = participant.id.split('@')[0]
        const name = participant.name || participant.notify || ''
        
        return botPatterns.some(pattern => 
          pattern.test(phone) || pattern.test(name)
        )
      })

      if (subBots.length === 0) {
        return m.reply('🤖 *NO HAY SUB-BOTS*\n\nNo se encontraron sub-bots para eliminar.')
      }

      // Preguntar confirmación
      const confirmMessage = 
        `⚠️ *CONFIRMAR ELIMINACIÓN*\n\n` +
        `¿Estás seguro de eliminar *${subBots.length}* sub-bots?\n\n` +
        `📌 Responde con:\n` +
        `• *sí* - Confirmar eliminación\n` +
        `• *no* - Cancelar operación`
      
      await m.reply(confirmMessage)
      
      // Esperar confirmación
      const filter = msg => msg.sender === m.sender && msg.text?.toLowerCase() === 'sí'
      const response = await conn.waitForMessage(m.chat, filter, { timeout: 30000 })
      
      if (!response) {
        return m.reply('⏰ *OPERACIÓN CANCELADA*\n\nNo se recibió confirmación a tiempo.')
      }

      // Eliminar sub-bots
      let successCount = 0
      let failCount = 0
      const results = []

      for (const bot of subBots) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [bot.id], 'remove')
          successCount++
          results.push(`✅ ${bot.name || bot.id.split('@')[0]} - Eliminado`)
          
          // Pequeña pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          failCount++
          results.push(`❌ ${bot.name || bot.id.split('@')[0]} - Error: ${error.message}`)
        }
      }

      // Enviar resumen
      const summaryMessage = 
        `📊 *RESUMEN DE ELIMINACIÓN*\n\n` +
        `✅ Eliminados: ${successCount}\n` +
        `❌ Fallados: ${failCount}\n\n` +
        `📋 *Detalles:*\n${results.slice(0, 10).join('\n')}` +
        (results.length > 10 ? `\n\n... y ${results.length - 10} más` : '')
      
      await m.reply(summaryMessage)

    } catch (error) {
      console.error('Error al eliminar todos los sub-bots:', error)
      await m.reply('❌ Error al eliminar sub-bots: ' + error.message)
    }
    return
  }

  // Eliminar sub-bot específico
  try {
    // Obtener el número/JID del sub-bot
    let targetJid = ''
    
    if (text.includes('@')) {
      // Si ya es un JID
      targetJid = text.includes('@s.whatsapp.net') ? text : `${text}@s.whatsapp.net`
    } else if (m.quoted) {
      // Si hay un mensaje citado
      targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      // Si se mencionó a alguien
      targetJid = m.mentionedJid[0]
    } else {
      // Intentar interpretar como número
      const phoneNumber = text.replace(/[^0-9]/g, '')
      if (phoneNumber.length >= 10) {
        targetJid = `${phoneNumber}@s.whatsapp.net`
      } else {
        return m.reply(
          `❌ *FORMATO INVÁLIDO*\n\n` +
          `Usa uno de estos formatos:\n` +
          `• ${usedPrefix}${command} @mención\n` +
          `• ${usedPrefix}${command} 521234567890\n` +
          `• ${usedPrefix}${command} (responde a un mensaje)\n\n` +
          `📌 Ver lista: ${usedPrefix}${command} listar`
        )
      }
    }

    // Verificar que no sea el bot principal
    if (targetJid === conn.user.id) {
      return m.reply('❌ No puedes eliminar el bot principal con este comando.')
    }

    // Verificar que el usuario esté en el grupo
    const allParticipants = participants || (await conn.groupMetadata(m.chat)).participants
    const targetUser = allParticipants.find(p => p.id === targetJid)
    
    if (!targetUser) {
      return m.reply('❌ El usuario no está en este grupo.')
    }

    // Verificar si es probablemente un sub-bot
    const botPatterns = [
      /^\d+@s\.whatsapp\.net$/,
      /^bot/i,
      /^subbot/i,
      /-\s?bot$/i
    ]
    
    const phone = targetJid.split('@')[0]
    const name = targetUser.name || targetUser.notify || ''
    const isLikelyBot = botPatterns.some(pattern => 
      pattern.test(phone) || pattern.test(name)
    )

    if (!isLikelyBot) {
      const confirmMessage = 
        `⚠️ *ADVERTENCIA*\n\n` +
        `Este usuario no parece ser un sub-bot:\n` +
        `📛 Nombre: ${name}\n` +
        `📱 Número: ${phone}\n\n` +
        `¿Deseas eliminarlo de todas formas?\n\n` +
        `📌 Responde con:\n` +
        `• *sí* - Continuar eliminación\n` +
        `• *no* - Cancelar operación`
      
      await m.reply(confirmMessage)
      
      const filter = msg => msg.sender === m.sender && msg.text?.toLowerCase() === 'sí'
      const response = await conn.waitForMessage(m.chat, filter, { timeout: 30000 })
      
      if (!response) {
        return m.reply('⏰ *OPERACIÓN CANCELADA*\n\nNo se recibió confirmación.')
      }
    }

    // Eliminar el sub-bot
    await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')
    
    const successMessage = 
      `✅ *SUB-BOT ELIMINADO*\n\n` +
      `🤖 *Nombre:* ${name}\n` +
      `📱 *Número:* ${phone}\n` +
      `👤 *Rol:* ${targetUser.admin ? 'Admin' : 'Miembro'}\n\n` +
      `📍 El sub-bot ha sido eliminado del grupo.`
    
    await m.reply(successMessage)

  } catch (error) {
    console.error('Error al eliminar sub-bot:', error)
    
    let errorMessage = '❌ Error al eliminar sub-bot: '
    
    if (error.message.includes('not authorized')) {
      errorMessage += 'No tienes permisos de administrador.'
    } else if (error.message.includes('401')) {
      errorMessage += 'No estás en el grupo o el bot fue eliminado.'
    } else if (error.message.includes('403')) {
      errorMessage += 'El bot no tiene permisos para eliminar participantes.'
    } else {
      errorMessage += error.message
    }
    
    await m.reply(errorMessage)
  }
}

// Función auxiliar para esperar mensajes
function waitForMessage(conn, chatId, filter, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 30000
    const timeoutId = setTimeout(() => {
      conn.ev.off('messages.upsert', listener)
      resolve(null)
    }, timeout)

    const listener = async (m) => {
      const message = m.messages?.[0]
      if (!message) return
      if (message.key?.remoteJid !== chatId) return
      if (filter(message)) {
        clearTimeout(timeoutId)
        conn.ev.off('messages.upsert', listener)
        resolve(message)
      }
    }

    conn.ev.on('messages.upsert', listener)
  })
}

// Asignar la función al conn si no existe
if (!conn.waitForMessage) {
  conn.waitForMessage = waitForMessage
}

handler.help = ['eliminarsub [listar/@tag/número/todos]']
handler.tags = ['owner', 'group']
handler.command = /^(eliminarsub|removesub|kickbot|kickbots|quitarsub)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.owner = true

export default handler