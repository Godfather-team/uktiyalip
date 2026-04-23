// /giveaway - Çekiliş sistemi
// Developed by Sxy.com | Sxyware

import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import {
  saveGiveaway,
  getGiveaway,
  deleteGiveaway,
  listActiveGiveaways,
} from '../../utils/database.js';
import { config } from '../../config.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

function parseDuration(s) {
  const m = s.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  const u = m[2].toLowerCase();
  return n * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[u];
}

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 Çekiliş sistemi')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addSubcommand((s) =>
      s
        .setName('start')
        .setDescription('Yeni çekiliş başlat')
        .addStringOption((o) => o.setName('odul').setDescription('Çekiliş ödülü').setRequired(true))
        .addStringOption((o) =>
          o.setName('sure').setDescription('Süre (örn: 30s, 5m, 2h, 1d)').setRequired(true),
        )
        .addIntegerOption((o) =>
          o.setName('kazanan').setDescription('Kazanan sayısı (varsayılan 1)').setMinValue(1).setMaxValue(20),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('end')
        .setDescription('Çekilişi erken bitir')
        .addStringOption((o) => o.setName('mesaj_id').setDescription('Çekiliş mesaj ID').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('reroll')
        .setDescription('Çekilişi tekrar çek')
        .addStringOption((o) => o.setName('mesaj_id').setDescription('Çekiliş mesaj ID').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('list').setDescription('Aktif çekilişleri listele')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const odul = interaction.options.getString('odul');
      const sureStr = interaction.options.getString('sure');
      const winners = interaction.options.getInteger('kazanan') || 1;
      const ms = parseDuration(sureStr);
      if (!ms) {
        return interaction.reply({
          embeds: [errorEmbed('Geçersiz süre. Örn: `30s`, `5m`, `2h`, `1d`')],
          ephemeral: true,
        });
      }
      const endsAt = Date.now() + ms;

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🎉 ÇEKİLİŞ')
        .setDescription(
          `**Ödül:** ${odul}\n**Kazanan:** ${winners}\n**Bitiş:** <t:${Math.floor(endsAt / 1000)}:R>\n\nKatılmak için aşağıdaki butona bas!`,
        )
        .setFooter({ text: `${config.footer} • Düzenleyen: ${interaction.user.username}` })
        .setTimestamp(endsAt);

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_join')
          .setLabel('🎉 Katıl')
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.reply({ embeds: [embed], components: [button] });
      const msg = await interaction.fetchReply();

      saveGiveaway({
        messageId: msg.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        prize: odul,
        winners,
        endsAt,
        hostId: interaction.user.id,
        participants: [],
        ended: false,
      });
    }

    if (sub === 'end') {
      const mid = interaction.options.getString('mesaj_id');
      const g = getGiveaway(mid);
      if (!g || g.ended) {
        return interaction.reply({
          embeds: [errorEmbed('Çekiliş bulunamadı veya zaten bitmiş.')],
          ephemeral: true,
        });
      }
      await endGiveaway(interaction.client, mid);
      return interaction.reply({ embeds: [successEmbed('Çekiliş', '✅ Erken sonlandırıldı.')], ephemeral: true });
    }

    if (sub === 'reroll') {
      const mid = interaction.options.getString('mesaj_id');
      const g = getGiveaway(mid);
      if (!g) {
        return interaction.reply({ embeds: [errorEmbed('Çekiliş bulunamadı.')], ephemeral: true });
      }
      const winners = pickWinners(g.participants, g.winners);
      const channel = interaction.client.channels.cache.get(g.channelId);
      if (channel?.isTextBased?.()) {
        const msgLink = `https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId}`;
        if (winners.length === 0) {
          channel.send(`🎉 Reroll: Katılımcı yok. ([çekiliş](${msgLink}))`);
        } else {
          channel.send(
            `🎉 **REROLL** Yeni kazanan${winners.length > 1 ? 'lar' : ''}: ${winners.map((w) => `<@${w}>`).join(', ')} • Ödül: **${g.prize}**`,
          );
        }
      }
      return interaction.reply({ embeds: [successEmbed('Reroll', 'Tamamlandı.')], ephemeral: true });
    }

    if (sub === 'list') {
      const list = listActiveGiveaways().filter((g) => g.guildId === interaction.guildId);
      if (!list.length) {
        return interaction.reply({
          embeds: [errorEmbed('Aktif çekiliş yok.')],
          ephemeral: true,
        });
      }
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🎉 Aktif Çekilişler')
        .setDescription(
          list
            .map(
              (g) =>
                `• **${g.prize}** • Kazanan: ${g.winners} • Bitiş: <t:${Math.floor(g.endsAt / 1000)}:R> • [git](https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId})`,
            )
            .join('\n'),
        )
        .setFooter({ text: config.footer });
      return interaction.reply({ embeds: [embed] });
    }
  },
};

// ============================================================
// HELPERS
// ============================================================

function pickWinners(participants, count) {
  const pool = [...new Set(participants)];
  const winners = [];
  while (winners.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(i, 1)[0]);
  }
  return winners;
}

export async function endGiveaway(client, messageId) {
  const g = getGiveaway(messageId);
  if (!g || g.ended) return;
  g.ended = true;
  saveGiveaway(g);

  const channel = client.channels.cache.get(g.channelId);
  if (!channel?.isTextBased?.()) return;

  let msg;
  try {
    msg = await channel.messages.fetch(messageId);
  } catch {
    return;
  }

  const winners = pickWinners(g.participants, g.winners);
  const winnerText =
    winners.length === 0
      ? '*Katılımcı yok* 😢'
      : winners.map((w) => `<@${w}>`).join(', ');

  const embed = new EmbedBuilder()
    .setColor(config.colors.success || 0x00FF00)
    .setTitle('🎉 ÇEKİLİŞ BİTTİ')
    .setDescription(
      `**Ödül:** ${g.prize}\n**Kazanan${winners.length > 1 ? 'lar' : ''}:** ${winnerText}\n**Katılımcı:** ${g.participants.length}`,
    )
    .setFooter({ text: config.footer })
    .setTimestamp();

  await msg.edit({ embeds: [embed], components: [] }).catch(() => {});

  if (winners.length > 0) {
    channel
      .send(
        `🎉 Tebrikler ${winners.map((w) => `<@${w}>`).join(', ')}! **${g.prize}** kazandın${winners.length > 1 ? 'ız' : ''}!`,
      )
      .catch(() => {});
  } else {
    channel.send(`🎉 Çekiliş bitti ama kimse katılmadı.`).catch(() => {});
  }
}

export function startGiveawayTimer(client) {
  setInterval(async () => {
    const list = listActiveGiveaways();
    const now = Date.now();
    for (const g of list) {
      if (g.endsAt <= now) {
        await endGiveaway(client, g.messageId).catch(() => {});
      }
    }
  }, 10000);
}
