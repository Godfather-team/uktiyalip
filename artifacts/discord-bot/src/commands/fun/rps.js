// /rps - Rock Paper Scissors
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

const choices = ['taş', 'kağıt', 'makas'];
const emojis = { taş: '🪨', kağıt: '📄', makas: '✂️' };

function getResult(user, bot) {
  if (user === bot) return 'draw';
  if (
    (user === 'taş' && bot === 'makas') ||
    (user === 'kağıt' && bot === 'taş') ||
    (user === 'makas' && bot === 'kağıt')
  ) return 'win';
  return 'lose';
}

export default {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('✂️ Taş Kağıt Makas')
    .addStringOption((o) =>
      o.setName('secim').setDescription('Seçimin').setRequired(true)
        .addChoices(
          { name: '🪨 Taş', value: 'taş' },
          { name: '📄 Kağıt', value: 'kağıt' },
          { name: '✂️ Makas', value: 'makas' },
        ),
    ),

  async execute(interaction, client) {
    const userChoice = interaction.options.getString('secim');
    const botChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(userChoice, botChoice);

    const texts = {
      win: '🎉 Kazandın! Tebrikler.',
      lose: '😂 Kaybettin. Nasıl yani?',
      draw: '🤝 Berabere! Bir daha dene.',
    };
    const colors = {
      win: config.colors.success,
      lose: config.colors.error,
      draw: config.colors.warning,
    };

    const embed = new EmbedBuilder()
      .setColor(colors[result])
      .setTitle('✂️ Taş Kağıt Makas')
      .addFields(
        { name: '👤 Senin Seçimin', value: `${emojis[userChoice]} **${userChoice}**`, inline: true },
        { name: '🤖 Botun Seçimi', value: `${emojis[botChoice]} **${botChoice}**`, inline: true },
        { name: '🏆 Sonuç', value: texts[result], inline: false },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
