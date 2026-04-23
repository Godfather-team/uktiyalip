// Autonomous AI - Botun sunucuyu kendiliğinden izleyip iyileştirdiği zamanlanmış görevler
// Developed by Sxy.com | Sxyware

import OpenAI from 'openai';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings, setGuildSettings } from './database.js';
import { AI_TOOLS, executeTool } from './aiTools.js';
import { config } from '../config.js';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy',
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Otonom döngü - 30 dakikada bir aktif sunucularda çalışır
export function startAutonomousLoop(client) {
  const INTERVAL = 30 * 60 * 1000;

  setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
      const settings = getGuildSettings(guild.id);
      if (!settings.autonomousMode) continue;
      try {
        await runAutonomousTick(guild, settings);
      } catch (e) {
        console.error(`[Autonomous] ${guild.name} hatası:`, e.message);
      }
    }
  }, INTERVAL);

  console.log('[Autonomous] ✅ Zamanlanmış otonom döngü başlatıldı (30 dk).');
}

async function runAutonomousTick(guild, settings) {
  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.Administrator)) return;

  // Sunucu bağlamını topla
  const channels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
  const orphan = guild.channels.cache.filter(
    (c) => (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) && !c.parentId,
  );

  const prompt =
    `Sen Sxyware otonom AI'sın. Şu sunucuyu sessizce iyileştir:\n` +
    `Sunucu: ${guild.name} (${guild.memberCount} üye)\n` +
    `Kanal: ${channels} text, ${categories} kategori\n` +
    `Kategorisiz kanallar: ${orphan.size}\n` +
    `Ayarlar: ${JSON.stringify(settings)}\n\n` +
    `Görev:\n` +
    `- Eksik temel kanallar varsa öner; yarat.\n` +
    `- Kategorisiz kanalları uygun kategoriye taşı.\n` +
    `- Eski/spam ticket kanallarını tespit et (24 saat eylem yoksa kapatılabilir).\n` +
    `- Çok değişiklik yapma; sadece 1-2 düzeltme. Yıkıcı değil yapıcı ol.\n` +
    `- Hiç değişiklik gerekmiyorsa hiç tool çağırma, sadece kısa bir rapor yaz.`;

  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: 'Sunucuyu kontrol et ve gerekiyorsa iyileştir.' },
  ];

  // Owner-equivalent ctx (autonomous = bot itself acting)
  const ctx = {
    guild,
    channel: guild.systemChannel || guild.channels.cache.find((c) => c.type === ChannelType.GuildText),
    member: me,
    author: me.user,
  };

  for (let step = 0; step < 4; step++) {
    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: AI_TOOLS,
        tool_choice: 'auto',
        max_tokens: 500,
      });
    } catch (e) {
      console.error('[Autonomous] OpenAI hatası:', e.message);
      return;
    }

    const msg = response.choices[0].message;
    messages.push(msg);

    if (msg.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        let args = {};
        try { args = JSON.parse(call.function.arguments || '{}'); } catch {}
        const result = await executeTool(call.function.name, args, ctx);
        console.log(`[Autonomous][${guild.name}] ${call.function.name}:`, result.ok ? 'ok' : result.error);
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result).slice(0, 2000) });
      }
      continue;
    }

    // Modlog'a rapor düşür
    if (msg.content && settings.modLogChannel) {
      const log = guild.channels.cache.get(settings.modLogChannel);
      if (log?.isTextBased()) {
        await log.send({
          embeds: [{
            color: config.colors.purple,
            title: '🤖 Otonom AI Raporu',
            description: msg.content.slice(0, 2000),
            footer: { text: config.footer },
            timestamp: new Date().toISOString(),
          }],
        }).catch(() => {});
      }
    }
    return;
  }
}
