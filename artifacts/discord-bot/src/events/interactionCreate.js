// Interaction Handler - Slash commands + Buttons
// Developed by Sxy.com | Sxyware

import { errorEmbed } from '../utils/embeds.js';
import { createTicket, claimTicket, closeTicket } from '../utils/tickets.js';
import { handleRoleButton } from '../utils/reactionRoles.js';
import { getGiveaway, saveGiveaway } from '../utils/database.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    // ---------- BUTONLAR ----------
    if (interaction.isButton()) {
      try {
        const id = interaction.customId;
        if (id.startsWith('ticket_open_')) {
          const type = id.replace('ticket_open_', '');
          return await createTicket(interaction, type);
        }
        if (id === 'ticket_claim') return await claimTicket(interaction);
        if (id === 'ticket_close') return await closeTicket(interaction);
        if (id.startsWith('rrole:')) return await handleRoleButton(interaction);
        if (id === 'giveaway_join') {
          const g = getGiveaway(interaction.message.id);
          if (!g || g.ended) {
            return interaction.reply({ content: '❌ Bu çekiliş aktif değil.', ephemeral: true });
          }
          if (g.participants.includes(interaction.user.id)) {
            g.participants = g.participants.filter((u) => u !== interaction.user.id);
            saveGiveaway(g);
            return interaction.reply({
              content: `🚪 Çekilişten ayrıldın. (Toplam: ${g.participants.length})`,
              ephemeral: true,
            });
          }
          g.participants.push(interaction.user.id);
          saveGiveaway(g);
          return interaction.reply({
            content: `🎉 Çekilişe katıldın! (Toplam: ${g.participants.length})`,
            ephemeral: true,
          });
        }
      } catch (err) {
        console.error('[Buttons] hata:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `❌ Hata: ${err.message}`, ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return interaction.reply({
        embeds: [errorEmbed(`"/${interaction.commandName}" komutu bulunamadı.`)],
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(`[Commands] /${interaction.commandName} çalıştırılırken hata:`, err);
      const errMsg = { embeds: [errorEmbed(`Komut çalıştırılırken bir hata oluştu.\n\`${err.message}\``)], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errMsg).catch(() => {});
      } else {
        await interaction.reply(errMsg).catch(() => {});
      }
    }
  },
};
