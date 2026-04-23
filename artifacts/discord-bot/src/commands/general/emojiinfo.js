import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('emojiinfo').setDescription('Sunucu emoji bilgisi.')
    .addStringOption(o => o.setName('emoji').setDescription('Sunucu emojisi').setRequired(true)),
  async execute(interaction) {
    const raw = interaction.options.getString('emoji');
    const m = raw.match(/<a?:\w+:(\d+)>/);
    if (!m) return interaction.reply({ content: 'Geçersiz emoji.', ephemeral: true });
    const e = interaction.guild.emojis.cache.get(m[1]);
    if (!e) return interaction.reply({ content: 'Bu sunucuda yok.', ephemeral: true });
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setTitle(`:${e.name}:`).setThumbnail(e.url).addFields(
      { name: 'ID', value: e.id, inline: true },
      { name: 'Animasyonlu', value: e.animated ? 'Evet' : 'Hayır', inline: true },
      { name: 'URL', value: e.url, inline: false },
    ).setFooter({ text: config.footer })] });
  },
};
