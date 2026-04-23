// Reaction/Button Roles - Buton ile rol seçimi
// Developed by Sxy.com | Sxyware

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';
import { config } from '../config.js';

// Button customId format: rrole:<roleId>
export function buildPanelComponents(roleEntries) {
  // roleEntries: [{ roleId, label, emoji?, style? }]
  const rows = [];
  let current = new ActionRowBuilder();
  for (const r of roleEntries) {
    if (current.components.length === 5) {
      rows.push(current);
      current = new ActionRowBuilder();
    }
    const btn = new ButtonBuilder()
      .setCustomId(`rrole:${r.roleId}`)
      .setLabel(r.label.slice(0, 80))
      .setStyle(r.style || ButtonStyle.Secondary);
    if (r.emoji) {
      try { btn.setEmoji(r.emoji); } catch {}
    }
    current.addComponents(btn);
  }
  if (current.components.length) rows.push(current);
  return rows.slice(0, 5);
}

export function buildPanelEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

// Buton tıklama handler
export async function handleRoleButton(interaction) {
  const roleId = interaction.customId.split(':')[1];
  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    return interaction.reply({ content: '❌ Rol bulunamadı (silinmiş olabilir).', ephemeral: true });
  }

  const me = interaction.guild.members.me;
  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return interaction.reply({ content: '❌ Botun rol yönetme yetkisi yok.', ephemeral: true });
  }
  if (role.position >= me.roles.highest.position) {
    return interaction.reply({ content: '❌ Bu rol botun rolünden yüksek; veremem.', ephemeral: true });
  }

  const member = interaction.member;
  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId, 'Reaction Role kaldırma');
      return interaction.reply({ content: `🔻 **${role.name}** rolü kaldırıldı.`, ephemeral: true });
    } else {
      await member.roles.add(roleId, 'Reaction Role ekleme');
      return interaction.reply({ content: `🔺 **${role.name}** rolü verildi!`, ephemeral: true });
    }
  } catch (err) {
    return interaction.reply({ content: `❌ Hata: ${err.message}`, ephemeral: true });
  }
}
