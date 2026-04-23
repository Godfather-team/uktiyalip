// /autoplay - Autoplay modu
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer, toggleAutoplay } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('🤖 Autoplay modunu aç/kapa (kuyruk bitince benzer şarkı ekler)'),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ embeds: [errorEmbed('Önce müzik başlat.')], ephemeral: true });
    }

    const enabled = toggleAutoplay(interaction.guildId);
    interaction.reply({
      embeds: [
        successEmbed(
          'Autoplay',
          enabled
            ? '🤖 **Aktif** — Kuyruk bittiğinde benzer şarkı önereceğim.'
            : '⏹️ **Kapalı** — Kuyruk bitince duracağım.',
        ),
      ],
    });
  },
};
