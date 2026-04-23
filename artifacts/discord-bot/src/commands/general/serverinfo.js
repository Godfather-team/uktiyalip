// /serverinfo - Server information
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('📊 Sunucu bilgilerini göster'),

  async execute(interaction, client) {
    const guild = interaction.guild;
    await guild.fetch();

    const channels = guild.channels.cache;
    const textChannels = channels.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter((c) => c.type === ChannelType.GuildVoice).size;
    const roles = guild.roles.cache.size - 1; // exclude @everyone

    const members = guild.memberCount;
    const bots = guild.members.cache.filter((m) => m.user.bot).size;
    const humans = members - bots;

    const verif = {
      0: '❌ Yok',
      1: '📧 Düşük (E-posta doğrulaması)',
      2: '⏱️ Orta (5 dakika)',
      3: '📱 Yüksek (10 dakika)',
      4: '🔒 Çok Yüksek (Telefon doğrulaması)',
    };

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${guild.name} — Sunucu Bilgisi`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Sahip', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Oluşturulma', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Üyeler', value: `${members} toplam\n${humans} kullanıcı\n${bots} bot`, inline: true },
        { name: '💬 Kanallar', value: `${textChannels} metin\n${voiceChannels} ses\n${channels.size} toplam`, inline: true },
        { name: '🎭 Roller', value: `${roles} rol`, inline: true },
        { name: '🔒 Doğrulama', value: verif[guild.verificationLevel] || 'Bilinmiyor', inline: true },
        { name: '🚀 Boost', value: `${guild.premiumSubscriptionCount || 0} boost (Tier ${guild.premiumTier})`, inline: true },
        { name: '😀 Emojiler', value: `${guild.emojis.cache.size} emoji`, inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
