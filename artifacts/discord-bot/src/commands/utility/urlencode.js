import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('urlencode').setDescription('URL encode.')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true)),
  async execute(interaction) { interaction.reply({ content: '```\n' + encodeURIComponent(interaction.options.getString('metin')).slice(0, 1900) + '\n```', ephemeral: true }); },
};
