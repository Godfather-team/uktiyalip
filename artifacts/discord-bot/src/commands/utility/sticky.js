// /sticky - Sabit (sticky) kanal mesajı
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { setSticky, getSticky, removeSticky } from '../../utils/database.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('📌 Kanala sabit mesaj yapıştır (her yeni mesajdan sonra otomatik aşağı iner)')
    .addSubcommand((s) =>
      s.setName('set')
        .setDescription('Sabit mesaj koy')
        .addStringOption((o) => o.setName('mesaj').setDescription('Sabit kalacak mesaj').setRequired(true))
        .addChannelOption((o) => o.setName('kanal').setDescription('Hedef kanal (boş = bu kanal)'))
    )
    .addSubcommand((s) => s.setName('remove').setDescription('Bu kanaldaki sabit mesajı kaldır'))
    .addSubcommand((s) => s.setName('show').setDescription('Bu kanaldaki sabit mesajı göster'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    if (sub === 'set') {
      const text = interaction.options.getString('mesaj');

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('📌 Sabit Mesaj')
        .setDescription(text)
        .setFooter({ text: config.footer });

      // Önceki sticky varsa sil
      const existing = getSticky(channel.id);
      if (existing?.messageId) {
        try {
          const old = await channel.messages.fetch(existing.messageId);
          await old.delete();
        } catch {}
      }

      const sent = await channel.send({ embeds: [embed] });

      setSticky(channel.id, {
        guildId: interaction.guild.id,
        text,
        messageId: sent.id,
        createdBy: interaction.user.id,
        createdAt: Date.now(),
      });

      return interaction.reply({
        embeds: [successEmbed('Sabit Mesaj', `✅ <#${channel.id}> kanalında sabit mesaj ayarlandı.`)],
        ephemeral: true,
      });
    }

    if (sub === 'remove') {
      const existing = getSticky(channel.id);
      if (!existing) {
        return interaction.reply({
          embeds: [errorEmbed('Bu kanalda sabit mesaj yok.')],
          ephemeral: true,
        });
      }

      // Discord'daki son sticky mesajı sil
      try {
        const msg = await channel.messages.fetch(existing.messageId);
        await msg.delete();
      } catch {}

      removeSticky(channel.id);
      return interaction.reply({
        embeds: [successEmbed('Sabit Mesaj', `🗑️ <#${channel.id}> kanalındaki sabit mesaj kaldırıldı.`)],
        ephemeral: true,
      });
    }

    if (sub === 'show') {
      const existing = getSticky(channel.id);
      if (!existing) {
        return interaction.reply({
          embeds: [errorEmbed('Bu kanalda sabit mesaj yok.')],
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('📌 Mevcut Sabit Mesaj')
        .setDescription(existing.text)
        .addFields(
          { name: 'Ayarlayan', value: `<@${existing.createdBy}>`, inline: true },
          { name: 'Tarih', value: `<t:${Math.floor(existing.createdAt / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: config.footer });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
