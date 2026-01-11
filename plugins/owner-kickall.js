// kickall.js - Elimina a todos los participantes de un grupo

let handler = async (m, { conn, usedPrefix, command, participants, isOwner, isBotAdmin }) => {
  
  // Verificar si es el owner
  if (!isOwner) {
    return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el dueño del bot puede usar este comando.')
  }
  
  // Verificar que el bot sea admin
  if (!isBotAdmin) {
    return m.reply('❌ *PERMISOS INSUFICIENTES*\n\nEl bot debe ser administrador del grupo.')
  }
  
  // Verificar que sea un grupo
  if (!m.isGroup) {
    return m.reply('❌ *SOLO EN GRUPOS*\n\nEste comando solo funciona en grupos.')
  }
  
  // Mostrar ayuda
  if (!args[0] || args[0].toLowerCase() !== 'confirmar') {
    
    // Obtener información del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participantsList = participants || groupMetadata.participants
    
    // Filtrar participantes (excluyendo al bot y al owner)
    const participantsToRemove = participantsList.filter(p => 
      p.id !== conn.user.jid && 
      p.id !== m.sender
    )
    
    const botInfo = participantsList.find(p => p.id === conn.user.jid)
    const isBotSuperAdmin = botInfo?.admin === 'superadmin' || botInfo?.admin === true
    
    // Crear mensaje de advertencia
    const warningMessage = 
      `⚠️ *¡ADVERTENCIA EXTREMA!* ⚠️\n\n` +
      `🔴 *ESTÁS POR ELIMINAR A TODOS DEL GRUPO*\n\n` +
      `📊 *ESTADÍSTICAS:*\n` +
      `👥 Total miembros: ${participantsList.length}\n` +
      `🗑️ A eliminar: ${participantsToRemove.length}\n` +
      `🤖 Bot (se queda): ${botInfo ? '✅' : '❌'}\n` +
      `👑 Owner (se queda): ${m.sender.split('@')[0]}\n` +
      `👑 Permisos bot: ${isBotSuperAdmin ? 'Super Admin' : 'Admin'}\n\n` +
      `🚨 *CONSECUENCIAS:*\n` +
      `• Se eliminarán ${participantsToRemove.length} personas\n` +
      `• El grupo quedará solo con el bot y tú\n` +
      `• NO SE PUEDE DESHACER\n` +
      `• Puede haber limitaciones de WhatsApp\n\n` +
      `✅ *PARA CONFIRMAR:*\n` +
      `Escribe: ${usedPrefix}${command} confirmar\n\n` +
      `❌ *PARA CANCELAR:*\n` +
      `Ignora este mensaje\n\n` +
      `💡 *Sugerencia:* Prueba primero con 1-2 personas.`
    
    await conn.sendMessage(m.chat, { 
      text: warningMessage,
      react: { text: '⚠️', key: m.key }
    })
    return
  }
  
  // ========== CONFIRMACIÓN 1 ==========
  if (args[0] === 'confirmar' && !args[1]) {
    await conn.sendMessage(m.chat, { 
      text: `⚠️ *CONFIRMACIÓN REQUERIDA*\n\n¿Estás ABSOLUTAMENTE SEGURO de eliminar a TODOS?\n\nEscribe: ${usedPrefix}${command} confirmar si`,
      react: { text: '❓', key: m.key }
    })
    return
  }
  
  // ========== CONFIRMACIÓN 2 ==========
  if (args[0] === 'confirmar' && args[1] === 'si') {
    
    // Obtener participantes actualizados
    const groupMetadata = await conn.groupMetadata(m.chat)
    const allParticipants = groupMetadata.participants
    
    // Lista de usuarios a mantener (bot y owner)
    const keepUsers = [conn.user.jid, m.sender]
    
    // Filtrar usuarios a eliminar
    const usersToRemove = allParticipants
      .filter(p => !keepUsers.includes(p.id))
      .map(p => p.id)
    
    if (usersToRemove.length === 0) {
      return m.reply('✅ *NO HAY NADIE PARA ELIMINAR*\n\nEl grupo solo tiene al bot y al owner.')
    }
    
    // Enviar mensaje de inicio
    await conn.sendMessage(m.chat, { 
      text: `🚀 *INICIANDO ELIMINACIÓN MASIVA*\n\n📊 Total a eliminar: ${usersToRemove.length}\n⏳ Esto puede tomar varios minutos...`,
      react: { text: '🔄', key: m.key }
    })
    
    let successCount = 0
    let failCount = 0
    const results = []
    const maxPerBatch = 5 // WhatsApp limita eliminaciones
    const delayBetweenBatches = 5000 // 5 segundos
    
    // Eliminar en lotes para evitar bloqueos
    for (let i = 0; i < usersToRemove.length; i += maxPerBatch) {
      const batch = usersToRemove.slice(i, i + maxPerBatch)
      
      try {
        // Intentar eliminar el lote actual
        const result = await conn.groupParticipantsUpdate(m.chat, batch, 'remove')
        
        // Contar resultados
        batch.forEach((userJid, index) => {
          const phone = userJid.split('@')[0]
          if (result && result[index] === 'success') {
            successCount++
            results.push(`✅ ${phone}`)
          } else {
            failCount++
            results.push(`❌ ${phone} (falló)`)
          }
        })
        
        // Actualizar progreso
        const progress = Math.min(i + maxPerBatch, usersToRemove.length)
        const percent = Math.round((progress / usersToRemove.length) * 100)
        
        await conn.sendMessage(m.chat, { 
          text: `📊 *PROGRESO:* ${progress}/${usersToRemove.length} (${percent}%)\n✅ Éxitos: ${successCount}\n❌ Fallos: ${failCount}`,
          delete: m.key // Eliminar mensaje anterior
        })
        
        // Esperar antes del siguiente lote (evitar rate limit)
        if (i + maxPerBatch < usersToRemove.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
        
      } catch (batchError) {
        console.error('Error en lote:', batchError)
        failCount += batch.length
        batch.forEach(userJid => {
          results.push(`❌ ${userJid.split('@')[0]} (error: ${batchError.message})`)
        })
        
        // Continuar con siguiente lote
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }
    
    // Mensaje final
    const completionMessage = 
      `🎯 *ELIMINACIÓN COMPLETADA*\n\n` +
      `📊 *RESULTADOS FINALES:*\n` +
      `✅ Eliminados exitosos: ${successCount}\n` +
      `❌ Fallos: ${failCount}\n` +
      `👥 Total procesados: ${usersToRemove.length}\n\n` +
      `📋 *ÚLTIMOS 10 RESULTADOS:*\n` +
      `${results.slice(-10).join('\n')}\n\n` +
      (failCount > 0 ? 
        `⚠️ Algunos usuarios no pudieron ser eliminados.\nPuede que:\n• No estén en el grupo\n• Sean admins\n• WhatsApp bloqueó la acción\n\n` : 
        `✨ ¡Todos los usuarios fueron eliminados exitosamente!\n\n`) +
      `🏁 El proceso ha finalizado.`
    
    await conn.sendMessage(m.chat, { 
      text: completionMessage,
      react: { text: '✅', key: m.key }
    })
    
  } else {
    await m.reply('❌ Comando cancelado.')
  }
}

handler.help = ['kickall']
handler.tags = ['owner', 'group']
handler.command = /^(kickall|eliminartodos|removetodos|vaciar)$/i
handler.group = true
handler.botAdmin = true
handler.admin = false
handler.owner = true

export default handler