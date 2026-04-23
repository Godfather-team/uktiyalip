// /rank - Show user rank/level
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getLevelUser, getLevelLeaderboard } from '../../utils/database.js';
import { createRankEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('📊 Seviyeni ve sıralamayı göster')
    .addUserOption((o) => o.setName('kullanici').setDescription("Başka birinin sıralamasını gör")),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici') || interaction.user;
    const userData = getLevelUser(interaction.guildId, target.id);

    // Find rank in leaderboard
    const leaderboard = getLevelLeaderboard(interaction.guildId);
    const rankPos = leaderboard.findIndex((e) => e.userId === target.id) + 1;

    interaction.reply({
      embeds: [createRankEmbed(target, userData, rankPos || null)],
    });
  },
};
