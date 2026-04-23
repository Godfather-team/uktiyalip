// /snipe - show last deleted message
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSnipe } from '../../events/messageDelete.js';
import { config } from '../../config.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Bu kanaldaki son silinen mesajı göster.'),

  async execute(interaction) {
    const data = getSnipe(interaction.channelId);
    if (!data) {
      return interaction.reply({
        embeds: [errorEmbed('Bu kanalda silinmiş bir mesaj bulunamadı.')],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setAuthor({ name: data.author.tag, iconURL: data.author.avatar })
      .setDescription(data.content)
      .setFooter({ text: config.footer })
      .setTimestamp(data.time);

    if (data.attachment) embed.setImage(data.attachment);

    return interaction.reply({ embeds: [embed] });
  },
};
