import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { getMarriage, setMarriage } from '../../utils/database.js';
import { config } from '../../config.js';
export default {
  data: new SlashCommandBuilder().setName('marry').setDescription('Birine evlilik teklifi yap.')
    .addUserOption(o => o.setName('kişi').setDescription('Kim?').setRequired(true)),
  async execute(interaction) {
    const t = interaction.options.getUser('kişi');
    if (t.bot || t.id === interaction.user.id) return interaction.reply({ content: 'Geçersiz seçim.', ephemeral: true });
    if (getMarriage(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'Zaten evlisin.', ephemeral: true });
    if (getMarriage(interaction.guildId, t.id)) return interaction.reply({ content: 'O kişi zaten evli.', ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`marry_yes_${interaction.user.id}_${t.id}`).setLabel('Kabul').setStyle(ButtonStyle.Success).setEmoji('💍'),
      new ButtonBuilder().setCustomId(`marry_no_${interaction.user.id}_${t.id}`).setLabel('Reddet').setStyle(ButtonStyle.Danger),
    );
    const embed = new EmbedBuilder().setColor(0xFF1493).setTitle('💍 Evlilik Teklifi').setDescription(`<@${t.id}>, <@${interaction.user.id}> seninle evlenmek istiyor!`).setFooter({ text: config.footer });
    const msg = await interaction.reply({ content: `<@${t.id}>`, embeds: [embed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
    collector.on('collect', async (i) => {
      if (i.user.id !== t.id) return i.reply({ content: 'Bu sana değil.', ephemeral: true });
      if (i.customId.startsWith('marry_yes')) {
        setMarriage(interaction.guildId, interaction.user.id, t.id);
        await i.update({ embeds: [embed.setDescription(`💞 <@${interaction.user.id}> ❤️ <@${t.id}> evlendi! Tebrikler!`)], components: [] });
      } else {
        await i.update({ embeds: [embed.setDescription(`💔 <@${t.id}> teklifi reddetti.`)], components: [] });
      }
      collector.stop();
    });
    collector.on('end', (c) => { if (c.size === 0) msg.edit({ components: [] }).catch(() => {}); });
  },
};
