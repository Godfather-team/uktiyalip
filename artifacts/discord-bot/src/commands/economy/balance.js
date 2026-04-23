// /balance - Check coin balance
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getEconomyUser } from '../../utils/database.js';
import { createBalanceEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('💰 Bakiyeni göster')
    .addUserOption((o) => o.setName('kullanici').setDescription("Başka birinin bakiyesini gör")),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici') || interaction.user;
    const userData = getEconomyUser(interaction.guildId, target.id);

    interaction.reply({
      embeds: [createBalanceEmbed(target, userData.balance || 0, config.economy.currency)],
    });
  },
};
