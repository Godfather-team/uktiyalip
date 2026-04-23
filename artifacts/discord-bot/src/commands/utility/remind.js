import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addReminder } from '../../utils/database.js';
import { config } from '../../config.js';
function parseDuration(s) {
  const m = s.match(/^(\d+)\s*(s|m|h|d|sn|dk|sa|gün)$/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  const u = m[2].toLowerCase();
  const map = { s: 1000, sn: 1000, m: 60000, dk: 60000, h: 3600000, sa: 3600000, d: 86400000, gün: 86400000 };
  return n * (map[u] || 0);
}
export default {
  data: new SlashCommandBuilder().setName('remind').setDescription('Bir hatırlatma ayarla.')
    .addStringOption(o => o.setName('süre').setDescription('Örn: 10m, 2h, 1d').setRequired(true))
    .addStringOption(o => o.setName('mesaj').setDescription('Hatırlatma metni').setRequired(true)),
  async execute(interaction) {
    const ms = parseDuration(interaction.options.getString('süre'));
    if (!ms) return interaction.reply({ content: 'Geçersiz süre. Örnek: `10m`, `2h`.', ephemeral: true });
    if (ms > 30 * 86400000) return interaction.reply({ content: 'En fazla 30 gün.', ephemeral: true });
    addReminder(interaction.user.id, interaction.options.getString('mesaj'), Date.now() + ms);
    interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('⏰ Hatırlatma Kuruldu').setDescription(`<t:${Math.floor((Date.now() + ms) / 1000)}:R> sana hatırlatacağım.`).setFooter({ text: config.footer })] });
  },
};
