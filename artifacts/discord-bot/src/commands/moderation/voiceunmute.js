import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('voiceunmute').setDescription('Ses susturmasını kaldır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption(o => o.setName('kullanıcı').setDescription('Kim?').setRequired(true)),
  async execute(interaction) {
    const u = interaction.options.getUser('kullanıcı');
    try {
      const m = await interaction.guild.members.fetch(u.id);
      await m.voice.setMute(false);
      interaction.reply(`🔊 <@${u.id}> susturması kaldırıldı.`);
    } catch { interaction.reply({ content: 'Yapılamadı.', ephemeral: true }); }
  },
};
