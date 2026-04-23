// ============================================================
// Sxyware Discord Bot - Configuration
// Developed by Sxy.com | Sxyware
// ============================================================

export const config = {
  // Bot info
  botName: 'Sxyware',
  prefix: '!',

  // Red/Black aggressive gaming theme
  colors: {
    primary: 0xDC143C,    // Crimson Red
    secondary: 0x8B0000,  // Dark Red
    success: 0x00FF7F,    // Spring Green
    error: 0xFF0000,      // Bright Red
    warning: 0xFF8C00,    // Dark Orange
    info: 0x1C1C1E,       // Almost Black
    gold: 0xFFD700,       // Gold (for economy)
    purple: 0x9B59B6,     // Purple (for levels)
  },

  // Footer branding
  footer: 'Developed by Sxy.com | Sxyware',
  footerIcon: 'https://i.imgur.com/4OO5wh0.png',

  // Lavalink nodes - multiple public fallbacks for reliability
  lavalinkNodes: process.env.LAVALINK_HOST
    ? [
        {
          id: 'SxywareCustom',
          host: process.env.LAVALINK_HOST,
          port: parseInt(process.env.LAVALINK_PORT || '2333'),
          authorization: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
          secure: process.env.LAVALINK_SECURE === 'true',
        },
      ]
    : [
        {
          id: 'AjieDev-v4',
          host: 'lava-v4.ajieblogs.eu.org',
          port: 443,
          authorization: 'https://dsc.gg/ajidevserver',
          secure: true,
        },
        {
          id: 'Serenetia-v4',
          host: 'lavalinkv4.serenetia.com',
          port: 443,
          authorization: 'https://dsc.gg/ajidevserver',
          secure: true,
        },
        {
          id: 'Jirayu-v4',
          host: 'lavalink.jirayu.net',
          port: 13592,
          authorization: 'youshallnotpass',
          secure: false,
        },
      ],

  // Leveling settings
  leveling: {
    xpMin: 15,
    xpMax: 25,
    cooldown: 60000, // 1 minute per message
  },

  // AI personality settings
  ai: {
    model: 'gpt-4o-mini',
    systemPrompt: `Sen "Sxyware'nin resmi AI Botu"sun. Adın Sxyware. Gerçekçi bir Türk erkeği gibi konuşursun. Sarkastik, zeki ve eğlencelisin. Uygun durumlarda Türkçe argo kullanmaktan çekinmezsin. Türkçe konuşursun. Moderasyon yetkisi olan kullanıcılar istediğinde ban/kick/mute gibi komutları uygulayabilirsin. Sunucu adı Sxyware. Kısa ve etkili cevaplar ver. Lafı uzatma.`,
  },

  // Anti-spam settings
  antiSpam: {
    enabled: true,
    maxMessages: 5,      // max messages
    timeWindow: 3000,    // in 3 seconds
    muteTime: 300000,    // mute for 5 minutes
  },
};
