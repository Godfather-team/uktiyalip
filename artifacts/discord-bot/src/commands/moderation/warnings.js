// /warnings - Show user warnings
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getWarnings, clearWarnings } from '../../utils/database.js';
import { config } from '../../config.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('⚠️ Kullanıcı uyarılarını göster / temizle')
    .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addBooleanOption((o) => o.setName('temizle').setDescription('Tüm uyarıları sil'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const clear = interaction.options.getBoolean('temizle');

    if (clear) {
      clearWarnings(interaction.guildId, target.id);
      return interaction.reply({ embeds: [successEmbed('Uyarılar Temizlendi', `${target.tag} kullanıcısının tüm uyarıları silindi.`)] });
    }

    const warnings = getWarnings(interaction.guildId, target.id);

    if (warnings.length === 0) {
      return interaction.reply({ embeds: [errorEmbed(`${target.tag} kullanıcısının uyarısı yok.`)], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(`⚠️ ${target.username} — Uyarılar (${warnings.length})`)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(
        warnings.slice(-10).map((w, i) =>
          `**${i + 1}.** ${w.reason}\n└ Moderatör: <@${w.moderatorId}> • <t:${Math.floor(w.timestamp / 1000)}:R>`,
        ).join('\n\n'),
      )
      .setFooter({ text: `${config.footer} • Silmek için /warnings temizle:true kullan` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
