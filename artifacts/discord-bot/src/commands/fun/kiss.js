import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('kiss').setDescription('Birine Öptü.')
    .addUserOption(o => o.setName('kişi').setDescription('Kim?').setRequired(true)),
  async execute(interaction) {
    const u = interaction.options.getUser('kişi');
    if (u.id === interaction.user.id) return interaction.reply({ content: 'Kendine olmaz.', ephemeral: true });
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.primary).setDescription(`💋 <@${interaction.user.id}>, <@${u.id}> kullanıcısını **Öptü**!`).setFooter({ text: config.footer })] });
  },
};
