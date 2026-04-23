// /mute - Timeout a user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createModEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Kullanıcıyı sustur')
    .addUserOption((o) => o.setName('kullanici').setDescription('Susturulacak kullanıcı').setRequired(true))
    .addIntegerOption((o) =>
      o.setName('sure').setDescription('Süre (dakika, varsayılan 10)').setMinValue(1).setMaxValue(40320),
    )
    .addStringOption((o) => o.setName('sebep').setDescription('Susturma sebebi'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const duration = (interaction.options.getInteger('sure') || 10) * 60 * 1000;
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcı sunucuda değil.')], ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ embeds: [errorEmbed('Bu kullanıcıyı susturamam! Yetkim yok.')], ephemeral: true });
    }

    try {
      await member.timeout(duration, `${interaction.user.tag}: ${reason}`);
      interaction.reply({ embeds: [createModEmbed('mute', target, `${reason} (${duration / 60000} dakika)`, interaction.user)] });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Mute işlemi başarısız: ${err.message}`)], ephemeral: true });
    }
  },
};
