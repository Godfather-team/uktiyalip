import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('base64decode').setDescription('Base64 metnini çöz.')
    .addStringOption(o => o.setName('metin').setDescription('Base64').setRequired(true)),
  async execute(interaction) {
    try {
      interaction.reply({ content: '```\n' + Buffer.from(interaction.options.getString('metin'), 'base64').toString('utf8').slice(0, 1900) + '\n```', ephemeral: true });
    } catch { interaction.reply({ content: 'Çözülemedi.', ephemeral: true }); }
  },
};
