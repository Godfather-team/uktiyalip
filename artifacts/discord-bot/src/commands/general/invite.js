import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('invite').setDescription('Botu sunucuna davet et.'),
  async execute(interaction) {
    const url = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setTitle('🔗 Davet Linki').setDescription(`[**Botu sunucuna ekle**](${url})`).setFooter({ text: config.footer })] });
  },
};
