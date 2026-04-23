// Interaction Handler - Slash commands + Buttons
// Developed by Sxy.com | Sxyware

import { errorEmbed } from '../utils/embeds.js';
import { createTicket, claimTicket, closeTicket } from '../utils/tickets.js';
import { handleRoleButton } from '../utils/reactionRoles.js';

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
