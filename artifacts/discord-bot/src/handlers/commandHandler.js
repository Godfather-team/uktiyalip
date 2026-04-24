// Command Handler - Loads all slash commands
// Developed by Sxy.com | Sxyware

import { REST, Routes } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commands = [];
  const commandsRoot = join(__dirname, '../commands');

  let commandFolders;
  try {
    commandFolders = readdirSync(commandsRoot).filter((f) =>
      statSync(join(commandsRoot, f)).isDirectory(),
    );
  } catch (err) {
    console.error('[Commands] commands klasörü okunamadı:', err.message);
    return;
  }

  for (const folder of commandFolders) {
    const folderPath = join(commandsRoot, folder);

    let files;
    try {
      files = readdirSync(folderPath).filter((f) => f.endsWith('.js'));
    } catch {
      console.log(`[Commands] "${folder}" klasörü bulunamadı, atlanıyor.`);
      continue;
    }

    for (const file of files) {
      const filePath = join(folderPath, file);
      const command = await import(pathToFileURL(filePath).href);

      if (!command.default?.data || !command.default?.execute) {
        console.warn(`[Commands] "${file}" geçersiz komut yapısı, atlanıyor.`);
        continue;
      }

      client.commands.set(command.default.data.name, command.default);
      commands.push(command.default.data.toJSON());
      console.log(`[Commands] ✅ /${command.default.data.name} yüklendi.`);
    }
  }

  // Register slash commands per-guild (anında yansır) + global (yedek)
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`[Commands] ${commands.length} slash komut Discord'a kaydediliyor...`);

    // Global (yeni eklenen sunucularda da görünür ama 1 saate kadar gecikebilir)
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

    // Per-guild (mevcut sunucularda anında yansır)
    const guilds = [...client.guilds.cache.values()];
    for (const guild of guilds) {
      try {
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, guild.id),
          { body: commands },
        );
        console.log(`[Commands] ↳ ${guild.name} (${guild.id}) için kaydedildi.`);
      } catch (err) {
        console.error(`[Commands] ${guild.name} için hata:`, err.message);
      }
    }

    console.log(`[Commands] ✅ ${commands.length} komut başarıyla kaydedildi!`);
  } catch (err) {
    console.error('[Commands] Komutlar kaydedilirken hata:', err.message);
  }
}
