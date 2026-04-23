// /ping - Bot latency
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Bot gecikme süresini göster'),

  async execute(interaction, client) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = client.ws.ping;

    const getStatus = (ms) => {
      if (ms < 100) return '🟢 Mükemmel';
      if (ms < 200) return '🟡 İyi';
      if (ms < 400) return '🟠 Orta';
      return '🔴 Kötü';
    };

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '📡 API Gecikmesi', value: `**${latency}ms** ${getStatus(latency)}`, inline: true },
        { name: '💓 WebSocket', value: `**${wsLatency}ms** ${getStatus(wsLatency)}`, inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  },
};
