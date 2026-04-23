import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('voicemute').setDescription('Ses kanalında sustur.')
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption(o => o.setName('kullanıcı').setDescription('Kim?').setRequired(true)),
  async execute(interaction) {
    const u = interaction.options.getUser('kullanıcı');
    try {
      const m = await interaction.guild.members.fetch(u.id);
      if (!m.voice.channel) return interaction.reply({ content: 'Ses kanalında değil.', ephemeral: true });
      await m.voice.setMute(true);
      interaction.reply(`🔇 <@${u.id}> ses kanalında susturuldu.`);
    } catch { interaction.reply({ content: 'Yapılamadı.', ephemeral: true }); }
  },
};
