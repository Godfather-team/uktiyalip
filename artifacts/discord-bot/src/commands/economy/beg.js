import { SlashCommandBuilder } from 'discord.js';
import { addBalance, getEconomyUser, setEconomyUser } from '../../utils/database.js';
export default {
  data: new SlashCommandBuilder().setName('beg').setDescription('Dilen para iste.'),
  async execute(interaction) {
    const u = getEconomyUser(interaction.guildId, interaction.user.id);
    const cd = 5 * 60 * 1000;
    if (Date.now() - (u.lastBeg || 0) < cd) {
      const left = Math.ceil((cd - (Date.now() - u.lastBeg)) / 60000);
      return interaction.reply({ content: `⏳ ${left} dk sonra tekrar dilenebilirsin.`, ephemeral: true });
    }
    const earned = Math.floor(Math.random() * 80) + 10;
    const lucky = Math.random() > 0.3;
    setEconomyUser(interaction.guildId, interaction.user.id, { lastBeg: Date.now() });
    if (lucky) { addBalance(interaction.guildId, interaction.user.id, earned); interaction.reply(`🥺 Birisi sana **${earned}** Sxy Coin verdi!`); }
    else interaction.reply('🥺 Kimse sana acımadı.');
  },
};
