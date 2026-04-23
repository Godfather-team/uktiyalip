// Antinuke - mass kick detection (via audit logs)
// Developed by Sxy.com | Sxyware

import { AuditLogEvent } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';

export default {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    const executor = await fetchAuditExecutor(member.guild, AuditLogEvent.MemberKick);
    if (!executor) return;
    await handleAntinukeAction({ guild: member.guild, executor, type: 'antiKick', target: member.user });
  },
};
