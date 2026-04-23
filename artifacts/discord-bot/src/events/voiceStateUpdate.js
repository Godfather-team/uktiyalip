// Voice State Update - Handle bot/user disconnections (Kazagumo)
// Developed by Sxy.com | Sxyware

import { getPlayer, is247 } from '../music/musicManager.js';

export default {
  name: 'voiceStateUpdate',
  once: false,

  async execute(oldState, newState, client) {
    const guildId = oldState.guild.id;
    const player = getPlayer(guildId);
    if (!player) return;

    // Bot was disconnected from voice channel
    if (oldState.id === client.user.id && !newState.channelId) {
      player.destroy().catch(() => {});
      return;
    }

    // If a user left and bot is now alone — disconnect after 30s (skip if 24/7)
    if (oldState.id !== client.user.id) {
      if (is247(guildId)) return;
      const botChannel = oldState.guild.members.me?.voice?.channel;
      if (botChannel && botChannel.members.filter((m) => !m.user.bot).size === 0) {
        setTimeout(() => {
          if (is247(guildId)) return;
          const p = getPlayer(guildId);
          if (!p) return;
          const ch = oldState.guild.members.me?.voice?.channel;
          if (ch && ch.members.filter((m) => !m.user.bot).size === 0) {
            p.destroy().catch(() => {});
          }
        }, 30000);
      }
    }
  },
};
