import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('membercount').setDescription('Sunucu üye sayısı.'),
  async execute(interaction) {
    const g = interaction.guild;
    const bots = g.members.cache.filter(m => m.user.bot).size;
    const humans = g.memberCount - bots;
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.info).setTitle(`👥 ${g.name}`).addFields(
      { name: 'Toplam', value: `${g.memberCount}`, inline: true },
      { name: 'İnsan', value: `${humans}`, inline: true },
      { name: 'Bot', value: `${bots}`, inline: true },
    ).setFooter({ text: config.footer })] });
  },
};
