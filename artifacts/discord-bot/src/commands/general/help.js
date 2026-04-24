// /help - All commands list
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { config } from '../../config.js';

const categories = {
  '🎵 Müzik': [
    '`/play [sorgu]` — Şarkı çal (YouTube, Spotify, SoundCloud)',
    '`/skip` — Şarkıyı atla',
    '`/stop` — Müziği durdur ve çık',
    '`/pause` — Duraklat / devam ettir',
    '`/queue` — Kuyruğu göster',
    '`/nowplaying` — Şu an çalanı göster',
    '`/loop [mod]` — Loop modu (off/şarkı/kuyruk)',
    '`/volume [0-100]` — Ses seviyesi',
    '`/filter [filtre]` — Ses filtresi uygula',
  ],
  '🛡️ Moderasyon': [
    '`/ban [kullanıcı] [sebep]` — Banla',
    '`/kick [kullanıcı] [sebep]` — At',
    '`/mute [kullanıcı] [süre] [sebep]` — Sustur',
    '`/unmute [kullanıcı]` — Sesini aç',
    '`/warn [kullanıcı] [sebep]` — Uyar',
    '`/warnings [kullanıcı]` — Uyarıları göster',
    '`/clear [adet]` — Mesajları sil',
    '`/slowmode [saniye]` — Yavaş mod',
    '`/lock` — Kanalı kilitle',
    '`/unlock` — Kanalı aç',
  ],
  '🎵 Müzik': [
    '`/play [şarkı]` — Şarkı çal',
    '`/skip` — Atla',
    '`/stop` — Durdur',
    '`/queue` — Kuyruk',
    '`/lyrics` — Şarkı sözleri',
    '`/shuffle` — Kuyruğu karıştır',
    '`/seek [zaman]` — Zaman atla',
    '`/remove [sıra]` — Kuyruktan sil',
    '`/clearqueue` — Kuyruğu temizle',
    '`/247` — 24/7 modu',
    '`/autoplay` — Otomatik çal',
  ],
  '🛡️ Koruma': [
    '`/antinuke` — Antinuke ayarları (anti-ban/kick/spam)',
    '`/automod` — Otomatik moderasyon',
    '*Hoş geldin / güle güle otomatiktir — kanal ismine göre algılanır.*',
  ],
  '🎉 Çekiliş': [
    '`/giveaway start` — Çekiliş başlat',
    '`/giveaway end` — Çekilişi bitir',
    '`/giveaway reroll` — Tekrar çek',
    '`/giveaway list` — Aktif çekilişler',
  ],
  '⭐ Seviye': [
    '`/rank [kullanıcı]` — Seviye kartı',
    '`/leaderboard` — Seviye sıralaması',
  ],
  '🎲 Eğlence': [
    '`/8ball [soru]` — Sihirli 8 top',
    '`/coinflip` — Yazı tura',
    '`/roll [zar]` — Zar at (örn: 2d6)',
    '`/rps [seçim]` — Taş kağıt makas',
    '`/joke` — Şaka',
    '`/meme` — Meme',
  ],
  '🔧 Genel': [
    '`/ping` — Bot gecikmesi',
    '`/serverinfo` — Sunucu bilgisi',
    '`/userinfo [kullanıcı]` — Kullanıcı bilgisi',
    '`/avatar [kullanıcı]` — Avatar',
    '`/botinfo` — Bot bilgisi',
    '`/poll [soru]` — Anket oluştur',
    '`/announce [kanal] [mesaj]` — Duyuru',
    '`/sticky set/remove/show` — Kanala sabit mesaj',
    '`/chat [mesaj]` — AI ile konuş',
  ],
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖 Tüm komutları göster'),

  async execute(interaction, client) {
    const mainEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setAuthor({ name: 'Sxyware Bot — Komut Listesi', iconURL: client.user.displayAvatarURL() })
      .setDescription('Aşağıdan bir kategori seç veya tüm komutları gör.\nBot mention ederek AI ile konuşabilirsin.')
      .addFields(
        Object.entries(categories).map(([cat, cmds]) => ({
          name: cat,
          value: `${cmds.length} komut`,
          inline: true,
        })),
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    const select = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('Kategori seç...')
      .addOptions(
        Object.keys(categories).map((cat) => ({
          label: cat.replace(/[^\w\s]/g, '').trim(),
          value: cat,
          emoji: cat.split(' ')[0],
        })),
      );

    const row = new ActionRowBuilder().addComponents(select);

    const msg = await interaction.reply({ embeds: [mainEmbed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id === interaction.user.id,
      time: 120000,
    });

    collector.on('collect', async (i) => {
      const cat = i.values[0];
      const cmds = categories[cat];

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${cat} Komutları`)
        .setDescription(cmds.join('\n'))
        .setFooter({ text: config.footer })
        .setTimestamp();

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};
