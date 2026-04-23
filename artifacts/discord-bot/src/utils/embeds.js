// Beautiful embed helpers - Sxyware theme
// Developed by Sxy.com | Sxyware

import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

// ============================================================
// BASE EMBED FACTORY
// ============================================================

export function createEmbed(type = 'primary') {
  return new EmbedBuilder()
    .setColor(config.colors[type] || config.colors.primary)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

// ============================================================
// MUSIC EMBEDS
// ============================================================

export function createProgressBar(current, total, size = 18) {
  if (!total || total === 0) return '▱'.repeat(size);
  const percentage = Math.min(current / total, 1);
  const filled = Math.round(size * percentage);
  const empty = size - filled;
  return '▰'.repeat(filled) + '▱'.repeat(empty);
}

export function formatTime(ms) {
  if (!ms || ms === 0) return '0:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function createNowPlayingEmbed(player, track) {
  const position = player.position || 0;
  const duration = track.info.duration || 0;
  const isStream = track.info.isStream || duration === 0;

  const progressBar = isStream
    ? '🔴 **CANLI YAYIN**'
    : `\`${formatTime(position)}\` [${createProgressBar(position, duration)}] \`${formatTime(duration)}\``;

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: '🎵 Şu An Çalıyor', iconURL: 'https://i.imgur.com/4OO5wh0.png' })
    .setTitle(track.info.title)
    .setURL(track.info.uri)
    .setThumbnail(track.info.artworkUrl || `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`)
    .addFields(
      { name: '👤 Sanatçı', value: track.info.author || 'Bilinmiyor', inline: true },
      { name: '🎧 İsteyen', value: track.info.requester ? `<@${track.info.requester.id}>` : 'Bilinmiyor', inline: true },
      { name: '🔊 Ses', value: `${player.volume || 100}%`, inline: true },
      { name: '📊 İlerleme', value: progressBar, inline: false },
    )
    .setFooter({ text: `${config.footer} • Kaynak: ${track.info.sourceName || 'Bilinmiyor'}` })
    .setTimestamp();

  if (player.queue && player.queue.tracks && player.queue.tracks.length > 0) {
    const next = player.queue.tracks[0];
    embed.addFields({
      name: '⏭️ Sıradaki',
      value: `[${next.info.title}](${next.info.uri})`,
      inline: false,
    });
  }

  return embed;
}

export function createQueueEmbed(player, page = 0) {
  const tracksPerPage = 10;
  const tracks = player.queue?.tracks || [];
  const totalPages = Math.ceil(tracks.length / tracksPerPage) || 1;
  const start = page * tracksPerPage;
  const end = start + tracksPerPage;
  const pageTracks = tracks.slice(start, end);

  const currentTrack = player.queue?.current;
  const totalDuration = tracks.reduce((acc, t) => acc + (t.info.duration || 0), 0);

  let description = '';

  if (currentTrack) {
    description += `**🎵 Şu An Çalıyor:**\n[${currentTrack.info.title}](${currentTrack.info.uri}) — \`${formatTime(currentTrack.info.duration)}\`\n\n`;
  }

  if (pageTracks.length > 0) {
    description += `**📋 Sıra:**\n`;
    pageTracks.forEach((track, i) => {
      const index = start + i + 1;
      description += `\`${index}.\` [${track.info.title}](${track.info.uri}) — \`${formatTime(track.info.duration)}\`\n`;
    });
  } else {
    description += '*Sırada başka şarkı yok.*';
  }

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: '📋 Müzik Kuyruğu' })
    .setDescription(description)
    .addFields(
      { name: '🔢 Toplam Şarkı', value: `${tracks.length}`, inline: true },
      { name: '⏱️ Toplam Süre', value: formatTime(totalDuration), inline: true },
      { name: '🔁 Loop', value: player.repeatMode === 'track' ? 'Şarkı' : player.repeatMode === 'queue' ? 'Kuyruk' : 'Kapalı', inline: true },
    )
    .setFooter({ text: `${config.footer} • Sayfa ${page + 1}/${totalPages}` })
    .setTimestamp();
}

// ============================================================
// MODERATION EMBEDS
// ============================================================

export function createModEmbed(action, target, reason, moderator) {
  const actions = {
    ban: { emoji: '🔨', color: config.colors.error, title: 'Kullanıcı Banlandı' },
    kick: { emoji: '👢', color: config.colors.error, title: 'Kullanıcı Atıldı' },
    mute: { emoji: '🔇', color: config.colors.warning, title: 'Kullanıcı Susturuldu' },
    unmute: { emoji: '🔊', color: config.colors.success, title: 'Kullanıcının Sesi Açıldı' },
    warn: { emoji: '⚠️', color: config.colors.warning, title: 'Kullanıcı Uyarıldı' },
    clear: { emoji: '🗑️', color: config.colors.info, title: 'Mesajlar Silindi' },
  };

  const act = actions[action] || { emoji: '⚡', color: config.colors.primary, title: action };

  return new EmbedBuilder()
    .setColor(act.color)
    .setTitle(`${act.emoji} ${act.title}`)
    .addFields(
      { name: '👤 Hedef', value: target ? `${target.tag || target} (${target.id || ''})` : 'Bilinmiyor', inline: true },
      { name: '🛡️ Moderatör', value: moderator ? `${moderator.tag || moderator}` : 'Sistem', inline: true },
      { name: '📝 Sebep', value: reason || 'Sebep belirtilmedi', inline: false },
    )
    .setThumbnail(target?.displayAvatarURL?.() || null)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

// ============================================================
// ECONOMY EMBEDS
// ============================================================

export function createBalanceEmbed(user, balance, currency) {
  return new EmbedBuilder()
    .setColor(config.colors.gold)
    .setTitle('💰 Bakiye')
    .setDescription(`**${user.username}** adlı kullanıcının bakiyesi:`)
    .addFields(
      { name: `${currency} Bakiye`, value: `**${balance.toLocaleString()}** Sxy Coin`, inline: false },
    )
    .setThumbnail(user.displayAvatarURL?.())
    .setFooter({ text: config.footer })
    .setTimestamp();
}

// ============================================================
// LEVEL EMBEDS
// ============================================================

export function createRankEmbed(user, userData, rank) {
  const { xp, level } = userData;
  const nextLevelXP = getXPForLevelEmbed(level + 1);
  const currentLevelXP = getTotalXPForLevel(level);
  const progress = xp - currentLevelXP;
  const needed = nextLevelXP;
  const bar = createProgressBar(progress, needed, 16);

  return new EmbedBuilder()
    .setColor(config.colors.purple)
    .setTitle(`📊 ${user.username} — Seviye ${level}`)
    .setThumbnail(user.displayAvatarURL?.())
    .addFields(
      { name: '🏆 Sıralama', value: rank ? `#${rank}` : 'Bilinmiyor', inline: true },
      { name: '⭐ Seviye', value: `${level}`, inline: true },
      { name: '✨ Toplam XP', value: `${xp.toLocaleString()}`, inline: true },
      { name: '📈 İlerleme', value: `\`${bar}\`\n${progress.toLocaleString()} / ${needed.toLocaleString()} XP`, inline: false },
    )
    .setFooter({ text: config.footer })
    .setTimestamp();
}

function getXPForLevelEmbed(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

function getTotalXPForLevel(level) {
  let total = 0;
  for (let i = 0; i < level; i++) {
    total += getXPForLevelEmbed(i + 1);
  }
  return total;
}

// ============================================================
// GENERAL EMBEDS
// ============================================================

export function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('❌ Hata')
    .setDescription(message)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

export function successEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

export function infoEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(title)
    .setDescription(message)
    .setFooter({ text: config.footer })
    .setTimestamp();
}
