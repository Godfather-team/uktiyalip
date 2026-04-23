// /bomb - Fake server destruction countdown (prank command)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runBomb(channel, guild, sendFn) {
  // sendFn: (embed) => Promise<msg> — either channel.send or interaction.reply/editReply
  let msg;

  // Phase 1: Initializing
  const initEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('☢️ SXYWARE NÜKLEER PROTOKOLİ')
    .setDescription('```ansi\n\u001b[1;31m[SYSTEM] Sunucu imha protokolü başlatılıyor...\u001b[0m\n```')
    .addFields(
      { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
      { name: '🆔 Sunucu ID', value: `\`${guild.id}\``, inline: true },
      { name: '👥 Etkilenecek Kullanıcı', value: `**${guild.memberCount}** kişi`, inline: true },
      { name: '📡 Durum', value: '🔴 Bağlantı kuruluyor...', inline: false },
    )
    .setFooter({ text: 'UYARI: Bu işlem geri alınamaz | Sxyware Nükleer Sistemi' })
    .setTimestamp();

  msg = await sendFn(initEmbed);
  await sleep(2000);

  // Phase 2: Scanning
  const scanEmbed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setTitle('☢️ SİSTEM TARAMASI')
    .setDescription(
      '```\n[✓] Sunucu altyapısı tarandı\n[✓] Kanal yapısı analiz edildi\n[✓] Üye veritabanı çekildi\n[✓] İzin sistemi devre dışı bırakıldı\n[✓] Yedekleme sunucuları engellendi\n[✓] Discord API bağlantısı ele geçirildi\n[...] Silme protokolü yükleniyor...\n```',
    )
    .addFields(
      { name: '💾 Veri', value: `${(guild.memberCount * 2.3).toFixed(1)} MB hedeflendi`, inline: true },
      { name: '🔑 Güvenlik', value: '**DEVRE DIŞI**', inline: true },
      { name: '⚠️ Risk Seviyesi', value: '**MAXIMUM**', inline: true },
    )
    .setFooter({ text: 'Sxyware Nükleer Sistemi v2.4.1' })
    .setTimestamp();

  await msg.edit({ embeds: [scanEmbed] }).catch(() => {});
  await sleep(3000);

  // Phase 3: 60 second countdown
  let seconds = 60;

  while (seconds > 0) {
    const pct = (60 - seconds) / 60;
    const barLength = 20;
    const filled = Math.round(pct * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = seconds > 30 ? 0xFF4500 : seconds > 10 ? 0xFF8C00 : 0xFF0000;
    const pulse = seconds % 2 === 0 ? '💣' : '⚠️';

    const countEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${pulse} SUNUCU İMHA GERİ SAYIMI`)
      .setDescription(
        `\`\`\`\n[BOMB CORE] Aktif ve çalışıyor\n[TARGET  ] ${guild.name}\n[MEMBERS ] ${guild.memberCount} kişi\n[STATUS  ] DETONATE_PENDING\n\`\`\``,
      )
      .addFields(
        { name: '⏱️ Patlama', value: `**${seconds}** saniye sonra`, inline: true },
        { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
        { name: '☢️ Güç', value: `**${(pct * 100).toFixed(1)}%** şarj edildi`, inline: true },
        { name: '📊 İlerleme', value: `\`[${bar}]\` ${Math.round(pct * 100)}%`, inline: false },
        { name: '🔴 Durdurma Kodu', value: `\`SXYWARE-${Math.random().toString(36).substring(2, 8).toUpperCase()}\``, inline: false },
      )
      .setFooter({ text: `Sxyware Nükleer Sistemi • ${new Date().toLocaleTimeString('tr-TR')}` })
      .setTimestamp();

    await msg.edit({ embeds: [countEmbed] }).catch(() => {});
    await sleep(1000);
    seconds--;
  }

  // Phase 4: BOOM embed
  const boomEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('💥💥💥 BOM BOM BOM 💥💥💥')
    .setDescription(`# 💥 B O M ! ! !\n\n**${guild.name}** **PATLATILDI!**\n\n💥💥💥💥💥💥💥💥💥💥`)
    .addFields(
      { name: '☠️ Durum', value: '**YIKIMA TAMAMLANDI**', inline: true },
      { name: '👥 Etkilenen', value: `**${guild.memberCount}** kullanıcı`, inline: true },
      { name: '⏱️ Süre', value: '60 saniye', inline: true },
    )
    .setFooter({ text: 'Sxyware Nükleer Sistemi | GÖREV TAMAMLANDI' })
    .setTimestamp();

  await msg.edit({ embeds: [boomEmbed] }).catch(() => {});

  // Spam BOM in the channel
  const bomMessages = [
    '💥 **BOM!** 💥',
    '☢️ **BOM!!** ☢️',
    '💣 **BOM!!!** 💣',
    '🔥 **BOM!!!!** 🔥',
    '💥☢️💣🔥 **S E R V E R  D E S T R O Y E D** 🔥💣☢️💥',
  ];

  for (const m of bomMessages) {
    await channel.send(m).catch(() => {});
    await sleep(400);
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('bomb')
    .setDescription('💣 Sunucu patlatma protokolünü başlat'),

  async execute(interaction, client) {
    const guild = interaction.guild;

    // Reply with initial embed and get the message reference
    const initEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('☢️ SXYWARE NÜKLEER PROTOKOLİ')
      .setDescription('```ansi\n\u001b[1;31m[SYSTEM] Sunucu imha protokolü başlatılıyor...\u001b[0m\n```')
      .addFields(
        { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
        { name: '🆔 Sunucu ID', value: `\`${guild.id}\``, inline: true },
        { name: '👥 Etkilenecek Kullanıcı', value: `**${guild.memberCount}** kişi`, inline: true },
        { name: '📡 Durum', value: '🔴 Bağlantı kuruluyor...', inline: false },
      )
      .setFooter({ text: 'UYARI: Bu işlem geri alınamaz | Sxyware Nükleer Sistemi' })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [initEmbed], fetchReply: true });
    await sleep(2000);

    // Scanning phase
    const scanEmbed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('☢️ SİSTEM TARAMASI')
      .setDescription(
        '```\n[✓] Sunucu altyapısı tarandı\n[✓] Kanal yapısı analiz edildi\n[✓] Üye veritabanı çekildi\n[✓] İzin sistemi devre dışı bırakıldı\n[✓] Yedekleme sunucuları engellendi\n[✓] Discord API bağlantısı ele geçirildi\n[...] Silme protokolü yükleniyor...\n```',
      )
      .addFields(
        { name: '💾 Veri', value: `${(guild.memberCount * 2.3).toFixed(1)} MB hedeflendi`, inline: true },
        { name: '🔑 Güvenlik', value: '**DEVRE DIŞI**', inline: true },
        { name: '⚠️ Risk Seviyesi', value: '**MAXIMUM**', inline: true },
      )
      .setFooter({ text: 'Sxyware Nükleer Sistemi v2.4.1' })
      .setTimestamp();

    await interaction.editReply({ embeds: [scanEmbed] });
    await sleep(3000);

    // Countdown
    let seconds = 60;
    const channel = interaction.channel;

    while (seconds > 0) {
      const pct = (60 - seconds) / 60;
      const barLength = 20;
      const filled = Math.round(pct * barLength);
      const empty = barLength - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      const color = seconds > 30 ? 0xFF4500 : seconds > 10 ? 0xFF8C00 : 0xFF0000;
      const pulse = seconds % 2 === 0 ? '💣' : '⚠️';

      const countEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${pulse} SUNUCU İMHA GERİ SAYIMI`)
        .setDescription(
          `\`\`\`\n[BOMB CORE] Aktif ve çalışıyor\n[TARGET  ] ${guild.name}\n[MEMBERS ] ${guild.memberCount} kişi\n[STATUS  ] DETONATE_PENDING\n\`\`\``,
        )
        .addFields(
          { name: '⏱️ Patlama', value: `**${seconds}** saniye sonra`, inline: true },
          { name: '🎯 Hedef', value: `**${guild.name}**`, inline: true },
          { name: '☢️ Güç', value: `**${(pct * 100).toFixed(1)}%** şarj edildi`, inline: true },
          { name: '📊 İlerleme', value: `\`[${bar}]\` ${Math.round(pct * 100)}%`, inline: false },
          { name: '🔴 Durdurma Kodu', value: `\`SXYWARE-${Math.random().toString(36).substring(2, 8).toUpperCase()}\``, inline: false },
        )
        .setFooter({ text: `Sxyware Nükleer Sistemi • ${new Date().toLocaleTimeString('tr-TR')}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [countEmbed] }).catch(() => {});
      await sleep(1000);
      seconds--;
    }

    // BOOM
    const boomEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('💥💥💥 BOM BOM BOM 💥💥💥')
      .setDescription(`# 💥 B O M ! ! !\n\n**${guild.name}** **PATLATILDI!**\n\n💥💥💥💥💥💥💥💥💥💥`)
      .addFields(
        { name: '☠️ Durum', value: '**YIKIMA TAMAMLANDI**', inline: true },
        { name: '👥 Etkilenen', value: `**${guild.memberCount}** kullanıcı`, inline: true },
        { name: '⏱️ Süre', value: '60 saniye', inline: true },
      )
      .setFooter({ text: 'Sxyware Nükleer Sistemi | GÖREV TAMAMLANDI' })
      .setTimestamp();

    await interaction.editReply({ embeds: [boomEmbed] });

    const bomMessages = [
      '💥 **BOM!** 💥',
      '☢️ **BOM!!** ☢️',
      '💣 **BOM!!!** 💣',
      '🔥 **BOM!!!!** 🔥',
      '💥☢️💣🔥 **S E R V E R  D E S T R O Y E D** 🔥💣☢️💥',
    ];

    for (const m of bomMessages) {
      await channel.send(m).catch(() => {});
      await sleep(400);
    }
  },
};
