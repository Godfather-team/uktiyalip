// /gamble - Gamble coins (for kumarhane channel)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getEconomyUser, setEconomyUser } from '../../utils/database.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

const SLOTS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔥', '💀'];

function spin() {
  return Array.from({ length: 3 }, () => SLOTS[Math.floor(Math.random() * SLOTS.length)]);
}

function calcWinnings(bet, result) {
  const [a, b, c] = result;
  if (a === b && b === c) {
    // Jackpot
    if (a === '💎') return { mult: 10, label: '💎 JACKPOT!!! 💎' };
    if (a === '🔥') return { mult: 5, label: '🔥 Büyük Kazanç! 🔥' };
    if (a === '⭐') return { mult: 3, label: '⭐ Üçlü! ⭐' };
    return { mult: 2, label: '✨ Üçlü! ✨' };
  }
  if (a === b || b === c || a === c) {
    return { mult: 1.5, label: '🎯 İkili!' };
  }
  if (a === '💀' || b === '💀' || c === '💀') {
    return { mult: 0, label: '💀 Kuru Sıkı!', loss: true };
  }
  return null; // Full loss
}

export default {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('🎰 Kumar oyna!')
    .addStringOption((o) =>
      o.setName('miktar')
        .setDescription('Bahis miktarı (sayı veya "all")')
        .setRequired(true),
    ),

  async execute(interaction, client) {
    const userData = getEconomyUser(interaction.guildId, interaction.user.id);
    const balance = userData.balance || 0;

    const amountStr = interaction.options.getString('miktar').toLowerCase();
    let bet;

    if (amountStr === 'all' || amountStr === 'hepsi') {
      bet = balance;
    } else {
      bet = parseInt(amountStr);
    }

    if (!bet || isNaN(bet) || bet <= 0) {
      return interaction.reply({ embeds: [errorEmbed('Geçerli bir miktar gir.')], ephemeral: true });
    }

    if (bet > balance) {
      return interaction.reply({ embeds: [errorEmbed(`Yetersiz bakiye! Bakiyen: **${balance.toLocaleString()}** Sxy Coin.`)], ephemeral: true });
    }

    if (bet < 10) {
      return interaction.reply({ embeds: [errorEmbed('Minimum bahis **10** Sxy Coin.')], ephemeral: true });
    }

    await interaction.deferReply();

    // Spinning animation
    const spinningEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🎰 Slot Makinesi')
      .setDescription('`🎰 | 🎰 | 🎰`\nDönüyor...')
      .setFooter({ text: config.footer });

    await interaction.editReply({ embeds: [spinningEmbed] });

    // Small delay for effect
    await new Promise((r) => setTimeout(r, 1200));

    const result = spin();
    const winData = calcWinnings(bet, result);

    let newBalance;
    let description;
    let color;

    if (winData) {
      const winAmount = Math.floor(bet * winData.mult);
      newBalance = balance - bet + winAmount;
      const profit = winAmount - bet;
      description = `\`${result.join(' | ')}\`\n\n${winData.label}\n**+${profit.toLocaleString()} ${config.economy.currency}** kazandın!`;
      color = config.colors.success;
    } else {
      newBalance = balance - bet;
      description = `\`${result.join(' | ')}\`\n\n**Kaybettin!** 😭\n**-${bet.toLocaleString()} ${config.economy.currency}** gitti!`;
      color = config.colors.error;
    }

    setEconomyUser(interaction.guildId, interaction.user.id, { balance: newBalance });

    const resultEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🎰 Slot Makinesi')
      .setDescription(description)
      .addFields(
        { name: '💸 Bahis', value: `${bet.toLocaleString()} Sxy Coin`, inline: true },
        { name: '💰 Yeni Bakiye', value: `${newBalance.toLocaleString()} Sxy Coin`, inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.editReply({ embeds: [resultEmbed] });
  },
};
