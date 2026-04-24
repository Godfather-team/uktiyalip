// Message Create - Prefix commands, AI chat, leveling XP, anti-spam
// Developed by Sxy.com | Sxyware

import OpenAI from 'openai';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { addXP, getLevelUser, getXPForLevel, getAfk, removeAfk, getGuildSettings, getSticky, setSticky } from '../utils/database.js';
import { config } from '../config.js';
import { errorEmbed } from '../utils/embeds.js';
import { runAutomod } from '../utils/automod.js';
import { AI_TOOLS, executeTool } from '../utils/aiTools.js';

// AI client - Pollinations.ai (ücretsiz, key gerektirmez, OpenAI uyumlu)
// Model: 'openai' (gpt-4o-mini tabanlı, tool calling destekler)
const openai = new OpenAI({
  apiKey: 'free',
  baseURL: 'https://text.pollinations.ai/openai',
});
const AI_MODEL = 'openai';

// Conversation history per channel (for AI memory)
const conversationHistory = new Map();

// Dedup: aynı message.id için handler'ın iki kez çalışmasını engelle
const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 10 * 60 * 1000);

// Sticky mesaj throttle (kanal başına en son yenileme zamanı)
const stickyBumpCache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// BOMB PREFIX COMMAND HANDLER
// ============================================================

async function runBomb(channel, guild) {
  // Phase 1: Initializing
  const initEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('☢️ SXYWARE NÜKLEER PROTOKOLİ')
    .setDescription('```ansi\n\u001b[1;31m[SYSTEM] Sunucu imha protokolü başlatılıyor...\u001b[0m\n```')
    .addFields(
      { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
      { name: '🆔 Sunucu ID', value: `\`${guild.id}\``, inline: true },
      { name: '👥 Etkilenecek Kullanıcı', value: `**${guild.memberCount}** kişi`, inline: true },
      { name: '📡 Durum', value: '🔴 Bağlantı kuruluyor...', inline: false },
    )
    .setFooter({ text: 'UYARI: Bu işlem geri alınamaz | Sxyware Nükleer Sistemi' })
    .setTimestamp();

  const msg = await channel.send({ embeds: [initEmbed] });
  await sleep(2000);

  // Phase 2: Scanning
  const scanEmbed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setTitle('☢️ SİSTEM TARAMASI')
    .setDescription(
      '```\n[✓] Sunucu altyapısı tarandı\n[✓] Kanal yapısı analiz edildi\n[✓] Üye veritabanı çekildi\n[✓] İzin sistemi devre dışı bırakıldı\n[✓] Yedekleme sunucuları engellendi\n[✓] Discord API bağlantısı ele geçirildi\n[...] Silme protokolü yükleniyor...\n```',
    )
    .addFields(
      { name: '💾 Veri', value: `${(guild.memberCount * 2.3).toFixed(1)} MB hedeflendi`, inline: true },
      { name: '🔑 Güvenlik', value: '**DEVRE DIŞI**', inline: true },
      { name: '⚠️ Risk Seviyesi', value: '**MAXIMUM**', inline: true },
    )
    .setFooter({ text: 'Sxyware Nükleer Sistemi v2.4.1' })
    .setTimestamp();

  await msg.edit({ embeds: [scanEmbed] });
  await sleep(3000);

  // Phase 3: 60 second countdown
  let seconds = 60;

  while (seconds > 0) {
    const pct = (60 - seconds) / 60;
    const barLength = 20;
    const filled = Math.round(pct * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = seconds > 30 ? 0xFF4500 : seconds > 10 ? 0xFF8C00 : 0xFF0000;
    const pulse = seconds % 2 === 0 ? '💣' : '⚠️';

    const countEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${pulse} SUNUCU İMHA GERİ SAYIMI`)
      .setDescription(
        `\`\`\`\n[BOMB CORE] Aktif ve çalışıyor\n[TARGET  ] ${guild.name}\n[MEMBERS ] ${guild.memberCount} kişi\n[STATUS  ] DETONATE_PENDING\n\`\`\``,
      )
      .addFields(
        { name: '⏱️ Patlama', value: `**${seconds}** saniye sonra`, inline: true },
        { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
        { name: '☢️ Güç', value: `**${(pct * 100).toFixed(1)}%** şarj edildi`, inline: true },
        { name: '📊 İlerleme', value: `\`[${bar}]\` ${Math.round(pct * 100)}%`, inline: false },
        { name: '🔴 Durdurma Kodu', value: `\`SXYWARE-${Math.random().toString(36).substring(2, 8).toUpperCase()}\``, inline: false },
      )
      .setFooter({ text: `Sxyware Nükleer Sistemi • ${new Date().toLocaleTimeString('tr-TR')}` })
      .setTimestamp();

    await msg.edit({ embeds: [countEmbed] }).catch(() => {});
    await sleep(1000);
    seconds--;
  }

  // Phase 4: BOOM
  const boomEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('💥💥💥 BOM BOM BOM 💥💥💥')
    .setDescription(`# 💥 B O M ! ! !\n\n**${guild.name}** **PATLATILDI!**\n\n💥💥💥💥💥💥💥💥💥💥`)
    .addFields(
      { name: '☠️ Durum', value: '**YIKIMA TAMAMLANDI**', inline: true },
      { name: '👥 Etkilenen', value: `**${guild.memberCount}** kullanıcı`, inline: true },
      { name: '⏱️ Süre', value: '60 saniye', inline: true },
    )
    .setFooter({ text: 'Sxyware Nükleer Sistemi | GÖREV TAMAMLANDI' })
    .setTimestamp();

  await msg.edit({ embeds: [boomEmbed] });

  // Spam BOM messages
  const bomMessages = [
    '💥 **BOM!** 💥',
    '☢️ **BOM!!** ☢️',
    '💣 **BOM!!!** 💣',
    '🔥 **BOM!!!!** 🔥',
    '💥☢️💣🔥 **S E R V E R  D E S T R O Y E D** 🔥💣☢️💥',
  ];

  for (const m of bomMessages) {
    await channel.send(m).catch(() => {});
    await sleep(400);
  }
}

export default {
  name: 'messageCreate',
  once: false,

  async execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    // Dedup
    if (processedMessages.has(message.id)) return;
    processedMessages.add(message.id);

    // ============================================================
    // AUTOMOD (run first; aborts if message removed)
    // ============================================================
    const blocked = await runAutomod(message);
    if (blocked) return;

    // ============================================================
    // STICKY MESSAGE — kanaldaki sabit mesajı en aşağıya re-post et
    // Throttle: aynı kanalda 5 sn içinde tekrar yenileme
    // ============================================================
    try {
      const sticky = getSticky(message.channel.id);
      if (sticky && sticky.messageId !== message.id) {
        const lastBump = stickyBumpCache.get(message.channel.id) || 0;
        if (Date.now() - lastBump > 5000) {
          stickyBumpCache.set(message.channel.id, Date.now());
          // Eski sticky'yi sil
          message.channel.messages.fetch(sticky.messageId)
            .then((m) => m.delete().catch(() => {}))
            .catch(() => {});
          // Yeniden gönder
          const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('📌 Sabit Mesaj')
            .setDescription(sticky.text)
            .setFooter({ text: config.footer });
          message.channel.send({ embeds: [embed] })
            .then((sent) => {
              setSticky(message.channel.id, { ...sticky, messageId: sent.id });
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('[Sticky] hata:', err.message);
    }

    // ============================================================
    // AFK SYSTEM
    // ============================================================
    try {
      const myAfk = getAfk(message.guild.id, message.author.id);
      if (myAfk) {
        const data = removeAfk(message.guild.id, message.author.id);
        if (data) {
          const member = message.member;
          if (member?.manageable && member.nickname?.startsWith('[AFK] ')) {
            await member.setNickname(member.nickname.replace(/^\[AFK\]\s+/, '')).catch(() => {});
          }
          const since = Math.floor((Date.now() - data.since) / 1000);
          const reply = await message.channel.send(`👋 <@${message.author.id}> hoş geldin! ${since}sn AFK kaldın.`);
          setTimeout(() => reply.delete().catch(() => {}), 8000);
        }
      }

      const mentioned = message.mentions.users;
      if (mentioned.size > 0 && mentioned.size <= 3) {
        for (const u of mentioned.values()) {
          if (u.id === message.author.id || u.bot) continue;
          const afk = getAfk(message.guild.id, u.id);
          if (afk) {
            const since = Math.floor((Date.now() - afk.since) / 1000);
            await message.reply({
              content: `💤 <@${u.id}> şu an **AFK**: ${afk.reason} (${since}sn önce)`,
              allowedMentions: { users: [] },
            }).catch(() => {});
            break;
          }
        }
      }
    } catch (err) {
      console.error('[AFK] hata:', err.message);
    }

    const content = message.content.trim();

    // ============================================================
    // PREFIX COMMAND HANDLER (.)
    // ============================================================
    if (content.startsWith('.')) {
      const args = content.slice(1).trim().split(/\s+/);
      const cmd = args[0]?.toLowerCase();

      if (cmd === 'bomb') {
        // Delete trigger message for realism
        message.delete().catch(() => {});
        runBomb(message.channel, message.guild);
        return;
      }
    }

    // ============================================================
    // ANTI-SPAM SYSTEM
    // ============================================================
    if (config.antiSpam.enabled) {
      const key = `${message.guild.id}_${message.author.id}`;
      const now = Date.now();
      const userData = client.spamMap.get(key) || { msgs: [], muted: false };

      userData.msgs = userData.msgs.filter((t) => now - t < config.antiSpam.timeWindow);
      userData.msgs.push(now);
      client.spamMap.set(key, userData);

      if (userData.msgs.length >= config.antiSpam.maxMessages && !userData.muted) {
        userData.muted = true;
        client.spamMap.set(key, userData);

        try {
          const member = message.guild.members.cache.get(message.author.id);
          if (member && message.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            await member.timeout(config.antiSpam.muteTime, 'Otomatik Anti-Spam sistemi');
            message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(config.colors.warning)
                  .setTitle('⚠️ Anti-Spam Sistemi')
                  .setDescription(`<@${message.author.id}> spam yaptığı için **5 dakika** susturuldu.`)
                  .setFooter({ text: config.footer })
                  .setTimestamp(),
              ],
            });
          }
        } catch (err) {
          console.error('[AntiSpam] Timeout uygulanamadı:', err.message);
        }

        setTimeout(() => {
          const data = client.spamMap.get(key);
          if (data) {
            data.muted = false;
            client.spamMap.set(key, data);
          }
        }, config.antiSpam.muteTime);
      }
    }

    // ============================================================
    // LEVELING XP SYSTEM
    // ============================================================
    const levelData = getLevelUser(message.guild.id, message.author.id);
    const now = Date.now();

    if (now - (levelData.lastXP || 0) > config.leveling.cooldown) {
      const xpGain = Math.floor(
        Math.random() * (config.leveling.xpMax - config.leveling.xpMin + 1) + config.leveling.xpMin,
      );
      const result = addXP(message.guild.id, message.author.id, xpGain);

      if (result.leveledUp) {
        const embed = new EmbedBuilder()
          .setColor(config.colors.purple)
          .setTitle('🎉 Seviye Atladın!')
          .setDescription(
            `Tebrikler <@${message.author.id}>! **${result.oldLevel}** → **${result.newLevel}** seviyesine ulaştın!`,
          )
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter({ text: config.footer })
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }
    }

    // ============================================================
    // AI CHAT SYSTEM (when bot is mentioned)
    // ============================================================
    const isMentioned = message.mentions.has(client.user);
    if (!isMentioned) return;

    const userMessage = message.content.replace(/<@!?[0-9]+>/g, '').trim();
    if (!userMessage) return;

    await message.channel.sendTyping();

    const channelId = message.channel.id;
    if (!conversationHistory.has(channelId)) {
      conversationHistory.set(channelId, []);
    }

    const history = conversationHistory.get(channelId);

    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    history.push({
      role: 'user',
      content: `${message.author.username} (id: ${message.author.id}): ${userMessage}`,
    });

    // Sunucu bağlamı (AI kanal/rol ID'lerini bilsin diye)
    const settings = getGuildSettings(message.guild.id);
    const member = message.member;
    const isMod =
      member?.permissions.has(PermissionFlagsBits.Administrator) ||
      member?.permissions.has(PermissionFlagsBits.ManageGuild) ||
      member?.permissions.has(PermissionFlagsBits.BanMembers) ||
      member?.permissions.has(PermissionFlagsBits.ModerateMembers) ||
      member?.id === message.guild.ownerId;

    const systemPrompt =
      config.ai.systemPrompt +
      `\n\n[SUNUCU BAĞLAMI]
Sunucu: ${message.guild.name} (id: ${message.guild.id})
Sahip: ${message.guild.ownerId}
Konuşan: ${message.author.username} (id: ${message.author.id}) — ${isMod ? 'YETKİLİ MOD' : 'normal üye'}
Mevcut kanal: #${message.channel.name} (id: ${message.channel.id})

[YETENEKLER]
Senin Administrator yetkin var ve sunucuyu yönetebilirsin: kullanıcı banlama/atma/timeout, kanal/rol oluşturma-silme, mesaj silme, slowmode, kilit, rol verme/alma vb.
Bunun için tools'u kullan. ÖNEMLİ:
- Bir işlem yapmadan önce ID bilmiyorsan önce 'get_server_info' ya da 'find_user' çağır.
- Konuşan kişi yetkili değilse moderasyon araçlarını kullanma; nazikçe reddet.
- Sunucu sahibine ve adminlere asla moderasyon uygulama.
- Birden fazla araç gerekiyorsa sırayla çağır (önce keşif, sonra eylem).
- Eylemden sonra kullanıcıya ne yaptığını Türkçe sarkastik bir tonla özetle.
- Uydurma; emin değilsen önce 'get_server_info' ile doğrula.

[KAYITLI AYARLAR]
${JSON.stringify(settings, null, 0)}`;

    await runAgentLoop(message, history, systemPrompt);
  },
};

// ============================================================
// AI AGENT LOOP — tool calling ile çoklu adım
// ============================================================

async function runAgentLoop(message, history, systemPrompt) {
  const ctx = {
    guild: message.guild,
    channel: message.channel,
    member: message.member,
    author: message.author,
  };

  const messages = [{ role: 'system', content: systemPrompt }, ...history];
  const MAX_STEPS = 6;

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages,
        tools: AI_TOOLS,
        tool_choice: 'auto',
        max_tokens: 700,
        temperature: 0.8,
      });

      const choice = response.choices[0];
      const msg = choice.message;
      messages.push(msg);

      // Tool çağrısı varsa çalıştır
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const call of msg.tool_calls) {
          let args = {};
          try { args = JSON.parse(call.function.arguments || '{}'); } catch {}
          const result = await executeTool(call.function.name, args, ctx);
          console.log(`[AI Tool] ${call.function.name}(${JSON.stringify(args).slice(0, 80)}) →`, result.ok ? 'ok' : `err: ${result.error}`);
          messages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify(result).slice(0, 4000),
          });
        }
        continue; // bir sonraki tur
      }

      // Tool çağrısı yok → final yanıt
      const reply = msg.content || 'Bi hata oldu ya, sonra dene.';
      history.push({ role: 'assistant', content: reply });

      if (reply.length > 2000) {
        const chunks = reply.match(/[\s\S]{1,2000}/g) || [reply];
        for (const chunk of chunks) await message.reply(chunk);
      } else {
        await message.reply(reply);
      }
      return;
    }

    await message.reply('Çok adım oldu, kafam karıştı. Daha net söyle.');
  } catch (err) {
    console.error('[AI Agent] Yanıt oluşturulamadı:', err.message);
    await message.reply('Şu an konuşamam, sonra tekrar dene.').catch(() => {});
  }
}
