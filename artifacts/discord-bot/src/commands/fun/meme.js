import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('meme').setDescription('Rastgele meme getir.'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const r = await fetch('https://meme-api.com/gimme');
      const d = await r.json();
      const e = new EmbedBuilder().setColor(config.colors.primary).setTitle(d.title || 'Meme').setImage(d.url).setURL(d.postLink).setFooter({ text: `r/${d.subreddit} • ${config.footer}` });
      interaction.editReply({ embeds: [e] });
    } catch { interaction.editReply('Meme getirilemedi.'); }
  },
};
