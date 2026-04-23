// /joke - Random Turkish joke
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

const jokes = [
  { setup: 'Neden programcılar karanlıktan korkar?', punchline: 'Çünkü karanlık modda bile bug bulunur.' },
  { setup: 'Discord botu ne zaman sustur?', punchline: 'Syntax error yapınca.' },
  { setup: 'Bir JavaScript geliştiricisi bara girer...', punchline: 'Null döner.' },
  { setup: 'Neden git kullanıyoruz?', punchline: 'Her şeyi bozabilesin diye.' },
  { setup: 'CSS neden terapiste gider?', punchline: 'Çünkü element ile ilişkisi çok karmaşık.' },
  { setup: 'Stack Overflow ne zaman çöker?', punchline: 'Sana lazım olduğunda.' },
  { setup: 'En iyi IDE nedir?', punchline: 'Tartışılmaz: boş kağıt ve kalem.' },
  { setup: 'Bir hacker neden hep mutsuz?', punchline: 'Çünkü ağ her zaman şifreli.' },
  { setup: 'Neden Python kullanıyorlar?', punchline: 'Çünkü noktalı virgül koymayı unuttular, bunu özellik yaptılar.' },
  { setup: 'Database yöneticisi neden popülerdir?', punchline: 'Çünkü herkesi JOIN\'lıyor.' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('😂 Rastgele şaka'),

  async execute(interaction, client) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('😂 Şaka Vakti')
      .addFields(
        { name: '❓ Soru', value: joke.setup, inline: false },
        { name: '😂 Cevap', value: `||${joke.punchline}||`, inline: false },
      )
      .setFooter({ text: `${config.footer} • Cevabı görmek için tıkla!` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
