import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('ascii').setDescription('Metni ASCII art yap.')
    .addStringOption(o => o.setName('metin').setDescription('Maks 20 karakter').setRequired(true).setMaxLength(20)),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const r = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(interaction.options.getString('metin'))}`);
      const t = await r.text();
      const out = '```\n' + t.slice(0, 1900) + '\n```';
      interaction.editReply(out);
    } catch { interaction.editReply('ASCII üretilemedi.'); }
  },
};
