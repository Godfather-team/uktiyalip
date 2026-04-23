import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('dadjoke').setDescription('Baba esprisi.'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const r = await fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } });
      const d = await r.json();
      interaction.editReply(`👨 ${d.joke}`);
    } catch { interaction.editReply('Espri getirilemedi.'); }
  },
};
