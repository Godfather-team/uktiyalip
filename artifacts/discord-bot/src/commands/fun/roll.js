// /roll - Dice roller (e.g., 2d6, d20)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('🎲 Zar at')
    .addStringOption((o) =>
      o.setName('zar').setDescription('Zar formatı (örn: 2d6, d20, 1d100)').setRequired(false),
    ),

  async execute(interaction, client) {
    const input = interaction.options.getString('zar') || '1d6';
    const match = input.toLowerCase().match(/^(\d+)?d(\d+)$/);

    if (!match) {
      return interaction.reply({ content: '❌ Geçersiz format! Örnek: `1d6`, `2d20`, `d100`', ephemeral: true });
    }

    const count = Math.min(parseInt(match[1] || '1'), 20);
    const sides = Math.min(parseInt(match[2]), 1000);

    if (sides < 2) return interaction.reply({ content: '❌ Minimum 2 yüzlü zar.', ephemeral: true });

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🎲 ${count}d${sides} Zar`)
      .addFields(
        { name: '🎲 Sonuçlar', value: rolls.map((r) => `\`${r}\``).join(' '), inline: false },
        { name: '📊 Toplam', value: `**${total}**`, inline: true },
        { name: '📈 Ortalama', value: `**${(total / count).toFixed(1)}**`, inline: true },
        { name: '🔢 Adet', value: `${count} zar`, inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
