// /pay - Transfer coins to another user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getEconomyUser, setEconomyUser } from '../../utils/database.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('💸 Başka bir kullanıcıya para gönder')
    .addUserOption((o) => o.setName('kullanici').setDescription('Alıcı').setRequired(true))
    .addIntegerOption((o) => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const amount = interaction.options.getInteger('miktar');

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Kendine para gönderemezsin.')], ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ embeds: [errorEmbed('Botlara para gönderilemez.')], ephemeral: true });
    }

    const sender = getEconomyUser(interaction.guildId, interaction.user.id);
    if ((sender.balance || 0) < amount) {
      return interaction.reply({ embeds: [errorEmbed(`Yetersiz bakiye! Bakiyen: **${sender.balance || 0}** Sxy Coin.`)], ephemeral: true });
    }

    setEconomyUser(interaction.guildId, interaction.user.id, { balance: (sender.balance || 0) - amount });
    const recv = getEconomyUser(interaction.guildId, target.id);
    setEconomyUser(interaction.guildId, target.id, { balance: (recv.balance || 0) + amount });

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('💸 Para Transferi')
      .setDescription(`**${interaction.user.username}** → **${target.username}**`)
      .addFields(
        { name: '💰 Gönderilen', value: `${amount.toLocaleString()} Sxy Coin`, inline: true },
        { name: '📤 Gönderenin Yeni Bakiyesi', value: `${((sender.balance || 0) - amount).toLocaleString()} Sxy Coin`, inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
