import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('qr').setDescription('QR kodu üret.')
    .addStringOption(o => o.setName('metin').setDescription('Kodlanacak metin/URL').setRequired(true)),
  async execute(interaction) {
    const t = interaction.options.getString('metin');
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setTitle('📱 QR Kod').setImage(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(t)}`).setFooter({ text: config.footer })] });
  },
};
