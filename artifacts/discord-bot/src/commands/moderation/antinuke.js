// /antinuke - configure antinuke
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getAntinukeConfig, setAntinukeConfig } from '../../utils/database.js';
import { config } from '../../config.js';

const FEATURES = [
  { id: 'antiBan', label: 'Toplu ban koruması' },
  { id: 'antiKick', label: 'Toplu kick koruması' },
  { id: 'antiChannelDelete', label: 'Kanal silme koruması' },
  { id: 'antiRoleDelete', label: 'Rol silme koruması' },
  { id: 'antiBotAdd', label: 'Bot ekleme koruması' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Sunucu nuke koruması ayarları.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((s) => s.setName('status').setDescription('Mevcut antinuke ayarları.'))
    .addSubcommand((s) =>
      s
        .setName('toggle')
        .setDescription('Antinuke sistemini veya bir özelliği aç/kapat.')
        .addStringOption((o) =>
          o
            .setName('özellik')
            .setDescription('Hangi özellik?')
            .setRequired(true)
            .addChoices(
              { name: 'Tüm sistem', value: 'enabled' },
              ...FEATURES.map((f) => ({ name: f.label, value: f.id })),
            ),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('whitelist')
        .setDescription('Antinuke beyaz liste yönetimi.')
        .addUserOption((o) => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true)),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cfg = getAntinukeConfig(interaction.guildId);

    if (sub === 'status') {
      const lines = FEATURES.map(
        (f) => `${cfg[f.id] ? '🟢' : '🔴'} **${f.label}**`,
      ).join('\n');
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🛡️ Antinuke ${cfg.enabled ? '🟢 AKTİF' : '🔴 KAPALI'}`)
            .setDescription(lines)
            .addFields(
              { name: 'Eşik', value: `${cfg.threshold} işlem / ${cfg.windowMs / 1000}s`, inline: true },
              { name: 'Beyaz liste', value: cfg.whitelist.length ? cfg.whitelist.map((id) => `<@${id}>`).join(', ') : 'Boş', inline: true },
            )
            .setFooter({ text: config.footer })
            .setTimestamp(),
        ],
      });
    }

    if (sub === 'toggle') {
      const feat = interaction.options.getString('özellik');
      const newVal = !cfg[feat];
      setAntinukeConfig(interaction.guildId, { [feat]: newVal });
      const label = feat === 'enabled' ? 'Antinuke sistemi' : FEATURES.find((f) => f.id === feat)?.label;
      return interaction.reply({ content: `${newVal ? '🟢' : '🔴'} **${label}** ${newVal ? 'açıldı' : 'kapatıldı'}.` });
    }

    if (sub === 'whitelist') {
      const user = interaction.options.getUser('kullanıcı');
      const wl = new Set(cfg.whitelist);
      let action;
      if (wl.has(user.id)) {
        wl.delete(user.id);
        action = 'çıkarıldı';
      } else {
        wl.add(user.id);
        action = 'eklendi';
      }
      setAntinukeConfig(interaction.guildId, { whitelist: [...wl] });
      return interaction.reply({ content: `🛡️ <@${user.id}> beyaz listeye **${action}**.` });
    }
  },
};
