// Antinuke kick detection + Goodbye messages
// Developed by Sxy.com | Sxyware

import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';
import { getWelcomerConfig } from '../utils/database.js';
import { config } from '../config.js';

function format(template, member) {
  return template
    .replace(/\{user\}/g, `<@${member.id}>`)
    .replace(/\{username\}/g, member.user.username)
    .replace(/\{tag\}/g, member.user.tag)
    .replace(/\{server\}/g, member.guild.name)
    .replace(/\{memberCount\}/g, member.guild.memberCount);
}

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

    // Goodbye message
    const cfg = getWelcomerConfig(member.guild.id);
    if (!cfg.goodbyeEnabled || !cfg.goodbyeChannel) return;

    const channel = member.guild.channels.cache.get(cfg.goodbyeChannel);
    if (!channel?.isTextBased?.()) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.error || 0xDC143C)
      .setTitle(`👋 ${member.user.username} ayrıldı`)
      .setDescription(format(cfg.goodbyeMessage, member))
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: config.footer })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
