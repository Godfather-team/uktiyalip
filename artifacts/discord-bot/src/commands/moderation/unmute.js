// /unmute - Remove timeout from a user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createModEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Kullanıcının sesini aç')
    .addUserOption((o) => o.setName('kullanici').setDescription('Sesi açılacak kullanıcı').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Ses açma sebebi'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcı sunucuda değil.')], ephemeral: true });
    }

    if (!member.communicationDisabledUntil) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcı zaten susturulmuş değil.')], ephemeral: true });
    }

    try {
      await member.timeout(null, `${interaction.user.tag}: ${reason}`);
      interaction.reply({ embeds: [createModEmbed('unmute', target, reason, interaction.user)] });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Unmute başarısız: ${err.message}`)], ephemeral: true });
    }
  },
};
