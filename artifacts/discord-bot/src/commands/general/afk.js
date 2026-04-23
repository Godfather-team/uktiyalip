// /afk - set yourself as AFK
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { setAfk } from '../../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Kendini AFK olarak işaretle.')
    .addStringOption((o) =>
      o.setName('sebep').setDescription('AFK sebebi').setMaxLength(150),
    ),

  async execute(interaction) {
    const reason = interaction.options.getString('sebep') || 'AFK';
    setAfk(interaction.guildId, interaction.user.id, reason);

    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.manageable) {
        const newName = `[AFK] ${member.displayName}`.slice(0, 32);
        await member.setNickname(newName).catch(() => {});
      }
    } catch {}

    return interaction.reply({
      content: `💤 <@${interaction.user.id}> artık **AFK**: ${reason}`,
    });
  },
};
