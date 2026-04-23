import { SlashCommandBuilder } from 'discord.js';
import { addBalance, getEconomyUser, setEconomyUser } from '../../utils/database.js';
export default {
  data: new SlashCommandBuilder().setName('rob').setDescription('Birini soy.')
    .addUserOption(o => o.setName('hedef').setDescription('Kim?').setRequired(true)),
  async execute(interaction) {
    const t = interaction.options.getUser('hedef');
    if (t.bot || t.id === interaction.user.id) return interaction.reply({ content: 'Geçersiz hedef.', ephemeral: true });
    const me = getEconomyUser(interaction.guildId, interaction.user.id);
    const them = getEconomyUser(interaction.guildId, t.id);
    const cd = 60 * 60 * 1000;
    if (Date.now() - (me.lastRob || 0) < cd) {
      const left = Math.ceil((cd - (Date.now() - me.lastRob)) / 60000);
      return interaction.reply({ content: `⏳ ${left} dk sonra tekrar soyabilirsin.`, ephemeral: true });
    }
    setEconomyUser(interaction.guildId, interaction.user.id, { lastRob: Date.now() });
    if ((them.balance || 0) < 100) return interaction.reply('🪙 Hedef çok fakir, soyacak bir şey yok.');
    if (Math.random() < 0.5) {
      const fine = Math.min(me.balance || 0, 200);
      addBalance(interaction.guildId, interaction.user.id, -fine);
      return interaction.reply(`🚓 Yakalandın! **${fine}** Sxy Coin ceza ödedin.`);
    }
    const stolen = Math.floor((them.balance || 0) * (0.1 + Math.random() * 0.3));
    addBalance(interaction.guildId, t.id, -stolen);
    addBalance(interaction.guildId, interaction.user.id, stolen);
    interaction.reply(`💰 <@${t.id}> kullanıcısından **${stolen}** Sxy Coin çaldın!`);
  },
};
