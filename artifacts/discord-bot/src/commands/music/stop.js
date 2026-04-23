// /stop - Stop and leave (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Müziği durdur ve kanaldan çık'),

  async execute(interaction, client) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.voice?.channelId) {
      return interaction.reply({ embeds: [errorEmbed('Ses kanalında değilsin!')], ephemeral: true });
    }

    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ embeds: [errorEmbed('Müzik çalmıyor.')], ephemeral: true });
    }

    player.destroy();
    interaction.reply({ embeds: [successEmbed('Durduruldu', 'Müzik durduruldu, kanaldan çıkıldı.')] });
  },
};
