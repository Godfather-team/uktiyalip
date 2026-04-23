import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('base64encode').setDescription('Metni base64 ile kodla.')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true)),
  async execute(interaction) {
    interaction.reply({ content: '```\n' + Buffer.from(interaction.options.getString('metin')).toString('base64').slice(0, 1900) + '\n```', ephemeral: true });
  },
};
