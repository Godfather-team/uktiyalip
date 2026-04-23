import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('color').setDescription('Renk önizle.')
    .addStringOption(o => o.setName('hex').setDescription('Örn: #FF0000').setRequired(true)),
  async execute(interaction) {
    let hex = interaction.options.getString('hex').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return interaction.reply({ content: 'Geçersiz hex.', ephemeral: true });
    const int = parseInt(hex, 16);
    interaction.reply({ embeds: [new EmbedBuilder().setColor(int).setTitle(`🎨 #${hex.toUpperCase()}`).setImage(`https://singlecolorimage.com/get/${hex}/300x150.png`).setFooter({ text: config.footer })] });
  },
};
