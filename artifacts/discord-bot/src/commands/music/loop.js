// /loop - Toggle loop mode (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('🔁 Loop modunu değiştir')
    .addStringOption((o) =>
      o
        .setName('mod')
        .setDescription('Loop modu')
        .setRequired(true)
        .addChoices(
          { name: '❌ Kapalı', value: 'none' },
          { name: '🔂 Şarkı', value: 'track' },
          { name: '🔁 Kuyruk', value: 'queue' },
        ),
    ),

  async execute(interaction, client) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ embeds: [errorEmbed('Müzik çalmıyor.')], ephemeral: true });
    }

    const mode = interaction.options.getString('mod');
    player.setLoop(mode);

    const names = { none: '❌ Kapalı', track: '🔂 Şarkı', queue: '🔁 Kuyruk' };
    interaction.reply({ embeds: [successEmbed('Loop', `Loop modu: **${names[mode]}**`)] });
  },
};
