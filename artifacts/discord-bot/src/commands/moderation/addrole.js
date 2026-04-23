import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('addrole').setDescription('Kullanıcıya rol ver.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(o => o.setName('kullanıcı').setDescription('Kim?').setRequired(true))
    .addRoleOption(o => o.setName('rol').setDescription('Hangi rol?').setRequired(true)),
  async execute(interaction) {
    const u = interaction.options.getUser('kullanıcı');
    const r = interaction.options.getRole('rol');
    try {
      const m = await interaction.guild.members.fetch(u.id);
      await m.roles.add(r.id);
      interaction.reply(`✅ <@${u.id}> kullanıcısına <@&${r.id}> verildi.`);
    } catch { interaction.reply({ content: 'Rol verilemedi.', ephemeral: true }); }
  },
};
