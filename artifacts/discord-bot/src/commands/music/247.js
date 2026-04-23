// /247 - 24/7 mod (botu ses kanalında tut)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPlayer, toggle247 } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('♾️ 24/7 modunu aç/kapa (bot ses kanalında kalır)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({
        embeds: [errorEmbed('Önce bir müzik başlat. (Bot ses kanalında olmalı)')],
        ephemeral: true,
      });
    }

    const enabled = toggle247(interaction.guildId);
    interaction.reply({
      embeds: [
        successEmbed(
          '24/7 Mod',
          enabled
            ? '♾️ **Aktif** — Bot ses kanalından otomatik çıkmayacak.'
            : '⏹️ **Kapalı** — Bot kimse kalmayınca normal şekilde ayrılacak.',
        ),
      ],
    });
  },
};
