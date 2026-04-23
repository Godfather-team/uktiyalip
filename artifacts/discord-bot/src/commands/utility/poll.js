// /poll - Create a poll
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('📊 Anket oluştur')
    .addStringOption((o) => o.setName('soru').setDescription('Anket sorusu').setRequired(true))
    .addStringOption((o) => o.setName('secenek1').setDescription('1. Seçenek').setRequired(true))
    .addStringOption((o) => o.setName('secenek2').setDescription('2. Seçenek').setRequired(true))
    .addStringOption((o) => o.setName('secenek3').setDescription('3. Seçenek'))
    .addStringOption((o) => o.setName('secenek4').setDescription('4. Seçenek')),

  async execute(interaction, client) {
    const question = interaction.options.getString('soru');
    const options = [
      interaction.options.getString('secenek1'),
      interaction.options.getString('secenek2'),
      interaction.options.getString('secenek3'),
      interaction.options.getString('secenek4'),
    ].filter(Boolean);

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((opt, i) => `${emojis[i]} **${opt}**`).join('\n\n'))
      .setAuthor({ name: `${interaction.user.username} tarafından`, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: `${config.footer} • Oy vermek için aşağıdaki reaksiyonları kullan` })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]).catch(() => {});
    }
  },
};
