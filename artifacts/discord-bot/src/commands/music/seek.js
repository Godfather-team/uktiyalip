// /seek - Şarkıda zaman atlama
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

function parseTime(s) {
  if (!s) return null;
  if (/^\d+$/.test(s)) return parseInt(s) * 1000;
  const m = s.match(/^(?:(\d+):)?(\d+):(\d+)$/);
  if (!m) return null;
  const h = parseInt(m[1] || '0');
  const min = parseInt(m[2]);
  const sec = parseInt(m[3]);
  return ((h * 60 + min) * 60 + sec) * 1000;
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('⏩ Şarkıda belirli bir zamana atla')
    .addStringOption((o) =>
      o.setName('zaman').setDescription('mm:ss veya saniye (örn: 1:30 veya 90)').setRequired(true),
    ),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player?.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Müzik çalmıyor.')], ephemeral: true });
    }

    const track = player.queue.current;
    if (track.isStream) {
      return interaction.reply({ embeds: [errorEmbed('Canlı yayında seek yapılamaz.')], ephemeral: true });
    }

    const ms = parseTime(interaction.options.getString('zaman'));
    if (ms === null) {
      return interaction.reply({ embeds: [errorEmbed('Geçersiz zaman formatı. Örnek: `1:30` veya `90`')], ephemeral: true });
    }
    if (ms > track.length) {
      return interaction.reply({ embeds: [errorEmbed(`Şarkı sadece ${formatMs(track.length)} uzunluğunda.`)], ephemeral: true });
    }

    try {
      await player.seek(ms);
      interaction.reply({ embeds: [successEmbed('Seek', `⏩ **${formatMs(ms)}** zamanına atlandı.`)] });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Seek başarısız: ${err.message}`)], ephemeral: true });
    }
  },
};
