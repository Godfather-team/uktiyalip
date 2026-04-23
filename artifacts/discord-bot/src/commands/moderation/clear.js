// /clear - Delete messages in bulk
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🗑️ Mesajları toplu sil')
    .addIntegerOption((o) =>
      o.setName('adet').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true).setMinValue(1).setMaxValue(100),
    )
    .addUserOption((o) => o.setName('kullanici').setDescription('Sadece bu kullanıcının mesajlarını sil'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('adet');
    const targetUser = interaction.options.getUser('kullanici');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      // Filter by user if specified
      if (targetUser) {
        messages = messages.filter((m) => m.author.id === targetUser.id);
      }

      // Take only the amount requested
      const toDelete = [...messages.values()].slice(0, amount);

      // Filter out messages older than 14 days (Discord limitation)
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = toDelete.filter((m) => m.createdTimestamp > twoWeeksAgo);

      if (deletable.length === 0) {
        return interaction.editReply({ embeds: [errorEmbed('Silinebilecek mesaj bulunamadı. (14 günden eski mesajlar silinemiyor)')] });
      }

      const deleted = await interaction.channel.bulkDelete(deletable, true);

      interaction.editReply({
        embeds: [successEmbed('Mesajlar Silindi', `**${deleted.size}** mesaj başarıyla silindi.`)],
      });
    } catch (err) {
      interaction.editReply({ embeds: [errorEmbed(`Mesajlar silinirken hata: ${err.message}`)] });
    }
  },
};
