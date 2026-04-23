// /autonomous - Botun otonom modunu aç/kapat
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config.js';
import { getGuildSettings, setGuildSettings } from '../../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('autonomous')
    .setDescription('🤖 Botun otonom (kendi başına yöneten) modunu aç/kapat.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o.setName('durum').setDescription('aç veya kapat').setRequired(true)
        .addChoices({ name: 'Aç', value: 'on' }, { name: 'Kapat', value: 'off' }),
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ Sunucuyu Yönet yetkin yok.', ephemeral: true });
    }
    const durum = interaction.options.getString('durum');
    const enabled = durum === 'on';
    setGuildSettings(interaction.guild.id, { autonomousMode: enabled });

    const embed = new EmbedBuilder()
      .setColor(enabled ? config.colors.success : config.colors.warning)
      .setTitle(enabled ? '🤖 Otonom Mod AÇIK' : '🤖 Otonom Mod KAPALI')
      .setDescription(
        enabled
          ? 'Bot artık her **30 dakikada bir** sunucuyu kontrol edecek; eksik kanalları, dağınık yapıyı ve sorunları kendi başına düzeltecek. Raporlar mod-log kanalına düşecek.'
          : 'Otonom mod kapatıldı. Bot sadece mention\'landığında veya komutlarla çalışacak.',
      )
      .setFooter({ text: config.footer })
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
