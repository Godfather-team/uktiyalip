import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('lockdown').setDescription('Tüm sunucuyu kilitle.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply();
    const everyone = interaction.guild.roles.everyone;
    let n = 0;
    for (const ch of interaction.guild.channels.cache.values()) {
      if (ch.isTextBased?.()) {
        try { await ch.permissionOverwrites.edit(everyone, { SendMessages: false }); n++; } catch {}
      }
    }
    interaction.editReply(`🔒 ${n} kanal kilitlendi.`);
  },
};
