// Antinuke - mass ban detection
// Developed by Sxy.com | Sxyware

import { AuditLogEvent } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';

export default {
  name: 'guildBanAdd',
  once: false,
  async execute(ban) {
    const executor = await fetchAuditExecutor(ban.guild, AuditLogEvent.MemberBanAdd);
    if (!executor) return;
    await handleAntinukeAction({ guild: ban.guild, executor, type: 'antiBan', target: ban.user });
  },
};
