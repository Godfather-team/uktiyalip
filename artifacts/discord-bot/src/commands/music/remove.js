// /remove - Kuyruktan şarkı sil
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('🗑️ Kuyruktan belirli bir şarkıyı sil')
    .addIntegerOption((o) =>
      o.setName('sira').setDescription('Kuyruktaki sıra numarası').setRequired(true).setMinValue(1),
    ),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player || player.queue.length === 0) {
      return interaction.reply({ embeds: [errorEmbed('Kuyruk boş.')], ephemeral: true });
    }

    const idx = interaction.options.getInteger('sira') - 1;
    if (idx < 0 || idx >= player.queue.length) {
      return interaction.reply({
        embeds: [errorEmbed(`Geçerli sıra: 1 - ${player.queue.length}`)],
        ephemeral: true,
      });
    }

    const removed = player.queue.splice(idx, 1)[0];
    interaction.reply({
      embeds: [successEmbed('Silindi', `🗑️ **[${removed.title}](${removed.uri})** kuyruktan kaldırıldı.`)],
    });
  },
};
