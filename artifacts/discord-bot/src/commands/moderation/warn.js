// /warn - Warn a user
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addWarning, getWarnings } from '../../utils/database.js';
import { createModEmbed, errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Kullanıcıyı uyar')
    .addUserOption((o) => o.setName('kullanici').setDescription('Uyarılacak kullanıcı').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Uyarı sebebi').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep');

    const warnCount = addWarning(interaction.guildId, target.id, reason, interaction.user.id);

    const embed = createModEmbed('warn', target, reason, interaction.user);
    embed.addFields({ name: '🔢 Toplam Uyarı', value: `${warnCount}`, inline: true });

    interaction.reply({ embeds: [embed] });

    // Notify the user via DM
    try {
      const dm = await target.createDM();
      await dm.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(`⚠️ Sxyware Sunucusundan Uyarı`)
            .setDescription(`**${interaction.guild.name}** sunucusunda uyarıldın.`)
            .addFields(
              { name: '📝 Sebep', value: reason },
              { name: '🔢 Toplam Uyarı', value: `${warnCount}` },
              { name: '🛡️ Moderatör', value: interaction.user.tag },
            )
            .setFooter({ text: config.footer })
            .setTimestamp(),
        ],
      });
    } catch {
      // DM kapalı olabilir
    }
  },
};
