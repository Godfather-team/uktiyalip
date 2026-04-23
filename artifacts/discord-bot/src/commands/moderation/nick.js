import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('nick').setDescription('Kullanıcı lakabını değiştir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(o => o.setName('kullanıcı').setDescription('Kim?').setRequired(true))
    .addStringOption(o => o.setName('lakap').setDescription('Yeni lakap (boş bırak = sıfırla)')),
  async execute(interaction) {
    const u = interaction.options.getUser('kullanıcı');
    const nick = interaction.options.getString('lakap') || null;
    try {
      const m = await interaction.guild.members.fetch(u.id);
      await m.setNickname(nick);
      interaction.reply(`✅ <@${u.id}> lakabı: **${nick || 'sıfırlandı'}**`);
    } catch { interaction.reply({ content: 'Lakap değiştirilemedi.', ephemeral: true }); }
  },
};
