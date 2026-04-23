// /chat - Direct AI chat command
// Developed by Sxy.com | Sxyware

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import OpenAI from 'openai';
import { config } from '../../config.js';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy',
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export default {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('🤖 Sxyware AI ile konuş')
    .addStringOption((o) =>
      o.setName('mesaj').setDescription('Mesajın').setRequired(true).setMaxLength(500),
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const userMessage = interaction.options.getString('mesaj');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: config.ai.systemPrompt },
          { role: 'user', content: `${interaction.user.username}: ${userMessage}` },
        ],
        max_tokens: 400,
        temperature: 0.9,
      });

      const reply = response.choices[0]?.message?.content || 'Bi hata oldu.';

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setAuthor({ name: 'Sxyware AI', iconURL: interaction.client.user.displayAvatarURL() })
        .addFields(
          { name: `💬 ${interaction.user.username}`, value: userMessage, inline: false },
          { name: '🤖 Sxyware', value: reply, inline: false },
        )
        .setFooter({ text: config.footer })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('[Chat] Hata:', err.message);
      interaction.editReply({ content: '❌ AI şu an yanıt veremiyor, sonra dene.' });
    }
  },
};
