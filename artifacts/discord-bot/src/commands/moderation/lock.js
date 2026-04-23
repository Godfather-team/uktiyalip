// /lock & /unlock - Channel lock
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('🔒 Kanalı kilitle')
    .addStringOption((o) => o.setName('sebep').setDescription('Kilitleme sebebi'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      interaction.reply({
        embeds: [successEmbed('🔒 Kanal Kilitlendi', `Bu kanal kilitlendi.\n**Sebep:** ${reason}`)],
      });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Kanal kilitlenemedi: ${err.message}`)], ephemeral: true });
    }
  },
};
