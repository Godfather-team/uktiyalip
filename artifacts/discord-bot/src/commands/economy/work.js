import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addBalance, getEconomyUser, setEconomyUser } from '../../utils/database.js';
import { config } from '../../config.js';
const JOBS = ['programcı', 'kurye', 'garson', 'streamer', 'taksi şoförü', 'esnaf', 'yazılımcı', 'müzisyen'];
export default {
  data: new SlashCommandBuilder().setName('work').setDescription('Çalış ve para kazan.'),
  async execute(interaction) {
    const u = getEconomyUser(interaction.guildId, interaction.user.id);
    const cd = 30 * 60 * 1000;
    if (Date.now() - (u.lastWork || 0) < cd) {
      const left = Math.ceil((cd - (Date.now() - u.lastWork)) / 60000);
      return interaction.reply({ content: `⏳ ${left} dakika sonra tekrar çalışabilirsin.`, ephemeral: true });
    }
    const earned = Math.floor(Math.random() * 400) + 100;
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    addBalance(interaction.guildId, interaction.user.id, earned);
    setEconomyUser(interaction.guildId, interaction.user.id, { lastWork: Date.now() });
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.gold).setTitle('💼 İş Tamamlandı').setDescription(`**${job}** olarak çalıştın ve **${earned}** Sxy Coin kazandın!`).setFooter({ text: config.footer })] });
  },
};
