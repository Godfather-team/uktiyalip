import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('reverse').setDescription('Metni tersine çevir.')
    .addStringOption(o => o.setName('metin').setDescription('Çevrilecek metin').setRequired(true)),
  async execute(interaction) {
    const t = interaction.options.getString('metin');
    interaction.reply(`🔄 ${[...t].reverse().join('')}`);
  },
};
