import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getMarriage } from '../../utils/database.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('marriage').setDescription('Evlilik durumunu göster.')
    .addUserOption(o => o.setName('kişi').setDescription('Kim? (boş = sen)')),
  async execute(interaction) {
    const u = interaction.options.getUser('kişi') || interaction.user;
    const r = getMarriage(interaction.guildId, u.id);
    if (!r) return interaction.reply(`💔 <@${u.id}> bekar.`);
    interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF1493).setTitle('💞 Evlilik').setDescription(`<@${u.id}> ❤️ <@${r.partner}>\n\n📅 <t:${Math.floor(r.since / 1000)}:R> evlendiler.`).setFooter({ text: config.footer })] });
  },
};
