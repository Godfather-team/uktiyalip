// /automod - configure automod settings
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getAutomodConfig, setAutomodConfig } from '../../utils/database.js';
import { config } from '../../config.js';

const FEATURES = [
  { id: 'antiLink', label: 'Link engelleme' },
  { id: 'antiInvite', label: 'Davet linki engelleme' },
  { id: 'antiMention', label: 'Toplu etiket engelleme' },
  { id: 'antiCaps', label: 'Büyük harf engelleme' },
  { id: 'badWords', label: 'Küfür filtresi' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Otomatik moderasyon ayarları.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s.setName('status').setDescription('Mevcut automod ayarlarını gösterir.'),
    )
    .addSubcommand((s) =>
      s
        .setName('toggle')
        .setDescription('Bir özelliği aç/kapat.')
        .addStringOption((o) =>
          o
            .setName('özellik')
            .setDescription('Hangi özellik?')
            .setRequired(true)
            .addChoices(...FEATURES.map((f) => ({ name: f.label, value: f.id }))),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cfg = getAutomodConfig(interaction.guildId);

    if (sub === 'status') {
      const lines = FEATURES.map(
        (f) => `${cfg[f.id] ? '🟢' : '🔴'} **${f.label}** — \`/automod toggle ${f.id}\``,
      ).join('\n');

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🛡️ Automod Ayarları')
            .setDescription(lines)
            .addFields(
              { name: 'Maks etiket', value: `${cfg.maxMentions}`, inline: true },
              { name: 'Caps eşiği', value: `${cfg.capsThreshold}%`, inline: true },
            )
            .setFooter({ text: config.footer })
            .setTimestamp(),
        ],
      });
    }

    if (sub === 'toggle') {
      const feat = interaction.options.getString('özellik');
      const newVal = !cfg[feat];
      setAutomodConfig(interaction.guildId, { [feat]: newVal });
      const label = FEATURES.find((f) => f.id === feat)?.label || feat;
      return interaction.reply({
        content: `${newVal ? '🟢' : '🔴'} **${label}** ${newVal ? 'açıldı' : 'kapatıldı'}.`,
      });
    }
  },
};
