// /play - Kazagumo style (Shafed-Billi pattern)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config.js';
import { errorEmbed } from '../../utils/embeds.js';
import { hasAvailableNodes, createPlayer } from '../../music/musicManager.js';

function formatMs(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Müzik çal (YouTube, Spotify, SoundCloud)')
    .addStringOption((o) =>
      o.setName('sorgu').setDescription('Şarkı adı veya URL').setRequired(true),
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const query = interaction.options.getString('sorgu');
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member?.voice?.channelId) {
      return interaction.editReply({ embeds: [errorEmbed('Önce bir ses kanalına gir!')] });
    }

    const me = interaction.guild.members.me;
    if (!me.permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
      return interaction.editReply({
        embeds: [errorEmbed('Bağlanmak ve konuşmak için yetkim yok! `Bağlan` ve `Konuş` izni ver.')],
      });
    }

    if (!hasAvailableNodes()) {
      return interaction.editReply({
        embeds: [errorEmbed('Müzik sunucusu şu anda erişilemiyor. Birazdan tekrar dene.')],
      });
    }

    try {
      // Search using manager (multi-source fallback)
      const result = await client.manager.search(query, { requester: interaction.user });

      if (!result.tracks.length) {
        return interaction.editReply({
          embeds: [errorEmbed(`**"${query}"** için sonuç bulunamadı.`)],
        });
      }

      // Create or get player
      const player = await createPlayer(
        interaction.guildId,
        member.voice.channelId,
        interaction.channelId,
      );

      const wasEmpty = !player.queue.current && player.queue.length === 0;

      if (result.type === 'PLAYLIST') {
        for (const t of result.tracks) player.queue.add(t);

        const embed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle('📋 Playlist Eklendi')
          .setDescription(
            `**${result.playlistName}**\n**${result.tracks.length}** şarkı kuyruğa eklendi.`,
          )
          .setFooter({ text: config.footer })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        const track = result.tracks[0];
        player.queue.add(track);

        const embed = new EmbedBuilder()
          .setColor(config.colors.secondary)
          .setTitle(wasEmpty ? '🎵 Çalınıyor' : '✅ Kuyruğa Eklendi')
          .setDescription(`**[${track.title}](${track.uri})**`)
          .setThumbnail(track.thumbnail || null)
          .addFields(
            { name: '👤 Sanatçı', value: track.author || 'Bilinmiyor', inline: true },
            {
              name: '⏱️ Süre',
              value: track.isStream ? '🔴 Canlı' : formatMs(track.length),
              inline: true,
            },
            {
              name: '📍 Sıra',
              value: wasEmpty ? 'Şimdi' : `#${player.queue.length}`,
              inline: true,
            },
          )
          .setFooter({ text: config.footer })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

      if (!player.playing && !player.paused) {
        await player.play();
      }
    } catch (err) {
      console.error('[Play] Hata:', err);
      const errMsg = err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('fetch failed')
        ? 'Müzik sunucusuna ulaşılamıyor. Birazdan tekrar dene.'
        : `Hata: ${err.message}`;
      interaction.editReply({ embeds: [errorEmbed(errMsg)] }).catch(() => {});
    }
  },
};
