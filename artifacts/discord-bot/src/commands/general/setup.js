// /setup - Akıllı sunucu kurulum sihirbazı
// Kategori + izinler + ticket paneli + welcome panel
// Developed by Sxy.com | Sxyware

import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { config } from '../../config.js';
import { setGuildSettings, getGuildSettings } from '../../utils/database.js';
import { setupTicketPanel } from '../../utils/tickets.js';

// İsimlendirme ipuçları
const HINTS = {
  welcomeChannel: ['hoş', 'hosgeldin', 'welcome', 'giriş', 'giris', 'karşılama'],
  goodbyeChannel: ['güle', 'gule', 'goodbye', 'çıkış', 'cikis', 'bye', 'ayrılan'],
  modLogChannel: ['mod-log', 'modlog', 'mod log', 'moderation', 'admin-log'],
  messageLogChannel: ['mesaj-log', 'message-log', 'msg-log', 'silinen'],
  generalChannel: ['genel', 'general', 'sohbet', 'chat', 'lobby', 'lobi'],
  musicChannel: ['müzik', 'muzik', 'music', 'şarkı', 'sarki'],
  aiChannel: ['ai', 'yapay-zeka', 'sxyware-ai', 'bot-chat'],
  ticketPanelChannel: ['ticket', 'destek', 'support', 'yardım', 'yardim'],
  rulesChannel: ['kural', 'kurallar', 'rules', 'rule'],
  announcementChannel: ['duyuru', 'announcement', 'announce', 'haber'],
};

const ROLE_HINTS = {
  muteRole: ['muted', 'mute', 'sus', 'susturul', 'cezalı', 'cezali'],
  autoRole: ['üye', 'uye', 'member', 'verified', 'doğrulanmış'],
  modRole: ['mod', 'moderator', 'moderatör', 'staff', 'yetkili'],
  djRole: ['dj', 'müzik', 'muzik'],
};

// Kategori → kanal yapısı
const STRUCTURE = [
  {
    category: '📜 BİLGİ',
    channels: [
      { key: 'rulesChannel', name: '📜-kurallar', publicRead: true, publicWrite: false },
      { key: 'announcementChannel', name: '📢-duyurular', publicRead: true, publicWrite: false },
    ],
  },
  {
    category: '👋 KARŞILAMA',
    channels: [
      { key: 'welcomeChannel', name: '👋-hoş-geldin', publicRead: true, publicWrite: false },
      { key: 'goodbyeChannel', name: '😢-güle-güle', publicRead: true, publicWrite: false },
    ],
  },
  {
    category: '💬 SOHBET',
    channels: [
      { key: 'generalChannel', name: '💬-genel', publicRead: true, publicWrite: true },
      { key: 'aiChannel', name: '🤖-sxyware-ai', publicRead: true, publicWrite: true },
      { key: 'musicChannel', name: '🎵-müzik', publicRead: true, publicWrite: true },
    ],
  },
  {
    category: '🎫 DESTEK',
    channels: [
      { key: 'ticketPanelChannel', name: '🎫-destek-aç', publicRead: true, publicWrite: false },
    ],
    isTicketCategory: true,
  },
  {
    category: '📋 SXYWARE LOG',
    modOnly: true,
    channels: [
      { key: 'modLogChannel', name: '📋-mod-log', publicRead: false, publicWrite: false },
      { key: 'messageLogChannel', name: '📝-mesaj-log', publicRead: false, publicWrite: false },
    ],
  },
];

function findChannelByHints(guild, hints, type = ChannelType.GuildText) {
  const channels = guild.channels.cache.filter((c) => c.type === type);
  for (const hint of hints) {
    const exact = channels.find((c) => c.name.toLowerCase() === hint);
    if (exact) return exact;
  }
  for (const hint of hints) {
    const partial = channels.find((c) => c.name.toLowerCase().includes(hint));
    if (partial) return partial;
  }
  return null;
}

function findCategoryByName(guild, name) {
  const lower = name.toLowerCase();
  return guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildCategory &&
      c.name.toLowerCase().includes(lower.replace(/[^\wçğıöşü]/g, '').slice(0, 6)),
  );
}

function findRoleByHints(guild, hints) {
  for (const hint of hints) {
    const exact = guild.roles.cache.find((r) => r.name.toLowerCase() === hint);
    if (exact) return exact;
  }
  for (const hint of hints) {
    const partial = guild.roles.cache.find(
      (r) => r.name.toLowerCase().includes(hint) && r.id !== guild.id,
    );
    if (partial) return partial;
  }
  return null;
}

async function ensureCategory(guild, name, modOnly, modRoleId) {
  let cat = findCategoryByName(guild, name);
  if (cat) return cat;

  const overwrites = modOnly
    ? [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        ...(modRoleId
          ? [{ id: modRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }]
          : []),
      ]
    : [];

  cat = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: overwrites,
    reason: 'Sxyware /setup',
  });
  return cat;
}

async function ensureChannel(guild, settings, plan, parentId, modRoleId) {
  let channel = settings[plan.key] ? guild.channels.cache.get(settings[plan.key]) : null;
  if (!channel) channel = findChannelByHints(guild, HINTS[plan.key]);

  const overwrites = [];
  if (!plan.publicRead) {
    overwrites.push({ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] });
    if (modRoleId) {
      overwrites.push({
        id: modRoleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
      });
    }
  } else if (!plan.publicWrite) {
    overwrites.push({ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.SendMessages] });
    if (modRoleId) {
      overwrites.push({ id: modRoleId, allow: [PermissionFlagsBits.SendMessages] });
    }
  }

  if (channel) {
    // Mevcut kanalı kategoriye taşı + izinleri uygula
    try {
      if (channel.parentId !== parentId) await channel.setParent(parentId, { lockPermissions: false });
      for (const ow of overwrites) {
        await channel.permissionOverwrites.edit(ow.id, {
          ViewChannel: ow.deny?.includes(PermissionFlagsBits.ViewChannel) ? false : ow.allow?.includes(PermissionFlagsBits.ViewChannel) ? true : null,
          SendMessages: ow.deny?.includes(PermissionFlagsBits.SendMessages) ? false : ow.allow?.includes(PermissionFlagsBits.SendMessages) ? true : null,
          ReadMessageHistory: ow.allow?.includes(PermissionFlagsBits.ReadMessageHistory) ? true : null,
        }).catch(() => {});
      }
      return { channel, action: 'düzenlendi' };
    } catch (e) {
      return { channel, action: `taşıma hatası: ${e.message}` };
    }
  }

  try {
    channel = await guild.channels.create({
      name: plan.name,
      type: ChannelType.GuildText,
      parent: parentId,
      permissionOverwrites: overwrites,
      reason: 'Sxyware /setup',
    });
    return { channel, action: 'oluşturuldu' };
  } catch (e) {
    return { channel: null, action: `hata: ${e.message}` };
  }
}

async function ensureMuteRole(guild, settings) {
  let role = settings.muteRole ? guild.roles.cache.get(settings.muteRole) : null;
  if (role) return role;

  role = findRoleByHints(guild, ROLE_HINTS.muteRole);
  if (role) return role;

  try {
    role = await guild.roles.create({
      name: 'Muted',
      color: 0x95a5a6,
      reason: 'Sxyware /setup',
      permissions: [],
    });
    for (const channel of guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
        await channel.permissionOverwrites
          .create(role, {
            SendMessages: false,
            AddReactions: false,
            Speak: false,
            CreatePublicThreads: false,
            CreatePrivateThreads: false,
            SendMessagesInThreads: false,
          })
          .catch(() => {});
      }
    }
    return role;
  } catch {
    return null;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🛠️ Sunucuyu otomatik kurar: kategoriler, kanallar, izinler, ticket paneli.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // ÖNCE defer (timeout'tan kaçınmak için)
    await interaction.deferReply({ flags: 64 }); // ephemeral

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.editReply({ content: '❌ Bu komut için **Sunucuyu Yönet** yetkin olmalı.' });
    }

    const guild = interaction.guild;
    const me = guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.editReply({ content: '❌ Botun **Administrator** yetkisi yok. Lütfen rolüne bu yetkiyi ver.' });
    }

    const settings = getGuildSettings(guild.id);
    const log = [];
    const result = {};

    // Önce mod role tespit
    const detectedModRole = findRoleByHints(guild, ROLE_HINTS.modRole);
    const modRoleId = detectedModRole?.id || settings.modRole || null;
    if (detectedModRole) {
      result.modRole = detectedModRole.id;
      log.push(`🛡️ **Mod rolü** → <@&${detectedModRole.id}>`);
    }

    // Mute rolü
    const muteRole = await ensureMuteRole(guild, settings);
    if (muteRole) {
      result.muteRole = muteRole.id;
      log.push(`🔇 **Mute rolü** → <@&${muteRole.id}>`);
    }

    // Diğer rol tespitleri
    for (const [key, hints] of Object.entries(ROLE_HINTS)) {
      if (key === 'muteRole' || key === 'modRole') continue;
      const role = findRoleByHints(guild, hints);
      if (role) {
        result[key] = role.id;
        log.push(`🎭 **${key}** → <@&${role.id}>`);
      }
    }

    // ---------- Kategoriler + Kanallar ----------
    let ticketCategoryId = null;

    for (const block of STRUCTURE) {
      const category = await ensureCategory(guild, block.category, !!block.modOnly, modRoleId);
      log.push(`📁 **${block.category}** → ${category.id}`);

      for (const plan of block.channels) {
        const { channel, action } = await ensureChannel(guild, settings, plan, category.id, modRoleId);
        if (channel) {
          result[plan.key] = channel.id;
          log.push(`  └ <#${channel.id}> *(${action})*`);
        } else {
          log.push(`  └ ❌ ${plan.key}: ${action}`);
        }
      }

      if (block.isTicketCategory) {
        ticketCategoryId = category.id;
        result.ticketCategory = category.id;
      }
    }

    // ---------- Ayarları kaydet ----------
    setGuildSettings(guild.id, {
      ...result,
      setupCompletedAt: Date.now(),
      setupBy: interaction.user.id,
    });

    // ---------- Ticket paneli yayınla ----------
    if (result.ticketPanelChannel) {
      await setupTicketPanel(guild).catch((e) => log.push(`⚠️ Ticket panel: ${e.message}`));
      log.push(`🎫 Ticket paneli <#${result.ticketPanelChannel}> kanalına yerleştirildi`);
    }

    // ---------- Hoşgeldin embed ----------
    if (result.generalChannel) {
      const general = guild.channels.cache.get(result.generalChannel);
      if (general?.isTextBased()) {
        const intro = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle('🔥 SXYWARE AKTİF!')
          .setDescription(
            `**${guild.name}** sunucusu Sxyware tarafından **otomatik kuruldu**.\n\n` +
              '🎯 Yeni kategoriler, kanallar, izinler ve ticket sistemi hazır.\n' +
              '🤖 Botu mention\'layarak doğal dilde komut verebilirsin.\n' +
              '🎫 <#' + (result.ticketPanelChannel || '0') + '> kanalından destek alabilirsin.\n\n' +
              '> `/help` ile tüm komutlara göz at.',
          )
          .setFooter({ text: config.footer })
          .setTimestamp();
        await general.send({ embeds: [intro] }).catch(() => {});
      }
    }

    // ---------- Final özet ----------
    const summary = log.join('\n').slice(0, 4000);
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🛠️ SXYWARE Akıllı Kurulum Tamamlandı')
      .setDescription(
        `**${guild.name}** için tam otomatik kurulum bitti.\n\n` +
          summary +
          `\n\n📊 ${guild.memberCount} üye • ${guild.channels.cache.size} kanal • ${guild.roles.cache.size} rol`,
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
