import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('channelinfo').setDescription('Kanal bilgisi.')
    .addChannelOption(o => o.setName('kanal').setDescription('Hangi kanal? (boş = bu kanal)')),
  async execute(interaction) {
    const ch = interaction.options.getChannel('kanal') || interaction.channel;
    const types = { 0: 'Metin', 2: 'Ses', 4: 'Kategori', 5: 'Duyuru', 13: 'Sahne', 15: 'Forum' };
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.info).setTitle(`#${ch.name}`).addFields(
      { name: 'ID', value: ch.id, inline: true },
      { name: 'Tip', value: types[ch.type] || `${ch.type}`, inline: true },
      { name: 'Oluşturuldu', value: `<t:${Math.floor(ch.createdTimestamp / 1000)}:R>`, inline: true },
    ).setFooter({ text: config.footer })] });
  },
};
