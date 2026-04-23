// /ban - Ban a user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createModEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Kullanıcıyı banla')
    .addUserOption((o) => o.setName('kullanici').setDescription('Banlanacak kullanıcı').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Ban sebebi'))
    .addIntegerOption((o) => o.setName('gun').setDescription('Silinecek mesaj günü (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const days = interaction.options.getInteger('gun') || 0;

    const member = interaction.guild.members.cache.get(target.id);

    if (member) {
      if (!member.bannable) {
        return interaction.reply({ embeds: [errorEmbed('Bu kullanıcıyı banlayamam! Yetkim yok.')], ephemeral: true });
      }
      if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({ embeds: [errorEmbed('Bu kullanıcının rolü benden yüksek, banlayamam.')], ephemeral: true });
      }
    }

    try {
      await interaction.guild.bans.create(target.id, {
        reason: `${interaction.user.tag}: ${reason}`,
        deleteMessageSeconds: days * 86400,
      });

      interaction.reply({ embeds: [createModEmbed('ban', target, reason, interaction.user)] });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Ban işlemi başarısız: ${err.message}`)], ephemeral: true });
    }
  },
};
