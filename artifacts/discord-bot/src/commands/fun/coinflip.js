// /coinflip - Coin flip
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('🪙 Yazı mı tura mı?')
    .addStringOption((o) =>
      o.setName('tahmin').setDescription('Tahminin')
        .addChoices({ name: '👑 Yazı', value: 'yazi' }, { name: '🦅 Tura', value: 'tura' }),
    ),

  async execute(interaction, client) {
    const guess = interaction.options.getString('tahmin');
    const result = Math.random() < 0.5 ? 'yazi' : 'tura';
    const resultName = result === 'yazi' ? '👑 Yazı' : '🦅 Tura';

    let description;
    let color;

    if (guess) {
      const won = guess === result;
      description = `Sonuç: **${resultName}**\n\n${won ? '🎉 **Kazandın!**' : '😢 **Kaybettin!**'}`;
      color = won ? config.colors.success : config.colors.error;
    } else {
      description = `Sonuç: **${resultName}**`;
      color = config.colors.primary;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🪙 Yazı mı Tura mı?')
      .setDescription(description)
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
