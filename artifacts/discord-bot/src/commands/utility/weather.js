import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('weather').setDescription('Hava durumu.')
    .addStringOption(o => o.setName('şehir').setDescription('Şehir adı').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const city = interaction.options.getString('şehir');
    try {
      const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=tr`);
      const d = await r.json();
      const c = d.current_condition[0];
      interaction.editReply({ embeds: [new EmbedBuilder().setColor(config.colors.info).setTitle(`🌤️ ${city}`).addFields(
        { name: 'Sıcaklık', value: `${c.temp_C}°C (${c.FeelsLikeC}°C hissedilen)`, inline: true },
        { name: 'Durum', value: c.lang_tr?.[0]?.value || c.weatherDesc[0].value, inline: true },
        { name: 'Nem', value: `${c.humidity}%`, inline: true },
        { name: 'Rüzgar', value: `${c.windspeedKmph} km/s`, inline: true },
      ).setFooter({ text: config.footer })] });
    } catch { interaction.editReply('Hava durumu alınamadı.'); }
  },
};
