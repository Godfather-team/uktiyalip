// Antinuke kick detection + Otomatik güle güle
// Developed by Sxy.com | Sxyware

import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';
import { findChannel } from '../utils/autoChannel.js';
import { config } from '../config.js';

export default {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    // Antinuke
    const executor = await fetchAuditExecutor(member.guild, AuditLogEvent.MemberKick);
    if (executor) {
      await handleAntinukeAction({
        guild: member.guild,
        executor,
        type: 'antiKick',
        target: member.user,
      });
    }

    if (member.user.bot) return;

    // Otomatik güle güle
    const channel = findChannel(member.guild, 'goodbye');
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.error || 0xDC143C)
      .setTitle(`👋 ${member.user.username} ayrıldı`)
      .setDescription(
        `**${member.user.username}** aramızdan ayrıldı. Artık **${member.guild.memberCount}** kişiyiz. 💔`,
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: config.footer })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
