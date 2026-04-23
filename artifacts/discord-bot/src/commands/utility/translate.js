import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('translate').setDescription('Metin çevir (Google).')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true))
    .addStringOption(o => o.setName('dil').setDescription('Hedef dil kodu (en, tr, de...)').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const text = interaction.options.getString('metin');
    const target = interaction.options.getString('dil');
    try {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`);
      const d = await r.json();
      const out = d[0].map(p => p[0]).join('');
      interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.info).setTitle('🌐 Çeviri').addFields({ name: 'Kaynak', value: text.slice(0, 1000) }, { name: `→ ${target}`, value: out.slice(0, 1000) }).setFooter({ text: config.footer })] });
    } catch { interaction.editReply('Çeviri başarısız.'); }
  },
};
