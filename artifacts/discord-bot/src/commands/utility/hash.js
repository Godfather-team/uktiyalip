import { SlashCommandBuilder } from 'discord.js';
import crypto from 'crypto';
export default {
  data: new SlashCommandBuilder().setName('hash').setDescription('Metin hash üret.')
    .addStringOption(o => o.setName('metin').setDescription('Metin').setRequired(true))
    .addStringOption(o => o.setName('algoritma').setDescription('md5/sha1/sha256').addChoices({ name: 'MD5', value: 'md5' }, { name: 'SHA1', value: 'sha1' }, { name: 'SHA256', value: 'sha256' })),
  async execute(interaction) {
    const algo = interaction.options.getString('algoritma') || 'sha256';
    const h = crypto.createHash(algo).update(interaction.options.getString('metin')).digest('hex');
    interaction.reply({ content: `🔐 **${algo}**\n\`\`\`\n${h}\n\`\`\``, ephemeral: true });
  },
};
