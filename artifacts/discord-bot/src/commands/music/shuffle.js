// /shuffle - Kuyruğu karıştır
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('🔀 Kuyruğu karıştır'),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player || player.queue.length < 2) {
      return interaction.reply({
        embeds: [errorEmbed('Karıştırılacak en az 2 şarkı olmalı.')],
        ephemeral: true,
      });
    }

    const queue = player.queue;
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    interaction.reply({
      embeds: [successEmbed('Kuyruk', `🔀 **${queue.length}** şarkı karıştırıldı.`)],
    });
  },
};
