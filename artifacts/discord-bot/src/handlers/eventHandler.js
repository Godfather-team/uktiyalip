// Event Handler - Loads all Discord events
// Developed by Sxy.com | Sxyware

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const files = readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const filePath = join(eventsPath, file);
    const event = await import(pathToFileURL(filePath).href);
    const ev = event.default;

    if (!ev?.name || !ev?.execute) {
      console.warn(`[Events] "${file}" geçersiz event yapısı, atlanıyor.`);
      continue;
    }

    if (ev.once) {
      client.once(ev.name, (...args) => ev.execute(...args, client));
    } else {
      client.on(ev.name, (...args) => ev.execute(...args, client));
    }

    console.log(`[Events] ✅ "${ev.name}" eventi yüklendi.`);
  }
}
