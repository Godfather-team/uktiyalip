import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('mock').setDescription('SpOnGeBoB tArZı YaZ.')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true)),
  async execute(interaction) {
    const t = interaction.options.getString('metin');
    interaction.reply('🤡 ' + [...t].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join(''));
  },
};
