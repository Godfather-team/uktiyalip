// ============================================================
// Kazagumo Player Events - Now Playing UI with Buttons
// Developed by Sxy.com | Sxyware
// ============================================================

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { config } from '../config.js';

// Per-guild now playing message tracking
const nowPlayingState = new Map(); // guildId -> { msg, interval, collector }

// ============================================================
// HELPERS
// ============================================================

function formatMs(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function progressBar(current, total, size = 18) {
  if (!total) return '▱'.repeat(size);
  const pct = Math.min(current / total, 1);
  const filled = Math.round(size * pct);
  return '▰'.repeat(filled) + '▱'.repeat(size - filled);
}

function cleanThumbnail(track) {
  if (track.thumbnail) return track.thumbnail;
  if (track.identifier && (track.sourceName === 'youtube' || track.sourceName === 'youtubemusic')) {
    return `https://i.ytimg.com/vi/${track.identifier}/maxresdefault.jpg`;
  }
  return null;
}

// ============================================================
// BUTTONS
// ============================================================

function buildButtons(player) {
  const loop = player.loop || 'none';
  const paused = !!player.paused;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_pause')
      .setEmoji(paused ? '▶️' : '⏸️')
      .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setEmoji('🔁')
      .setLabel(loop === 'track' ? 'Şarkı' : loop === 'queue' ? 'Kuyruk' : 'Off')
      .setStyle(loop !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_shuffle')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_voldown')
      .setEmoji('🔉')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_volup')
      .setEmoji('🔊')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary),
  );

  return [row1, row2];
}

// ============================================================
// NOW PLAYING EMBED
// ============================================================

export function buildNowPlayingEmbed(player) {
  const track = player.queue.current;
  if (!track) return null;

  const pos = player.position || 0;
  const dur = track.length || 0;
  const isStream = track.isStream || dur === 0;

  const progressLine = isStream
    ? '🔴 **CANLI YAYIN**'
    : `\`${formatMs(pos)}\` [${progressBar(pos, dur)}] \`${formatMs(dur)}\``;

  const upcoming = player.queue[0];

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: '🎵 Şu An Çalıyor', iconURL: config.footerIcon })
    .setTitle(track.title || 'Bilinmiyor')
    .setURL(track.uri || null)
    .setThumbnail(cleanThumbnail(track))
    .addFields(
      { name: '👤 Sanatçı', value: track.author || 'Bilinmiyor', inline: true },
      {
        name: '🎧 İsteyen',
        value: track.requester ? `<@${track.requester.id}>` : 'Bilinmiyor',
        inline: true,
      },
      { name: '🔊 Ses', value: `${player.volume}%`, inline: true },
      { name: '📊 İlerleme', value: progressLine, inline: false },
    )
    .setFooter({ text: `${config.footer} • ${track.sourceName || 'Lavalink'}` })
    .setTimestamp();

  if (upcoming) {
    embed.addFields({
      name: '⏭️ Sıradaki',
      value: `[${upcoming.title}](${upcoming.uri})`,
      inline: false,
    });
  }

  return embed;
}

// ============================================================
// REGISTER GLOBAL MANAGER EVENTS
// ============================================================

export function registerPlayerEvents(client) {
  const manager = client.manager;
  if (!manager) return;

  manager.on('playerStart', async (player, track) => {
    await sendNowPlaying(player, client);
  });

  manager.on('playerEnd', async (player) => {
    cleanupNowPlaying(player.guildId);
  });

  manager.on('playerEmpty', async (player) => {
    const channel = client.channels.cache.get(player.textId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('⏹️ Kuyruk Bitti')
        .setDescription('Sıradaki şarkı kalmadı. 30 saniye sonra ses kanalından çıkacağım.')
        .setFooter({ text: config.footer })
        .setTimestamp();
      channel.send({ embeds: [embed] }).catch(() => {});
    }

    cleanupNowPlaying(player.guildId);

    setTimeout(() => {
      const p = manager.players.get(player.guildId);
      if (p && (!p.queue.current || !p.playing)) {
        p.destroy().catch(() => {});
      }
    }, 30000);
  });

  manager.on('playerException', async (player, data) => {
    const channel = client.channels.cache.get(player.textId);
    if (channel) {
      channel.send({
        content: `❌ Şarkı çalınamadı: \`${data?.exception?.message || 'Bilinmeyen hata'}\``,
      }).catch(() => {});
    }
  });

  manager.on('playerStuck', async (player) => {
    const channel = client.channels.cache.get(player.textId);
    if (channel) channel.send({ content: '⚠️ Şarkı takıldı, atlanıyor...' }).catch(() => {});
    player.skip();
  });

  manager.on('playerDestroy', (player) => {
    cleanupNowPlaying(player.guildId);
  });

  console.log('[Music] ✅ Player event handler\'ları kaydedildi.');
}

// ============================================================
// SEND NOW PLAYING MSG
// ============================================================

async function sendNowPlaying(player, client) {
  const channel = client.channels.cache.get(player.textId);
  if (!channel) return;

  cleanupNowPlaying(player.guildId);

  const embed = buildNowPlayingEmbed(player);
  if (!embed) return;

  try {
    const msg = await channel.send({
      embeds: [embed],
      components: buildButtons(player),
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.customId.startsWith('music_'),
      time: 600000,
    });

    collector.on('collect', async (interaction) => {
      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member?.voice?.channelId || member.voice.channelId !== player.voiceId) {
        return interaction.reply({
          content: '❌ Müziği kontrol etmek için ses kanalıma gir!',
          ephemeral: true,
        });
      }

      await interaction.deferUpdate().catch(() => {});

      switch (interaction.customId) {
        case 'music_pause':
          player.pause(!player.paused);
          break;
        case 'music_skip':
          player.skip();
          return;
        case 'music_stop':
          player.destroy();
          msg.edit({ components: [] }).catch(() => {});
          collector.stop();
          return;
        case 'music_loop': {
          const modes = ['none', 'track', 'queue'];
          const idx = modes.indexOf(player.loop || 'none');
          player.setLoop(modes[(idx + 1) % 3]);
          break;
        }
        case 'music_shuffle':
          player.queue.shuffle();
          break;
        case 'music_voldown':
          player.setVolume(Math.max(0, (player.volume || 80) - 10));
          break;
        case 'music_volup':
          player.setVolume(Math.min(150, (player.volume || 80) + 10));
          break;
        case 'music_queue': {
          const upcoming = player.queue.slice(0, 10);
          const list = upcoming.length
            ? upcoming
                .map((t, i) => `**${i + 1}.** [${t.title.slice(0, 50)}](${t.uri}) • \`${formatMs(t.length)}\``)
                .join('\n')
            : '*Sıradaki şarkı yok.*';

          return interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.secondary)
                .setTitle('📋 Sıradaki Şarkılar')
                .setDescription(list)
                .setFooter({ text: `Toplam: ${player.queue.length} şarkı • ${config.footer}` }),
            ],
            ephemeral: true,
          }).catch(() => {});
        }
      }

      try {
        const upEmbed = buildNowPlayingEmbed(player);
        if (upEmbed) await msg.edit({ embeds: [upEmbed], components: buildButtons(player) });
      } catch {}
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });

    // Update progress every 10s
    const interval = setInterval(async () => {
      try {
        if (!player.queue.current || !player.playing) {
          clearInterval(interval);
          return;
        }
        const upEmbed = buildNowPlayingEmbed(player);
        if (upEmbed) await msg.edit({ embeds: [upEmbed], components: buildButtons(player) });
      } catch {
        clearInterval(interval);
      }
    }, 10000);

    nowPlayingState.set(player.guildId, { msg, interval, collector });
  } catch (err) {
    console.error('[PlayerEvents] Now playing hatası:', err.message);
  }
}

function cleanupNowPlaying(guildId) {
  const state = nowPlayingState.get(guildId);
  if (!state) return;
  if (state.interval) clearInterval(state.interval);
  if (state.collector) state.collector.stop();
  if (state.msg) state.msg.delete().catch(() => {});
  nowPlayingState.delete(guildId);
}
