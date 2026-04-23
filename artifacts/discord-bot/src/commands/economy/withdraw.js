import { SlashCommandBuilder } from 'discord.js';
import { getEconomyUser, setEconomyUser } from '../../utils/database.js';
export default {
  data: new SlashCommandBuilder().setName('withdraw').setDescription('Bankadan çek.')
    .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const amt = interaction.options.getInteger('miktar');
    const u = getEconomyUser(interaction.guildId, interaction.user.id);
    if ((u.bank || 0) < amt) return interaction.reply({ content: 'Bankada yeterli para yok.', ephemeral: true });
    setEconomyUser(interaction.guildId, interaction.user.id, { balance: (u.balance || 0) + amt, bank: u.bank - amt });
    interaction.reply(`💵 **${amt}** Sxy Coin bankadan çekildi.`);
  },
};
