import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('timestamp').setDescription('Discord zaman damgası üret.')
    .addStringOption(o => o.setName('format').setDescription('relative/short/long').addChoices({ name: 'Göreceli', value: 'R' }, { name: 'Tarih', value: 'D' }, { name: 'Tarih+saat', value: 'F' })),
  async execute(interaction) {
    const f = interaction.options.getString('format') || 'F';
    const ts = Math.floor(Date.now() / 1000);
    interaction.reply({ content: `\`<t:${ts}:${f}>\` → <t:${ts}:${f}>`, ephemeral: true });
  },
};
