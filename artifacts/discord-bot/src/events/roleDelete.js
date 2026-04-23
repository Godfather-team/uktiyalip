// Antinuke - role delete protection
// Developed by Sxy.com | Sxyware

import { AuditLogEvent } from 'discord.js';
import { handleAntinukeAction, fetchAuditExecutor } from '../utils/antinuke.js';

export default {
  name: 'roleDelete',
  once: false,
  async execute(role) {
    const executor = await fetchAuditExecutor(role.guild, AuditLogEvent.RoleDelete);
    if (!executor) return;
    await handleAntinukeAction({ guild: role.guild, executor, type: 'antiRoleDelete', target: role });
  },
};
