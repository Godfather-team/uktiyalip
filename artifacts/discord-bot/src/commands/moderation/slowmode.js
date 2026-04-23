// /slowmode - Set channel slowmode
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('🐌 Kanal yavaş modunu ayarla')
    .addIntegerOption((o) =>
      o.setName('saniye').setDescription('Saniye (0 = kapat)').setRequired(true).setMinValue(0).setMaxValue(21600),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('saniye');

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      if (seconds === 0) {
        interaction.reply({ embeds: [successEmbed('Yavaş Mod', 'Yavaş mod kapatıldı.')] });
      } else {
        interaction.reply({ embeds: [successEmbed('Yavaş Mod', `Yavaş mod **${seconds} saniye** olarak ayarlandı.`)] });
      }
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Yavaş mod ayarlanamadı: ${err.message}`)], ephemeral: true });
    }
  },
};
