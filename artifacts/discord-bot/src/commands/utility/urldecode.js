import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('urldecode').setDescription('URL decode.')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true)),
  async execute(interaction) {
    try { interaction.reply({ content: '```\n' + decodeURIComponent(interaction.options.getString('metin')).slice(0, 1900) + '\n```', ephemeral: true }); }
    catch { interaction.reply({ content: 'Çözülemedi.', ephemeral: true }); }
  },
};
