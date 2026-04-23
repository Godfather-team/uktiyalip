import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('firstmessage').setDescription('Bu kanalın ilk mesajı.'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const msgs = await interaction.channel.messages.fetch({ after: '0', limit: 1 });
      const first = msgs.first();
      if (!first) return interaction.editReply('Mesaj bulunamadı.');
      interaction.editReply(`📜 İlk mesaj: ${first.url}`);
    } catch { interaction.editReply('Alınamadı.'); }
  },
};
