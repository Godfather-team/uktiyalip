import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('banner').setDescription('Kullanıcı bannerını göster.')
    .addUserOption(o => o.setName('kullanıcı').setDescription('Kim? (boş = sen)')),
  async execute(interaction) {
    await interaction.deferReply();
    const u = interaction.options.getUser('kullanıcı') || interaction.user;
    const full = await interaction.client.users.fetch(u.id, { force: true });
    const b = full.bannerURL({ size: 2048 });
    if (!b) return interaction.editReply('Bu kullanıcının bannerı yok.');
    interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setTitle(`🖼️ ${u.username}`).setImage(b).setFooter({ text: config.footer })] });
  },
};
