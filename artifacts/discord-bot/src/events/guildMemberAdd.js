// Antinuke bot guard + Otomatik Hoş geldin
// Developed by Sxy.com | Sxyware

import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';
import { findChannel } from '../utils/autoChannel.js';
import { config } from '../config.js';

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

    // Otomatik hoş geldin — kanal ismi welcome/hoşgeldin/giriş içeriyorsa
    const channel = findChannel(member.guild, 'welcome');
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`👋 Hoş geldin ${member.user.username}!`)
      .setDescription(
        `<@${member.id}>, **${member.guild.name}** sunucusuna hoş geldin!\n` +
        `Aramıza katılan **${member.guild.memberCount}.** kişi sen oldun. 🎉`,
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: config.footer })
      .setTimestamp();

    channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
  },
};
