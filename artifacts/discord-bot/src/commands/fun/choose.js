import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('choose').setDescription('Senin yerine seçim yapayım.')
    .addStringOption(o => o.setName('seçenekler').setDescription('Virgülle ayır').setRequired(true)),
  async execute(interaction) {
    const opts = interaction.options.getString('seçenekler').split(',').map(s => s.trim()).filter(Boolean);
    if (opts.length < 2) return interaction.reply({ content: 'En az 2 seçenek ver.', ephemeral: true });
    interaction.reply(`🎯 Bence: **${opts[Math.floor(Math.random() * opts.length)]}**`);
  },
};
