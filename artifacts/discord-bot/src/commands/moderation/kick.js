// /kick - Kick a user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createModEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Kullanıcıyı at')
    .addUserOption((o) => o.setName('kullanici').setDescription('Atılacak kullanıcı').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Atma sebebi'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcı sunucuda değil.')], ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcıyı atamam! Yetkim yok.')], ephemeral: true });
    }

    try {
      await member.kick(`${interaction.user.tag}: ${reason}`);
      interaction.reply({ embeds: [createModEmbed('kick', target, reason, interaction.user)] });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Kick işlemi başarısız: ${err.message}`)], ephemeral: true });
    }
  },
};
