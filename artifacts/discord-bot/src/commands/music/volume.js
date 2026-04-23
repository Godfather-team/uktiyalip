// /volume - Set volume (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('🔊 Ses seviyesini ayarla (0-150)')
    .addIntegerOption((o) =>
      o.setName('seviye').setDescription('Ses seviyesi').setRequired(true).setMinValue(0).setMaxValue(150),
    ),

  async execute(interaction, client) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ embeds: [errorEmbed('Müzik çalmıyor.')], ephemeral: true });
    }

    const vol = interaction.options.getInteger('seviye');
    player.setVolume(vol);

    const segs = Math.round(vol / 15);
    const bar = '█'.repeat(segs) + '░'.repeat(10 - Math.min(segs, 10));
    interaction.reply({ embeds: [successEmbed('Ses Seviyesi', `\`[${bar}]\` **${vol}%**`)] });
  },
};
