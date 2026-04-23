// /userinfo - User information
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 Kullanıcı bilgilerini göster')
    .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı (boş = sen)')),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

    const badges = [];
    const flags = target.flags?.toArray() || [];
    if (flags.includes('Staff')) badges.push('👨‍💼 Discord Personeli');
    if (flags.includes('Partner')) badges.push('🤝 Partner');
    if (flags.includes('HypeSquadOnlineHouse1')) badges.push('🏠 HypeSquad Bravery');
    if (flags.includes('HypeSquadOnlineHouse2')) badges.push('🏠 HypeSquad Brilliance');
    if (flags.includes('HypeSquadOnlineHouse3')) badges.push('🏠 HypeSquad Balance');
    if (flags.includes('BugHunterLevel1')) badges.push('🐛 Bug Hunter');
    if (flags.includes('BugHunterLevel2')) badges.push('🐛 Bug Hunter Altın');
    if (flags.includes('VerifiedBotDeveloper')) badges.push('🤖 Bot Geliştirici');
    if (flags.includes('ActiveDeveloper')) badges.push('⚡ Aktif Geliştirici');
    if (target.bot) badges.push('🤖 Bot');

    const topRole = member?.roles?.highest?.id !== interaction.guild.id
      ? member?.roles?.highest
      : null;

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || config.colors.primary)
      .setTitle(`${target.username} — Kullanıcı Bilgisi`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '🏷️ Tag', value: target.tag, inline: true },
        { name: '📅 Hesap Oluşturulma', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Sunucuya Katılma', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Bilinmiyor', inline: true },
        { name: '🎭 En Yüksek Rol', value: topRole ? `${topRole}` : 'Yok', inline: true },
        { name: '🏅 Rozetler', value: badges.length ? badges.join('\n') : 'Yok', inline: false },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
