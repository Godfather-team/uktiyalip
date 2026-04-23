// ============================================================
// Kazagumo Music Manager - Shafed-Billi style
// Developed by Sxy.com | Sxyware
// ============================================================

import pkg from 'kazagumo';
import { Connectors } from 'shoukaku';
import { config } from '../config.js';

const { Kazagumo, KazagumoTrack } = pkg;

const LoadType = {
  TRACK: 'track',
  PLAYLIST: 'playlist',
  SEARCH: 'search',
  EMPTY: 'empty',
  ERROR: 'error',
};

// Search engine fallback chain (Shafed-Billi pattern)
const FALLBACK_ENGINES = ['ytmsearch', 'ytsearch', 'scsearch', 'spsearch'];
const DEFAULT_ENGINE = 'ytmsearch';

let manager = null;

// ============================================================
// INITIALIZE KAZAGUMO MANAGER
// ============================================================

export function initManager(client) {
  const nodes = config.lavalinkNodes.map((n) => ({
    name: n.id,
    url: `${n.host}:${n.port}`,
    auth: n.authorization,
    secure: n.secure || false,
  }));

  manager = new Kazagumo(
    {
      defaultSearchEngine: DEFAULT_ENGINE,
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
    },
    new Connectors.DiscordJS(client),
    nodes,
    {
      moveOnDisconnect: false,
      resume: true,
      resumeTimeout: 60,
      reconnectTries: 5,
      reconnectInterval: 5,
      restTimeout: 60000,
      voiceConnectionTimeout: 30000,
      userAgent: 'Sxyware/1.0',
    },
  );

  // Override search to support multi-source fallback (Shafed-Billi style)
  manager.search = async function searchTracks(query, options = {}) {
    const connectedNodes = [...this.shoukaku.nodes.values()].filter((n) => n.state === 1);
    if (connectedNodes.length === 0) {
      throw new Error('Hiçbir Lavalink sunucusu bağlı değil!');
    }

    const isUrl = /^https?:\/\//i.test(query);

    // Direct URL resolution
    if (isUrl) {
      for (const node of connectedNodes) {
        try {
          const res = await node.rest.resolve(query);
          if (res && res.loadType !== LoadType.ERROR && res.loadType !== LoadType.EMPTY) {
            return processResult(res, options.requester);
          }
        } catch {
          // Try next node
        }
      }
      return { type: 'SEARCH', tracks: [] };
    }

    // Text search: try preferred engine first, then fallbacks
    const engines = [...new Set([options.engine || DEFAULT_ENGINE, ...FALLBACK_ENGINES])];

    for (const node of connectedNodes) {
      for (const engine of engines) {
        try {
          const res = await node.rest.resolve(`${engine}:${query}`);
          if (
            res &&
            res.loadType !== LoadType.ERROR &&
            res.loadType !== LoadType.EMPTY &&
            res.data
          ) {
            return processResult(res, options.requester);
          }
        } catch (err) {
          console.warn(`[Music] ${node.name}/${engine} başarısız: ${err.message}`);
        }
      }
    }

    return { type: 'SEARCH', tracks: [] };
  };

  // Node lifecycle logs
  manager.shoukaku.on('ready', (name) => {
    console.log(`[Music] ✅ Lavalink "${name}" hazır.`);
  });
  manager.shoukaku.on('error', (name, err) => {
    console.error(`[Music] ❌ "${name}" hatası: ${err?.message || err}`);
  });
  manager.shoukaku.on('disconnect', (name) => {
    console.log(`[Music] ⚠️ "${name}" bağlantısı koptu.`);
  });
  manager.shoukaku.on('reconnecting', (name, left) => {
    console.log(`[Music] 🔄 "${name}" yeniden bağlanıyor (${left} deneme)...`);
  });

  client.manager = manager;
  return manager;
}

function processResult(res, requester) {
  switch (res.loadType) {
    case LoadType.TRACK:
      return {
        type: 'TRACK',
        tracks: [new KazagumoTrack(res.data, requester)],
      };
    case LoadType.PLAYLIST:
      return {
        type: 'PLAYLIST',
        playlistName: res.data.info?.name || 'Playlist',
        tracks: res.data.tracks.map((t) => new KazagumoTrack(t, requester)),
      };
    case LoadType.SEARCH:
      return {
        type: 'SEARCH',
        tracks: res.data.map((t) => new KazagumoTrack(t, requester)),
      };
    default:
      return { type: 'SEARCH', tracks: [] };
  }
}

export function getManager() {
  return manager;
}

// ============================================================
// HELPERS
// ============================================================

export function hasAvailableNodes() {
  if (!manager) return false;
  return [...manager.shoukaku.nodes.values()].some((n) => n.state === 1);
}

export function getPlayer(guildId) {
  return manager?.players.get(guildId);
}

export async function createPlayer(guildId, voiceChannelId, textChannelId) {
  if (!manager) throw new Error('Müzik sistemi başlatılmamış!');

  let player = manager.players.get(guildId);
  if (player) {
    if (player.voiceId !== voiceChannelId) {
      throw new Error('Bot zaten başka bir ses kanalında.');
    }
    if (player.textId !== textChannelId) player.textId = textChannelId;
    return player;
  }

  player = await manager.createPlayer({
    guildId,
    voiceId: voiceChannelId,
    textId: textChannelId,
    volume: 100,
    deaf: true,
  });

  return player;
}
