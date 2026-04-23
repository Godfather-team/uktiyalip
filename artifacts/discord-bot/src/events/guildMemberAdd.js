// Antinuke - bot add protection
// Developed by Sxy.com | Sxyware

import { AuditLogEvent } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';

export default {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    if (!member.user.bot) return;
    const executor = await fetchAuditExecutor(member.guild, AuditLogEvent.BotAdd);
    if (!executor) return;
    await handleAntinukeAction({ guild: member.guild, executor, type: 'antiBotAdd', target: member.user });
  },
};
