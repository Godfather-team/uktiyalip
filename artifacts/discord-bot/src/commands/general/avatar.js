// /avatar - User avatar
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ Kullanıcı avatarını göster')
    .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı')),

  async execute(interaction, client) {
    const target = interaction.options.getUser('kullanici') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

    const globalAvatar = target.displayAvatarURL({ dynamic: true, size: 1024 });
    const serverAvatar = member?.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${target.username} — Avatar`)
      .setImage(serverAvatar || globalAvatar)
      .setFooter({ text: config.footer })
      .setTimestamp();

    const buttons = [
      new ButtonBuilder().setLabel('PNG').setStyle(ButtonStyle.Link).setURL(globalAvatar.replace(/\.webp|\.gif/, '.png')),
      new ButtonBuilder().setLabel('JPG').setStyle(ButtonStyle.Link).setURL(globalAvatar.replace(/\.webp|\.gif/, '.jpg')),
      new ButtonBuilder().setLabel('WebP').setStyle(ButtonStyle.Link).setURL(globalAvatar.replace(/\.gif/, '.webp')),
    ];

    const row = new ActionRowBuilder().addComponents(buttons);

    interaction.reply({ embeds: [embed], components: [row] });
  },
};
