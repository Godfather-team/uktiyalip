// /welcomer - Hoş geldin / güle güle ayarları
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getWelcomerConfig, setWelcomerConfig } from '../../utils/database.js';
import { config } from '../../config.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcomer')
    .setDescription('👋 Hoş geldin / güle güle / auto-role ayarları')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s.setName('status').setDescription('Mevcut ayarları göster'))
    .addSubcommand((s) =>
      s
        .setName('welcome')
        .setDescription('Hoş geldin mesajı ayarla')
        .addBooleanOption((o) => o.setName('aktif').setDescription('Aç/kapa').setRequired(true))
        .addChannelOption((o) => o.setName('kanal').setDescription('Hoş geldin kanalı'))
        .addStringOption((o) =>
          o
            .setName('mesaj')
            .setDescription('Mesaj ({user}, {username}, {server}, {memberCount})'),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('goodbye')
        .setDescription('Güle güle mesajı ayarla')
        .addBooleanOption((o) => o.setName('aktif').setDescription('Aç/kapa').setRequired(true))
        .addChannelOption((o) => o.setName('kanal').setDescription('Güle güle kanalı'))
        .addStringOption((o) => o.setName('mesaj').setDescription('Mesaj template')),
    )
    .addSubcommand((s) =>
      s
        .setName('dm')
        .setDescription('Hoş geldin DM mesajı (boş = kapalı)')
        .addStringOption((o) => o.setName('mesaj').setDescription('DM mesajı (boş bırak = kapat)')),
    )
    .addSubcommand((s) =>
      s
        .setName('autorole')
        .setDescription('Yeni gelen üyelere otomatik rol ver')
        .addRoleOption((o) => o.setName('rol').setDescription('Verilecek rol (boş = kapat)')),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guildId;
    const cfg = getWelcomerConfig(gid);

    if (sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('👋 Welcomer Ayarları')
        .addFields(
          {
            name: 'Hoş Geldin',
            value: cfg.welcomeEnabled
              ? `✅ <#${cfg.welcomeChannel}>\n\`\`\`${cfg.welcomeMessage}\`\`\``
              : '❌ Kapalı',
          },
          {
            name: 'Güle Güle',
            value: cfg.goodbyeEnabled
              ? `✅ <#${cfg.goodbyeChannel}>\n\`\`\`${cfg.goodbyeMessage}\`\`\``
              : '❌ Kapalı',
          },
          { name: 'DM', value: cfg.welcomeDM ? `\`\`\`${cfg.welcomeDM}\`\`\`` : '❌ Kapalı' },
          { name: 'Auto-Role', value: cfg.autoRole ? `<@&${cfg.autoRole}>` : '❌ Kapalı' },
        )
        .setFooter({ text: config.footer });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'welcome') {
      const aktif = interaction.options.getBoolean('aktif');
      const kanal = interaction.options.getChannel('kanal');
      const mesaj = interaction.options.getString('mesaj');
      const patch = { welcomeEnabled: aktif };
      if (kanal) patch.welcomeChannel = kanal.id;
      if (mesaj) patch.welcomeMessage = mesaj;
      setWelcomerConfig(gid, patch);
      return interaction.reply({
        embeds: [successEmbed('Hoş Geldin', aktif ? '✅ Açıldı' : '❌ Kapatıldı')],
      });
    }

    if (sub === 'goodbye') {
      const aktif = interaction.options.getBoolean('aktif');
      const kanal = interaction.options.getChannel('kanal');
      const mesaj = interaction.options.getString('mesaj');
      const patch = { goodbyeEnabled: aktif };
      if (kanal) patch.goodbyeChannel = kanal.id;
      if (mesaj) patch.goodbyeMessage = mesaj;
      setWelcomerConfig(gid, patch);
      return interaction.reply({
        embeds: [successEmbed('Güle Güle', aktif ? '✅ Açıldı' : '❌ Kapatıldı')],
      });
    }

    if (sub === 'dm') {
      const mesaj = interaction.options.getString('mesaj');
      setWelcomerConfig(gid, { welcomeDM: mesaj || null });
      return interaction.reply({
        embeds: [successEmbed('DM', mesaj ? '✅ Açıldı' : '❌ Kapatıldı')],
      });
    }

    if (sub === 'autorole') {
      const rol = interaction.options.getRole('rol');
      setWelcomerConfig(gid, { autoRole: rol?.id || null });
      return interaction.reply({
        embeds: [successEmbed('Auto-Role', rol ? `<@&${rol.id}> ayarlandı.` : '❌ Kapatıldı')],
      });
    }
  },
};
