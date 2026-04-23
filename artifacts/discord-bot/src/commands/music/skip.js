// /skip - Skip current track (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Mevcut şarkıyı atla'),

  async execute(interaction, client) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.voice?.channelId) {
      return interaction.reply({ embeds: [errorEmbed('Ses kanalında değilsin!')], ephemeral: true });
    }

    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Şu an çalan bir şarkı yok.')], ephemeral: true });
    }

    const title = player.queue.current.title || 'Bilinmiyor';
    player.skip();

    interaction.reply({ embeds: [successEmbed('Atlandı', `**${title}** atlandı.`)] });
  },
};
