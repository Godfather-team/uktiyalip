// /8ball - Magic 8-ball
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

const answers = [
  { text: 'Kesinlikle evet!', color: 0x00FF7F },
  { text: 'Evet, buna inanıyorum.', color: 0x00FF7F },
  { text: 'Görünüşe göre öyle.', color: 0x00FF7F },
  { text: 'Tabii ki.', color: 0x00FF7F },
  { text: 'İşaretler evet diyor.', color: 0x00FF7F },
  { text: 'Şimdilik belirsiz, sonra tekrar sor.', color: 0xFFD700 },
  { text: 'Şu an cevap veremiyorum.', color: 0xFFD700 },
  { text: 'Konsantre olmaya çalış ve tekrar sor.', color: 0xFFD700 },
  { text: 'Cevap bulanık görünüyor.', color: 0xFFD700 },
  { text: 'Beklersen daha iyi.', color: 0xFFD700 },
  { text: 'Buna güvenme.', color: 0xFF0000 },
  { text: 'Cevabım hayır.', color: 0xFF0000 },
  { text: 'İşaretler hayır diyor.', color: 0xFF0000 },
  { text: 'Çok şüpheli.', color: 0xFF0000 },
  { text: 'Kesinlikle hayır!', color: 0xFF0000 },
];

export default {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('🎱 Sihirli 8 topa sor')
    .addStringOption((o) => o.setName('soru').setDescription('Sorun').setRequired(true)),

  async execute(interaction, client) {
    const question = interaction.options.getString('soru');
    const answer = answers[Math.floor(Math.random() * answers.length)];

    const embed = new EmbedBuilder()
      .setColor(answer.color)
      .setTitle('🎱 Sihirli 8 Top')
      .addFields(
        { name: '❓ Soru', value: question, inline: false },
        { name: '🎱 Cevap', value: `**${answer.text}**`, inline: false },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
