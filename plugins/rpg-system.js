const fs = require('fs');
const path = require('path');

// Sistema de base de datos simple
const DB_FILE = './database/rpg_data.json';

class RPGDatabase {
  constructor() {
    this.ensureDBFile();
  }
  
  ensureDBFile() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
    }
  }
  
  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading DB:', error);
      return { users: {} };
    }
  }
  
  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing DB:', error);
      return false;
    }
  }
  
  getUser(userId) {
    const db = this.read();
    return db.users[userId] || null;
  }
  
  saveUser(userId, userData) {
    const db = this.read();
    db.users[userId] = userData;
    this.write(db);
    return userData;
  }
  
  updateUser(userId, updates) {
    const db = this.read();
    if (!db.users[userId]) {
      db.users[userId] = this.createNewUser(userId.split('@')[0]);
    }
    Object.assign(db.users[userId], updates);
    this.write(db);
    return db.users[userId];
  }
  
  createNewUser(username) {
    return {
      username: username || "Jugador",
      level: 1,
      xp: 0,
      coins: 1000,
      gems: 5,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      class: "Novato",
      inventory: [],
      missions: { daily: 0 },
      cooldowns: {},
      stats: {
        battlesWon: 0,
        monstersKilled: 0,
        coinsEarned: 1000
      },
      createdAt: new Date().toISOString()
    };
  }
}

// Crear instancia global
global.RPGDatabase = new RPGDatabase();

module.exports = {
  name: "rpgsystem",
  alias: [],
  desc: "Sistema RPG Core - NO USAR",
  category: "hidden",
  isHidden: true,
  
  async execute(ctx, { m, args, bot }) {
    // Solo carga el sistema, no es un comando público
    console.log('🎮 Sistema RPG inicializado correctamente');
    
    // Puedes enviar un mensaje de confirmación al admin
    if (m.sender.endsWith('@s.whatsapp.net')) {
      await bot.sendMessage(m.chat, { 
        text: '✅ *Sistema RPG Cargado*\n\nLos comandos están listos para usar:\n!profile\n!daily\n!work\n!battle\n!shop\n!inventory\n!hunt\n!heal\n!slots\n\nEscribe !rpghelp para ayuda' 
      }, { quoted: m });
    }
  }
};
