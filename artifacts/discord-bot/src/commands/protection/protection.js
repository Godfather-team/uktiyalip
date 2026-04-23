// /protection - Sunucu koruma ayarları
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getProtectionConfig, setProtectionConfig } from '../../utils/database.js';
import { config } from '../../config.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('protection')
    .setDescription('🛡️ Sunucu koruma ayarları (antiraid, antilink, antimention)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s.setName('status').setDescription('Mevcut koruma ayarlarını göster'))
    .addSubcommand((s) =>
      s
        .setName('antiraid')
        .setDescription('Anti-raid (toplu katılım koruması)')
        .addBooleanOption((o) => o.setName('aktif').setDescription('Aç/kapa').setRequired(true))
        .addIntegerOption((o) =>
          o.setName('esik').setDescription('X saniyede kaç katılım = raid (varsayılan 8)').setMinValue(3).setMaxValue(50),
        )
        .addStringOption((o) =>
          o
            .setName('aksiyon')
            .setDescription('Raid algılanınca ne yapsın')
            .addChoices(
              { name: 'Sadece kilitle (uyar)', value: 'lock' },
              { name: 'Yeni gelenleri at (kick)', value: 'kick' },
              { name: 'Yeni gelenleri yasakla (ban)', value: 'ban' },
            ),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('antilink')
        .setDescription('Anti-link (link/davet engelleme)')
        .addStringOption((o) =>
          o
            .setName('mod')
            .setDescription('Engelleme modu')
            .setRequired(true)
            .addChoices(
              { name: 'Kapalı', value: 'off' },
              { name: 'Sadece davet linkleri', value: 'invite' },
              { name: 'Tüm linkler', value: 'all' },
            ),
        )
        .addStringOption((o) =>
          o
            .setName('ceza')
            .setDescription('İhlal cezası')
            .addChoices(
              { name: 'Sil', value: 'delete' },
              { name: 'Sil + 5dk timeout', value: 'timeout' },
            ),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('antimention')
        .setDescription('Anti-mention (mention spam koruması)')
        .addBooleanOption((o) => o.setName('aktif').setDescription('Aç/kapa').setRequired(true))
        .addIntegerOption((o) =>
          o.setName('limit').setDescription('Max mention sayısı (varsayılan 5)').setMinValue(2).setMaxValue(20),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('logchannel')
        .setDescription('Koruma log kanalını ayarla')
        .addChannelOption((o) => o.setName('kanal').setDescription('Log kanalı').setRequired(true)),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guildId;
    const cfg = getProtectionConfig(gid);

    if (sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🛡️ Koruma Ayarları')
        .addFields(
          {
            name: 'Anti-Raid',
            value: cfg.antiRaid
              ? `✅ Aktif (${cfg.raidThreshold} katılım/${cfg.raidWindowMs / 1000}sn → \`${cfg.raidAction}\`)`
              : '❌ Kapalı',
            inline: false,
          },
          {
            name: 'Anti-Link',
            value: cfg.antiLink ? `✅ \`${cfg.antiLink}\` modu (ceza: \`${cfg.linkPunish}\`)` : '❌ Kapalı',
            inline: false,
          },
          {
            name: 'Anti-Mention',
            value: cfg.antiMention ? `✅ Aktif (max ${cfg.maxMentions} mention)` : '❌ Kapalı',
            inline: false,
          },
          {
            name: 'Log Kanalı',
            value: cfg.logChannel ? `<#${cfg.logChannel}>` : '*ayarlanmamış*',
            inline: false,
          },
        )
        .setFooter({ text: config.footer });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'antiraid') {
      const aktif = interaction.options.getBoolean('aktif');
      const esik = interaction.options.getInteger('esik');
      const aksiyon = interaction.options.getString('aksiyon');
      const patch = { antiRaid: aktif };
      if (esik) patch.raidThreshold = esik;
      if (aksiyon) patch.raidAction = aksiyon;
      setProtectionConfig(gid, patch);
      return interaction.reply({
        embeds: [
          successEmbed(
            'Anti-Raid',
            `${aktif ? '✅ Açıldı' : '❌ Kapatıldı'}${esik ? ` (eşik: **${esik}**)` : ''}${aksiyon ? ` aksiyon: \`${aksiyon}\`` : ''}`,
          ),
        ],
      });
    }

    if (sub === 'antilink') {
      const mod = interaction.options.getString('mod');
      const ceza = interaction.options.getString('ceza');
      const patch = { antiLink: mod === 'off' ? false : mod };
      if (ceza) patch.linkPunish = ceza;
      setProtectionConfig(gid, patch);
      return interaction.reply({
        embeds: [
          successEmbed('Anti-Link', `Mod: \`${mod}\`${ceza ? ` • Ceza: \`${ceza}\`` : ''}`),
        ],
      });
    }

    if (sub === 'antimention') {
      const aktif = interaction.options.getBoolean('aktif');
      const limit = interaction.options.getInteger('limit');
      const patch = { antiMention: aktif };
      if (limit) patch.maxMentions = limit;
      setProtectionConfig(gid, patch);
      return interaction.reply({
        embeds: [
          successEmbed(
            'Anti-Mention',
            `${aktif ? '✅ Açıldı' : '❌ Kapatıldı'}${limit ? ` (limit: **${limit}**)` : ''}`,
          ),
        ],
      });
    }

    if (sub === 'logchannel') {
      const ch = interaction.options.getChannel('kanal');
      setProtectionConfig(gid, { logChannel: ch.id });
      return interaction.reply({ embeds: [successEmbed('Log Kanalı', `<#${ch.id}> ayarlandı.`)] });
    }
  },
};
