// /clearqueue - Kuyruğu temizle
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('clearqueue').setDescription('🧹 Kuyruğu tamamen temizle'),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player || player.queue.length === 0) {
      return interaction.reply({ embeds: [errorEmbed('Kuyruk zaten boş.')], ephemeral: true });
    }

    const count = player.queue.length;
    player.queue.clear();
    interaction.reply({ embeds: [successEmbed('Kuyruk', `🧹 **${count}** şarkı kuyruktan silindi.`)] });
  },
};
