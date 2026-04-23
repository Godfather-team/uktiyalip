// Ticket System - Destek talebi yönetimi
// Developed by Sxy.com | Sxyware

import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { config } from '../config.js';
import { getGuildSettings, setGuildSettings } from './database.js';

// ============================================================
// TICKET PANEL (Buton)
// ============================================================

export function buildTicketPanelEmbed(guild) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🎫 SXYWARE DESTEK MERKEZİ')
    .setDescription(
      `**${guild.name}** sunucusunda yardıma mı ihtiyacın var?\n\n` +
        '> Aşağıdaki butonlardan birine tıklayarak size özel bir destek kanalı aç.\n\n' +
        '🟢 **Genel Destek** — Sorular, yardım talepleri\n' +
        '🟡 **Şikayet** — Bir kullanıcıyı bildir\n' +
        '🔴 **Hata Bildirimi** — Bot/sunucu hatası\n\n' +
        '⚡ Talebin yetkili ekip tarafından **anında** ele alınacak.',
    )
    .setFooter({ text: config.footer })
    .setTimestamp();
}

export function buildTicketPanelButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_open_general')
      .setLabel('Genel Destek')
      .setEmoji('🟢')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket_open_report')
      .setLabel('Şikayet')
      .setEmoji('🟡')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket_open_bug')
      .setLabel('Hata Bildirimi')
      .setEmoji('🔴')
      .setStyle(ButtonStyle.Danger),
  );
}

// ============================================================
// CREATE TICKET
// ============================================================

const TYPE_LABELS = {
  general: { name: 'genel', emoji: '🟢', title: 'Genel Destek' },
  report: { name: 'şikayet', emoji: '🟡', title: 'Şikayet' },
  bug: { name: 'hata', emoji: '🔴', title: 'Hata Bildirimi' },
};

export async function createTicket(interaction, type) {
  const guild = interaction.guild;
  const user = interaction.user;
  const settings = getGuildSettings(guild.id);
  const meta = TYPE_LABELS[type] || TYPE_LABELS.general;

  // Açık ticket kontrolü
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic?.includes(`TICKET_USER:${user.id}`),
  );
  if (existing) {
    return interaction.reply({
      content: `⚠️ Zaten açık bir destek talebin var: <#${existing.id}>`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // İzinler
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
  ];

  if (settings.modRole && guild.roles.cache.has(settings.modRole)) {
    overwrites.push({
      id: settings.modRole,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: `${meta.emoji}-${meta.name}-${user.username}`.slice(0, 95),
    type: ChannelType.GuildText,
    parent: settings.ticketCategory || null,
    topic: `TICKET_USER:${user.id} | TYPE:${type} | OPENED:${Date.now()}`,
    permissionOverwrites: overwrites,
    reason: `Ticket: ${user.tag} (${type})`,
  });

  const welcomeEmbed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`${meta.emoji} ${meta.title}`)
    .setDescription(
      `Merhaba <@${user.id}>! Talebin oluşturuldu.\n\n` +
        '**Lütfen sorununu detaylı bir şekilde açıkla.** Yetkili ekip mümkün olan en kısa sürede yardımcı olacaktır.\n\n' +
        '> ⚡ Talebi kapatmak için aşağıdaki **Kapat** butonuna basabilirsin.',
    )
    .setFooter({ text: config.footer })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Üstlen')
      .setEmoji('✋')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Kapat')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
  );

  const modPing = settings.modRole ? `<@&${settings.modRole}>` : '';
  await channel.send({ content: `<@${user.id}> ${modPing}`, embeds: [welcomeEmbed], components: [buttons] });

  await interaction.editReply({ content: `✅ Destek talebin oluşturuldu: <#${channel.id}>` });
}

// ============================================================
// CLAIM / CLOSE
// ============================================================

export async function claimTicket(interaction) {
  const channel = interaction.channel;
  if (!channel.topic?.includes('TICKET_USER:')) {
    return interaction.reply({ content: '⚠️ Bu bir ticket kanalı değil.', ephemeral: true });
  }
  const isMod =
    interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
    interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
  if (!isMod) {
    return interaction.reply({ content: '❌ Bu butonu sadece yetkili kullanabilir.', ephemeral: true });
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`✋ <@${interaction.user.id}> bu talebi üstlendi.`)
        .setFooter({ text: config.footer }),
    ],
  });
}

export async function closeTicket(interaction) {
  const channel = interaction.channel;
  if (!channel.topic?.includes('TICKET_USER:')) {
    return interaction.reply({ content: '⚠️ Bu bir ticket kanalı değil.', ephemeral: true });
  }
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle('🔒 Talep Kapatılıyor')
        .setDescription(`<@${interaction.user.id}> bu talebi kapattı. Kanal **5 saniye** içinde silinecek.`)
        .setFooter({ text: config.footer }),
    ],
  });

  // Transcript modlog'a düşür
  try {
    const settings = getGuildSettings(channel.guild.id);
    if (settings.modLogChannel) {
      const log = channel.guild.channels.cache.get(settings.modLogChannel);
      if (log?.isTextBased()) {
        const messages = await channel.messages.fetch({ limit: 50 });
        const transcript = [...messages.values()]
          .reverse()
          .map((m) => `[${new Date(m.createdTimestamp).toLocaleString('tr-TR')}] ${m.author.tag}: ${m.content || '(embed/dosya)'}`)
          .join('\n')
          .slice(0, 1900);
        await log.send({
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.secondary)
              .setTitle('🎫 Ticket Kapatıldı')
              .setDescription(`**Kanal:** #${channel.name}\n**Kapatan:** <@${interaction.user.id}>\n\n\`\`\`\n${transcript || '(boş)'}\n\`\`\``)
              .setFooter({ text: config.footer })
              .setTimestamp(),
          ],
        });
      }
    }
  } catch (err) {
    console.error('[Ticket] Transcript hatası:', err.message);
  }

  setTimeout(() => channel.delete('Ticket kapatıldı').catch(() => {}), 5000);
}

// ============================================================
// SETUP TICKET PANEL (called from /setup)
// ============================================================

export async function setupTicketPanel(guild) {
  const settings = getGuildSettings(guild.id);
  const ticketChannelId = settings.ticketPanelChannel;

  let panelChannel = ticketChannelId ? guild.channels.cache.get(ticketChannelId) : null;
  if (!panelChannel) return null;

  // Eski panelleri temizleme yapma; sadece yenisini gönder
  await panelChannel.send({
    embeds: [buildTicketPanelEmbed(guild)],
    components: [buildTicketPanelButtons()],
  }).catch((e) => console.error('[Ticket Panel] gönderme hatası:', e.message));

  return panelChannel;
}
