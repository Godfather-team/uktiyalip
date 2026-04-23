// /lyrics - Şarkı sözleri (lyrics.ovh API)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

function parseTitleAuthor(track) {
  let title = (track.title || '').replace(/\(.*?\)|\[.*?\]/g, '').trim();
  let artist = track.author || 'Unknown';
  if (title.includes(' - ')) {
    const [a, b] = title.split(' - ');
    artist = a.trim();
    title = b.trim();
  }
  return { artist, title };
}

export default {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('🎤 Çalan şarkının (veya verilen şarkının) sözlerini getir')
    .addStringOption((o) =>
      o.setName('sorgu').setDescription('Şarkı: "Sanatçı - Şarkı" formatında').setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let artist;
    let title;
    const query = interaction.options.getString('sorgu');

    if (query) {
      if (query.includes(' - ')) {
        [artist, title] = query.split(' - ').map((s) => s.trim());
      } else {
        return interaction.editReply({
          embeds: [errorEmbed('Format: `Sanatçı - Şarkı` şeklinde gir.')],
        });
      }
    } else {
      const player = getPlayer(interaction.guildId);
      if (!player?.queue.current) {
        return interaction.editReply({
          embeds: [errorEmbed('Şu an müzik çalmıyor. Sorgu da vermedin.')],
        });
      }
      ({ artist, title } = parseTitleAuthor(player.queue.current));
    }

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.lyrics || !data.lyrics.trim()) {
        return interaction.editReply({
          embeds: [errorEmbed(`**${artist} - ${title}** için söz bulunamadı.`)],
        });
      }

      const lyrics = data.lyrics.trim();
      const chunks = [];
      let buf = '';
      for (const line of lyrics.split('\n')) {
        if ((buf + '\n' + line).length > 1900) {
          chunks.push(buf);
          buf = line;
        } else {
          buf += (buf ? '\n' : '') + line;
        }
      }
      if (buf) chunks.push(buf);

      const first = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setAuthor({ name: '🎤 Şarkı Sözleri', iconURL: config.footerIcon })
        .setTitle(`${artist} — ${title}`)
        .setDescription(chunks[0])
        .setFooter({ text: `${config.footer} • lyrics.ovh` });

      await interaction.editReply({ embeds: [first] });

      for (let i = 1; i < Math.min(chunks.length, 4); i++) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder().setColor(config.colors.primary).setDescription(chunks[i]),
          ],
        });
      }
    } catch (err) {
      interaction.editReply({
        embeds: [errorEmbed(`Söz getirilemedi: ${err.message}`)],
      });
    }
  },
};
