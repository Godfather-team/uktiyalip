// /nowplaying - Now Playing (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { buildNowPlayingEmbed } from '../../music/playerEvents.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('🎵 Şu an çalan şarkıyı göster'),

  async execute(interaction, client) {
    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Şu an müzik çalmıyor.')], ephemeral: true });
    }

    const embed = buildNowPlayingEmbed(player);
    interaction.reply({ embeds: [embed] });
  },
};
