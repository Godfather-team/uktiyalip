// /pause - Pause/resume (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Müziği duraklat / devam ettir'),

  async execute(interaction, client) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.voice?.channelId) {
      return interaction.reply({ embeds: [errorEmbed('Ses kanalında değilsin!')], ephemeral: true });
    }

    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Şu an müzik çalmıyor.')], ephemeral: true });
    }

    const wasPaused = player.paused;
    player.pause(!wasPaused);

    interaction.reply({
      embeds: [
        wasPaused
          ? successEmbed('Devam Ediyor', '▶️ Müzik devam ediyor.')
          : successEmbed('Duraklatıldı', '⏸️ Müzik duraklatıldı.'),
      ],
    });
  },
};
