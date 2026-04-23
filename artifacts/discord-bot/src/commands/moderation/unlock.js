// /unlock - Unlock channel
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('🔓 Kanalın kilidini aç')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      });

      interaction.reply({
        embeds: [successEmbed('🔓 Kanal Açıldı', 'Kanalın kilidi kaldırıldı.')],
      });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Kanal açılamadı: ${err.message}`)], ephemeral: true });
    }
  },
};
