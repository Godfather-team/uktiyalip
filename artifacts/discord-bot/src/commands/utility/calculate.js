import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('calculate').setDescription('Matematik hesapla.')
    .addStringOption(o => o.setName('ifade').setDescription('Örn: 5*3+2').setRequired(true)),
  async execute(interaction) {
    const expr = interaction.options.getString('ifade');
    if (!/^[\d\s+\-*/().%]+$/.test(expr)) return interaction.reply({ content: 'Geçersiz karakter.', ephemeral: true });
    try {
      const result = Function(`"use strict";return (${expr})`)();
      interaction.reply(`🧮 \`${expr}\` = **${result}**`);
    } catch { interaction.reply({ content: 'Hesaplanamadı.', ephemeral: true }); }
  },
};
