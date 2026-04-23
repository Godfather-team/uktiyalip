// Antinuke bot guard + Welcomer + Anti-raid + Auto-role
// Developed by Sxy.com | Sxyware

import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';
import { trackJoin } from '../utils/protection.js';
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
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    if (member.user.bot) {
      const executor = await fetchAuditExecutor(member.guild, AuditLogEvent.BotAdd);
      if (executor) {
        await handleAntinukeAction({
          guild: member.guild,
          executor,
          type: 'antiBotAdd',
          target: member.user,
        });
      }
      return;
    }

    // Anti-raid join tracking
    trackJoin(member).catch(() => {});

    const cfg = getWelcomerConfig(member.guild.id);

    // Auto-role
    if (cfg.autoRole) {
      const role = member.guild.roles.cache.get(cfg.autoRole);
      if (role && member.guild.members.me?.roles.highest.comparePositionTo(role) > 0) {
        member.roles.add(role).catch(() => {});
      }
    }

    // Welcome message
    if (cfg.welcomeEnabled && cfg.welcomeChannel) {
      const channel = member.guild.channels.cache.get(cfg.welcomeChannel);
      if (channel?.isTextBased?.()) {
        const embed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle(`👋 Hoş geldin ${member.user.username}!`)
          .setDescription(format(cfg.welcomeMessage, member))
          .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          .setFooter({ text: config.footer })
          .setTimestamp();
        channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
      }
    }

    // Welcome DM
    if (cfg.welcomeDM) {
      member.send(format(cfg.welcomeDM, member)).catch(() => {});
    }
  },
};
