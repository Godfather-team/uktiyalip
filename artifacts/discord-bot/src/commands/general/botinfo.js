// /botinfo - Bot information
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
import os from 'os';

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('🤖 Bot hakkında bilgi'),

  async execute(interaction, client) {
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const uptimeStr = `${d}g ${h}s ${m}dk`;

    const memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const totalCommands = client.commands.size;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setAuthor({ name: 'Sxyware Bot', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '🏷️ Ad', value: client.user.tag, inline: true },
        { name: '🆔 ID', value: client.user.id, inline: true },
        { name: '📅 Oluşturulma', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🌐 Sunucu Sayısı', value: `${totalGuilds}`, inline: true },
        { name: '👥 Toplam Kullanıcı', value: `${totalUsers.toLocaleString()}`, inline: true },
        { name: '⚡ Komut Sayısı', value: `${totalCommands}`, inline: true },
        { name: '⏱️ Uptime', value: uptimeStr, inline: true },
        { name: '💾 RAM Kullanımı', value: `${memUsed.toFixed(1)} MB`, inline: true },
        { name: '🖥️ Platform', value: `Node.js ${process.version}`, inline: true },
        { name: '🔧 Geliştirici', value: 'Sxy.com', inline: true },
        { name: '📦 Kütüphane', value: 'discord.js v14', inline: true },
        { name: '🎵 Müzik', value: 'Lavalink (Shoukaku)', inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
