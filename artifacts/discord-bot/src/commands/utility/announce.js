// /announce - Make an announcement
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('📢 Duyuru yap')
    .addStringOption((o) => o.setName('mesaj').setDescription('Duyuru mesajı').setRequired(true))
    .addChannelOption((o) => o.setName('kanal').setDescription('Duyuru kanalı (boş = bu kanal)'))
    .addStringOption((o) => o.setName('baslik').setDescription('Başlık'))
    .addBooleanOption((o) => o.setName('ping').setDescription('@everyone ping at'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const message = interaction.options.getString('mesaj');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const title = interaction.options.getString('baslik') || '📢 Duyuru';
    const everyone = interaction.options.getBoolean('ping') || false;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(title)
      .setDescription(message)
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setFooter({ text: `${config.footer} • ${interaction.user.tag} tarafından` })
      .setTimestamp();

    try {
      await channel.send({
        content: everyone ? '@everyone' : null,
        embeds: [embed],
      });

      interaction.reply({ content: `✅ Duyuru ${channel} kanalına gönderildi.`, ephemeral: true });
    } catch (err) {
      interaction.reply({ embeds: [errorEmbed(`Duyuru gönderilemedi: ${err.message}`)], ephemeral: true });
    }
  },
};
