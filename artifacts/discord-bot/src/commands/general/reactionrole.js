// /reactionrole - Butonla rol panelleri oluştur
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle } from 'discord.js';
import { buildPanelComponents, buildPanelEmbed } from '../../utils/reactionRoles.js';

const STYLE_MAP = {
  primary: ButtonStyle.Primary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
  secondary: ButtonStyle.Secondary,
};

export default {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('🎭 Butonla rol seçim paneli oluştur (max 5 rol).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((o) => o.setName('başlık').setDescription('Panel başlığı').setRequired(true))
    .addStringOption((o) => o.setName('açıklama').setDescription('Panel açıklaması').setRequired(true))
    .addRoleOption((o) => o.setName('rol1').setDescription('1. rol').setRequired(true))
    .addStringOption((o) => o.setName('etiket1').setDescription('1. butonun yazısı').setRequired(true))
    .addRoleOption((o) => o.setName('rol2').setDescription('2. rol').setRequired(false))
    .addStringOption((o) => o.setName('etiket2').setDescription('2. butonun yazısı').setRequired(false))
    .addRoleOption((o) => o.setName('rol3').setDescription('3. rol').setRequired(false))
    .addStringOption((o) => o.setName('etiket3').setDescription('3. butonun yazısı').setRequired(false))
    .addRoleOption((o) => o.setName('rol4').setDescription('4. rol').setRequired(false))
    .addStringOption((o) => o.setName('etiket4').setDescription('4. butonun yazısı').setRequired(false))
    .addRoleOption((o) => o.setName('rol5').setDescription('5. rol').setRequired(false))
    .addStringOption((o) => o.setName('etiket5').setDescription('5. butonun yazısı').setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ Rolleri Yönet yetkin yok.', flags: 64 });
    }
    await interaction.deferReply({ flags: 64 });

    const title = interaction.options.getString('başlık');
    const description = interaction.options.getString('açıklama');
    const entries = [];
    for (let i = 1; i <= 5; i++) {
      const r = interaction.options.getRole(`rol${i}`);
      const l = interaction.options.getString(`etiket${i}`);
      if (r && l) {
        entries.push({
          roleId: r.id,
          label: l,
          style: i === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary,
        });
      }
    }

    const me = interaction.guild.members.me;
    for (const e of entries) {
      const role = interaction.guild.roles.cache.get(e.roleId);
      if (role && role.position >= me.roles.highest.position) {
        return interaction.editReply({
          content: `❌ **${role.name}** rolü botun rolünden yüksek; bu role buton koyamam. Botun rolünü yukarı taşı.`,
        });
      }
    }

    const embed = buildPanelEmbed(title, description);
    const components = buildPanelComponents(entries);
    await interaction.channel.send({ embeds: [embed], components });
    return interaction.editReply({ content: `✅ Rol paneli oluşturuldu (${entries.length} rol).` });
  },
};
