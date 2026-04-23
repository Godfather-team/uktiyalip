// /filter - Audio filters (Kazagumo)
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../../music/musicManager.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

const FILTERS = {
  bassboost: {
    equalizer: [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.5 },
      { band: 2, gain: 0.35 },
      { band: 3, gain: 0.2 },
    ],
  },
  nightcore: { timescale: { speed: 1.2, pitch: 1.3, rate: 1.0 } },
  slowed: { timescale: { speed: 0.8, pitch: 0.9, rate: 1.0 } },
  '8d': { rotation: { rotationHz: 0.2 } },
  vaporwave: {
    timescale: { speed: 0.8, pitch: 0.8, rate: 1.0 },
    equalizer: [
      { band: 1, gain: 0.3 },
      { band: 0, gain: 0.3 },
    ],
  },
  karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
  tremolo: { tremolo: { frequency: 2.0, depth: 0.5 } },
  vibrato: { vibrato: { frequency: 2.0, depth: 0.5 } },
  reset: {},
};

export default {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('🎛️ Ses filtresi uygula')
    .addStringOption((o) =>
      o
        .setName('filtre')
        .setDescription('Uygulanacak filtre')
        .setRequired(true)
        .addChoices(
          { name: '🔊 Bass Boost', value: 'bassboost' },
          { name: '⚡ Nightcore', value: 'nightcore' },
          { name: '🌙 Slowed', value: 'slowed' },
          { name: '🎧 8D Audio', value: '8d' },
          { name: '🌊 Vaporwave', value: 'vaporwave' },
          { name: '🎤 Karaoke', value: 'karaoke' },
          { name: '〰️ Tremolo', value: 'tremolo' },
          { name: '🔮 Vibrato', value: 'vibrato' },
          { name: '❌ Sıfırla', value: 'reset' },
        ),
    ),

  async execute(interaction, client) {
    const player = getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ embeds: [errorEmbed('Müzik çalmıyor.')], ephemeral: true });
    }

    await interaction.deferReply();

    const name = interaction.options.getString('filtre');
    try {
      await player.shoukaku.setFilters(FILTERS[name]);
      const label = name === 'reset' ? 'Filtreler sıfırlandı' : `${name.charAt(0).toUpperCase() + name.slice(1)} uygulandı`;
      interaction.editReply({ embeds: [successEmbed('Filtre', `🎛️ **${label}**`)] });
    } catch (err) {
      interaction.editReply({ embeds: [errorEmbed(`Filtre uygulanamadı: ${err.message}`)] });
    }
  },
};
