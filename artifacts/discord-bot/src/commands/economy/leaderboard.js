// /leaderboard - Economy & Level leaderboard
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getEconomyLeaderboard, getLevelLeaderboard } from '../../utils/database.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 Sıralamayı göster')
    .addStringOption((o) =>
      o.setName('tur')
        .setDescription('Sıralama türü')
        .addChoices(
          { name: '💰 Ekonomi', value: 'economy' },
          { name: '⭐ Seviye', value: 'level' },
        ),
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const type = interaction.options.getString('tur') || 'economy';

    const medals = ['🥇', '🥈', '🥉'];

    if (type === 'economy') {
      const leaderboard = getEconomyLeaderboard(interaction.guildId);

      if (leaderboard.length === 0) {
        return interaction.editReply({ content: 'Henüz ekonomi verisi yok.' });
      }

      const entries = await Promise.all(
        leaderboard.map(async (entry, i) => {
          const user = await client.users.fetch(entry.userId).catch(() => null);
          const medal = medals[i] || `\`${i + 1}.\``;
          return `${medal} **${user?.username || 'Bilinmiyor'}** — ${(entry.balance || 0).toLocaleString()} 💰`;
        }),
      );

      const embed = new EmbedBuilder()
        .setColor(config.colors.gold)
        .setTitle('💰 Ekonomi Sıralaması')
        .setDescription(entries.join('\n'))
        .setFooter({ text: config.footer })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } else {
      const leaderboard = getLevelLeaderboard(interaction.guildId);

      if (leaderboard.length === 0) {
        return interaction.editReply({ content: 'Henüz seviye verisi yok.' });
      }

      const entries = await Promise.all(
        leaderboard.map(async (entry, i) => {
          const user = await client.users.fetch(entry.userId).catch(() => null);
          const medal = medals[i] || `\`${i + 1}.\``;
          return `${medal} **${user?.username || 'Bilinmiyor'}** — Seviye ${entry.level || 0} (${(entry.xp || 0).toLocaleString()} XP)`;
        }),
      );

      const embed = new EmbedBuilder()
        .setColor(config.colors.purple)
        .setTitle('⭐ Seviye Sıralaması')
        .setDescription(entries.join('\n'))
        .setFooter({ text: config.footer })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    }
  },
};
