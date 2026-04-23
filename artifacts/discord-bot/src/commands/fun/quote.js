import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('quote').setDescription('Rastgele alıntı.'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const r = await fetch('https://zenquotes.io/api/random');
      const d = await r.json();
      const q = d[0];
      interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.purple).setDescription(`> *${q.q}*\n\n— **${q.a}**`).setFooter({ text: config.footer })] });
    } catch { interaction.editReply('Alıntı getirilemedi.'); }
  },
};
