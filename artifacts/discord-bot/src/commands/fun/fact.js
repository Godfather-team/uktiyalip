import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('fact').setDescription('Rastgele ilginç bilgi.'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const r = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const d = await r.json();
      interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.info).setTitle('🧠 İlginç Bilgi').setDescription(d.text).setFooter({ text: config.footer })] });
    } catch { interaction.editReply('Bilgi getirilemedi.'); }
  },
};
