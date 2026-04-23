import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('ship').setDescription('İki kişi ne kadar uyumlu?')
    .addUserOption(o => o.setName('kişi1').setDescription('1. kişi').setRequired(true))
    .addUserOption(o => o.setName('kişi2').setDescription('2. kişi').setRequired(true)),
  async execute(interaction) {
    const a = interaction.options.getUser('kişi1');
    const b = interaction.options.getUser('kişi2');
    const seed = (BigInt(a.id) + BigInt(b.id)) % 101n;
    const pct = Number(seed);
    const bar = '❤'.repeat(Math.round(pct / 10)) + '🖤'.repeat(10 - Math.round(pct / 10));
    const verdict = pct > 80 ? 'Mükemmel uyum!' : pct > 50 ? 'Fena değil!' : pct > 20 ? 'Zorlama olur.' : 'Hayır, asla.';
    const ship = a.username.slice(0, 3) + b.username.slice(-3);
    interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFF1493).setTitle('💘 Aşk Ölçer').setDescription(`**${a.username}** ❤️ **${b.username}**\n\n**${ship}**\n\n${bar}\n**%${pct}** — ${verdict}`).setFooter({ text: config.footer })] });
  },
};
