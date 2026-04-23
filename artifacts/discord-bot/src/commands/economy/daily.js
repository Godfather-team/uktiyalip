// /daily - Collect daily coins
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getEconomyUser, setEconomyUser } from '../../utils/database.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('🎁 Günlük coin al'),

  async execute(interaction, client) {
    const userData = getEconomyUser(interaction.guildId, interaction.user.id);
    const now = Date.now();
    const lastDaily = userData.lastDaily || 0;
    const cooldown = config.economy.dailyCooldown;

    if (now - lastDaily < cooldown) {
      const remaining = cooldown - (now - lastDaily);
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      return interaction.reply({
        embeds: [
          errorEmbed(`Günlük ödülünü zaten aldın. **${hours}s ${minutes}dk ${seconds}sn** sonra tekrar al.`),
        ],
        ephemeral: true,
      });
    }

    const amount = Math.floor(
      Math.random() * (config.economy.dailyMax - config.economy.dailyMin + 1) + config.economy.dailyMin,
    );

    const newBalance = (userData.balance || 0) + amount;
    setEconomyUser(interaction.guildId, interaction.user.id, {
      balance: newBalance,
      lastDaily: now,
    });

    // Streak tracking (simple)
    const streak = (userData.streak || 0) + 1;
    setEconomyUser(interaction.guildId, interaction.user.id, { streak });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.gold)
          .setTitle('🎁 Günlük Ödül!')
          .setDescription(`**${amount.toLocaleString()} ${config.economy.currency} Sxy Coin** aldın!`)
          .addFields(
            { name: '💰 Yeni Bakiye', value: `${newBalance.toLocaleString()} Sxy Coin`, inline: true },
            { name: '🔥 Seri', value: `${streak} gün`, inline: true },
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({ text: `${config.footer} • Yarın tekrar gel!` })
          .setTimestamp(),
      ],
    });
  },
};
