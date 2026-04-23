// /queue - Show queue (Kazagumo)
// Developed by Sxy.com | Sxyware

import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

function formatMs(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function buildQueueEmbed(player, page) {
  const perPage = 10;
  const tracks = [...player.queue]; // upcoming only
  const total = Math.ceil(tracks.length / perPage) || 1;
  const start = page * perPage;
  const pageTracks = tracks.slice(start, start + perPage);

  let desc = '';
  const current = player.queue.current;

  if (current) {
    desc += `**🎵 Şu An Çalıyor:**\n[${current.title}](${current.uri}) — \`${formatMs(current.length)}\`\n\n`;
  }

  if (pageTracks.length > 0) {
    desc += `**📋 Sıradaki Şarkılar:**\n`;
    pageTracks.forEach((t, i) => {
      desc += `\`${start + i + 1}.\` [${t.title}](${t.uri}) — \`${formatMs(t.length)}\`\n`;
    });
  } else {
    desc += '*Kuyrukta başka şarkı yok.*';
  }

  const totalDur = tracks.reduce((a, t) => a + (t.length || 0), 0) + (current?.length || 0);
  const loop = player.loop || 'none';

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: '📋 Müzik Kuyruğu' })
    .setDescription(desc)
    .addFields(
      { name: '🔢 Toplam', value: `${tracks.length} şarkı`, inline: true },
      { name: '⏱️ Süre', value: formatMs(totalDur), inline: true },
      {
        name: '🔁 Loop',
        value: loop === 'track' ? 'Şarkı' : loop === 'queue' ? 'Kuyruk' : 'Kapalı',
        inline: true,
      },
    )
    .setFooter({ text: `${config.footer} • Sayfa ${page + 1}/${total}` })
    .setTimestamp();
}

export default {
  data: new SlashCommandBuilder().setName('queue').setDescription('📋 Müzik kuyruğunu göster'),

  async execute(interaction, client) {
    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Şu an müzik çalmıyor.')], ephemeral: true });
    }

    let page = 0;
    const totalPages = Math.ceil(player.queue.length / 10) || 1;

    const makeRow = (p) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('q_prev')
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(p === 0),
        new ButtonBuilder()
          .setCustomId('q_next')
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(p >= totalPages - 1),
      );

    const msg = await interaction.reply({
      embeds: [buildQueueEmbed(player, page)],
      components: totalPages > 1 ? [makeRow(page)] : [],
      fetchReply: true,
    });

    if (totalPages <= 1) return;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'q_prev') page = Math.max(0, page - 1);
      if (i.customId === 'q_next') page = Math.min(totalPages - 1, page + 1);
      await i.update({ embeds: [buildQueueEmbed(player, page)], components: [makeRow(page)] });
    });

    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};
