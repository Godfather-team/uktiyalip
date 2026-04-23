// Antinuke - channel delete protection
// Developed by Sxy.com | Sxyware

import { AuditLogEvent } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';

export default {
  name: 'channelDelete',
  once: false,
  async execute(channel) {
    if (!channel.guild) return;
    const executor = await fetchAuditExecutor(channel.guild, AuditLogEvent.ChannelDelete);
    if (!executor) return;
    await handleAntinukeAction({ guild: channel.guild, executor, type: 'antiChannelDelete', target: channel });
  },
};
