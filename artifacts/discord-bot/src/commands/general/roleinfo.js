import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('roleinfo').setDescription('Rol bilgisi.')
    .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  async execute(interaction) {
    const r = interaction.options.getRole('rol');
    interaction.reply({ embeds: [new EmbedBuilder().setColor(r.color || config.colors.primary).setTitle(`@${r.name}`).addFields(
      { name: 'ID', value: r.id, inline: true },
      { name: 'Üye sayısı', value: `${r.members.size}`, inline: true },
      { name: 'Renk', value: r.hexColor, inline: true },
      { name: 'Bahsedilebilir', value: r.mentionable ? 'Evet' : 'Hayır', inline: true },
      { name: 'Pozisyon', value: `${r.position}`, inline: true },
      { name: 'Oluşturuldu', value: `<t:${Math.floor(r.createdTimestamp / 1000)}:R>`, inline: true },
    ).setFooter({ text: config.footer })] });
  },
};
