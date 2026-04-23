import { SlashCommandBuilder } from 'discord.js';
import { removeMarriage } from '../../utils/database.js';
export default {
  data: new SlashCommandBuilder().setName('divorce').setDescription('Boşan.'),
  async execute(interaction) {
    const r = removeMarriage(interaction.guildId, interaction.user.id);
    if (!r) return interaction.reply({ content: 'Evli değilsin.', ephemeral: true });
    interaction.reply(`💔 <@${interaction.user.id}>, <@${r.partner}> ile boşandı.`);
  },
};
