// AI Agent Tools — Botun sunucuyu yönetmesini sağlayan OpenAI function-calling araçları.
// Developed by Sxy.com | Sxyware

import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { addWarning, getGuildSettings } from './database.js';

// ============================================================
// TOOL TANIMLARI (OpenAI function-calling şeması)
// ============================================================

export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'ban_user',
      description: 'Bir kullanıcıyı sunucudan banlar. Sadece moderasyon yetkisi olan kişi istediğinde kullan.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'Banlanacak kullanıcının Discord ID\'si' },
          reason: { type: 'string', description: 'Ban sebebi' },
          delete_message_days: { type: 'number', description: '0-7 gün arası mesaj silme süresi', default: 0 },
        },
        required: ['user_id', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'kick_user',
      description: 'Bir kullanıcıyı sunucudan atar.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['user_id', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'timeout_user',
      description: 'Kullanıcıya timeout (süreli susturma) verir.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          duration_minutes: { type: 'number', description: 'Dakika cinsinden süre (max 40320 = 28 gün)' },
          reason: { type: 'string' },
        },
        required: ['user_id', 'duration_minutes', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'untimeout_user',
      description: 'Kullanıcının timeout cezasını kaldırır.',
      parameters: {
        type: 'object',
        properties: { user_id: { type: 'string' }, reason: { type: 'string' } },
        required: ['user_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'warn_user',
      description: 'Kullanıcıya uyarı kaydı ekler (kayıtlı uyarı).',
      parameters: {
        type: 'object',
        properties: { user_id: { type: 'string' }, reason: { type: 'string' } },
        required: ['user_id', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_messages',
      description: 'Mevcut kanaldaki son N mesajı (max 100) siler.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: '1-100 arası mesaj sayısı' },
          channel_id: { type: 'string', description: 'Hedef kanal (opsiyonel, varsayılan mevcut kanal)' },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_channel',
      description: 'Yeni metin/ses kanalı oluşturur.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['text', 'voice', 'category', 'announcement', 'forum'] },
          category_id: { type: 'string', description: 'Kategoriye yerleştir (opsiyonel)' },
          topic: { type: 'string', description: 'Kanal konusu (opsiyonel)' },
        },
        required: ['name', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_channel',
      description: 'Bir kanalı siler.',
      parameters: {
        type: 'object',
        properties: { channel_id: { type: 'string' }, reason: { type: 'string' } },
        required: ['channel_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'lock_channel',
      description: 'Kanalı kilitler (everyone mesaj atamaz).',
      parameters: {
        type: 'object',
        properties: { channel_id: { type: 'string' }, lock: { type: 'boolean', description: 'true=kilitle, false=aç' } },
        required: ['channel_id', 'lock'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_slowmode',
      description: 'Kanala slowmode (yavaş mod) uygular. 0 = kapalı.',
      parameters: {
        type: 'object',
        properties: { channel_id: { type: 'string' }, seconds: { type: 'number', description: '0-21600 arası' } },
        required: ['channel_id', 'seconds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_message',
      description: 'Bir kanala mesaj gönderir.',
      parameters: {
        type: 'object',
        properties: { channel_id: { type: 'string' }, content: { type: 'string' } },
        required: ['channel_id', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_role',
      description: 'Yeni bir rol oluşturur.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          color_hex: { type: 'string', description: 'örn "#FF0000"' },
          mentionable: { type: 'boolean' },
          hoist: { type: 'boolean', description: 'Üye listesinde ayrı göster' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assign_role',
      description: 'Kullanıcıya rol verir.',
      parameters: {
        type: 'object',
        properties: { user_id: { type: 'string' }, role_id: { type: 'string' } },
        required: ['user_id', 'role_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_role',
      description: 'Kullanıcıdan rol alır.',
      parameters: {
        type: 'object',
        properties: { user_id: { type: 'string' }, role_id: { type: 'string' } },
        required: ['user_id', 'role_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_nickname',
      description: 'Kullanıcının takma adını değiştirir.',
      parameters: {
        type: 'object',
        properties: { user_id: { type: 'string' }, nickname: { type: 'string' } },
        required: ['user_id', 'nickname'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_server_info',
      description: 'Sunucu hakkında özet bilgi döner: kanal listesi, rol listesi, üye sayısı, ayarlar.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_channel',
      description: 'Bir kanalı belirli bir kategoriye taşır.',
      parameters: {
        type: 'object',
        properties: {
          channel_id: { type: 'string' },
          category_id: { type: 'string' },
        },
        required: ['channel_id', 'category_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_channel_permission',
      description: 'Bir rol veya kullanıcıya kanal izni verir/kaldırır. (ViewChannel, SendMessages, ReadMessageHistory)',
      parameters: {
        type: 'object',
        properties: {
          channel_id: { type: 'string' },
          target_id: { type: 'string', description: 'rol veya kullanıcı ID' },
          view: { type: 'string', enum: ['allow', 'deny', 'inherit'] },
          send: { type: 'string', enum: ['allow', 'deny', 'inherit'] },
          read_history: { type: 'string', enum: ['allow', 'deny', 'inherit'] },
        },
        required: ['channel_id', 'target_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_user',
      description: 'Kullanıcı adına/etiketine göre üye arar; ID döner.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'isim, takma ad veya tag' } },
        required: ['query'],
      },
    },
  },
];

// ============================================================
// İZİN KONTROLÜ
// ============================================================

const DESTRUCTIVE = new Set([
  'ban_user', 'kick_user', 'timeout_user', 'untimeout_user', 'warn_user',
  'clear_messages', 'create_channel', 'delete_channel', 'lock_channel',
  'set_slowmode', 'create_role', 'assign_role', 'remove_role', 'set_nickname',
  'send_message', 'move_channel', 'set_channel_permission',
]);

function isAuthorized(member, toolName) {
  if (!member) return false;
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (!DESTRUCTIVE.has(toolName)) return true; // okuma araçları herkese açık

  // Moderasyon araçları: ManageGuild yeterli
  return member.permissions.has(PermissionFlagsBits.ManageGuild)
    || member.permissions.has(PermissionFlagsBits.ModerateMembers)
    || member.permissions.has(PermissionFlagsBits.BanMembers);
}

// ============================================================
// EXECUTOR
// ============================================================

async function fetchMember(guild, id) {
  try { return await guild.members.fetch(id); } catch { return null; }
}

export async function executeTool(name, args, ctx) {
  const { guild, channel, member } = ctx;

  if (!isAuthorized(member, name)) {
    return { ok: false, error: `${member.user.username} bu işlem için yetkili değil (${name}).` };
  }

  try {
    switch (name) {
      case 'ban_user': {
        const target = await fetchMember(guild, args.user_id);
        const tag = target?.user?.tag || args.user_id;
        await guild.bans.create(args.user_id, {
          reason: `[AI/${member.user.tag}] ${args.reason}`,
          deleteMessageSeconds: Math.min(7, args.delete_message_days || 0) * 86400,
        });
        return { ok: true, message: `${tag} banlandı. Sebep: ${args.reason}` };
      }

      case 'kick_user': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        await target.kick(`[AI/${member.user.tag}] ${args.reason}`);
        return { ok: true, message: `${target.user.tag} sunucudan atıldı.` };
      }

      case 'timeout_user': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        const ms = Math.min(40320, args.duration_minutes) * 60 * 1000;
        await target.timeout(ms, `[AI/${member.user.tag}] ${args.reason}`);
        return { ok: true, message: `${target.user.tag} ${args.duration_minutes}dk susturuldu.` };
      }

      case 'untimeout_user': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        await target.timeout(null, `[AI/${member.user.tag}] ${args.reason || 'Manuel kaldırma'}`);
        return { ok: true, message: `${target.user.tag} timeout kaldırıldı.` };
      }

      case 'warn_user': {
        const total = addWarning(guild.id, args.user_id, args.reason, member.id);
        return { ok: true, message: `<@${args.user_id}> uyarıldı. Toplam uyarı: ${total}` };
      }

      case 'clear_messages': {
        const tgt = args.channel_id ? guild.channels.cache.get(args.channel_id) : channel;
        if (!tgt?.isTextBased()) return { ok: false, error: 'Geçerli metin kanalı yok.' };
        const amount = Math.min(100, Math.max(1, args.amount));
        const deleted = await tgt.bulkDelete(amount, true);
        return { ok: true, message: `${deleted.size} mesaj silindi (#${tgt.name}).` };
      }

      case 'create_channel': {
        const typeMap = {
          text: ChannelType.GuildText,
          voice: ChannelType.GuildVoice,
          category: ChannelType.GuildCategory,
          announcement: ChannelType.GuildAnnouncement,
          forum: ChannelType.GuildForum,
        };
        const ch = await guild.channels.create({
          name: args.name,
          type: typeMap[args.type] ?? ChannelType.GuildText,
          parent: args.category_id || null,
          topic: args.topic,
          reason: `[AI/${member.user.tag}] tarafından oluşturuldu`,
        });
        return { ok: true, message: `Kanal oluşturuldu: <#${ch.id}> (id: ${ch.id})` };
      }

      case 'delete_channel': {
        const ch = guild.channels.cache.get(args.channel_id);
        if (!ch) return { ok: false, error: 'Kanal bulunamadı.' };
        const name = ch.name;
        await ch.delete(`[AI/${member.user.tag}] ${args.reason || 'silindi'}`);
        return { ok: true, message: `#${name} silindi.` };
      }

      case 'lock_channel': {
        const ch = guild.channels.cache.get(args.channel_id);
        if (!ch) return { ok: false, error: 'Kanal bulunamadı.' };
        await ch.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: args.lock ? false : null,
        });
        return { ok: true, message: `#${ch.name} ${args.lock ? 'kilitlendi' : 'açıldı'}.` };
      }

      case 'set_slowmode': {
        const ch = guild.channels.cache.get(args.channel_id) || channel;
        if (!ch?.setRateLimitPerUser) return { ok: false, error: 'Slowmode desteklemeyen kanal.' };
        const sec = Math.min(21600, Math.max(0, args.seconds));
        await ch.setRateLimitPerUser(sec, `[AI/${member.user.tag}]`);
        return { ok: true, message: `#${ch.name} slowmode: ${sec}sn` };
      }

      case 'send_message': {
        const ch = guild.channels.cache.get(args.channel_id);
        if (!ch?.isTextBased()) return { ok: false, error: 'Geçerli metin kanalı yok.' };
        await ch.send({ content: args.content.slice(0, 2000), allowedMentions: { parse: ['users'] } });
        return { ok: true, message: `Mesaj #${ch.name} kanalına gönderildi.` };
      }

      case 'create_role': {
        const role = await guild.roles.create({
          name: args.name,
          color: args.color_hex ? parseInt(args.color_hex.replace('#', ''), 16) : undefined,
          mentionable: !!args.mentionable,
          hoist: !!args.hoist,
          reason: `[AI/${member.user.tag}]`,
        });
        return { ok: true, message: `Rol oluşturuldu: <@&${role.id}> (id: ${role.id})` };
      }

      case 'assign_role': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        await target.roles.add(args.role_id, `[AI/${member.user.tag}]`);
        return { ok: true, message: `${target.user.tag} kullanıcısına rol verildi.` };
      }

      case 'remove_role': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        await target.roles.remove(args.role_id, `[AI/${member.user.tag}]`);
        return { ok: true, message: `${target.user.tag} kullanıcısından rol alındı.` };
      }

      case 'set_nickname': {
        const target = await fetchMember(guild, args.user_id);
        if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
        await target.setNickname(args.nickname.slice(0, 32), `[AI/${member.user.tag}]`);
        return { ok: true, message: `${target.user.tag} takma adı değiştirildi.` };
      }

      case 'move_channel': {
        const ch = guild.channels.cache.get(args.channel_id);
        if (!ch) return { ok: false, error: 'Kanal bulunamadı.' };
        await ch.setParent(args.category_id, { lockPermissions: false });
        return { ok: true, message: `#${ch.name} kategoriye taşındı.` };
      }

      case 'set_channel_permission': {
        const ch = guild.channels.cache.get(args.channel_id);
        if (!ch) return { ok: false, error: 'Kanal bulunamadı.' };
        const map = (v) => (v === 'allow' ? true : v === 'deny' ? false : null);
        const perms = {};
        if (args.view) perms.ViewChannel = map(args.view);
        if (args.send) perms.SendMessages = map(args.send);
        if (args.read_history) perms.ReadMessageHistory = map(args.read_history);
        await ch.permissionOverwrites.edit(args.target_id, perms, { reason: `[AI/${member.user.tag}]` });
        return { ok: true, message: `İzinler güncellendi (#${ch.name}).` };
      }

      case 'get_server_info': {
        const settings = getGuildSettings(guild.id);
        const channels = guild.channels.cache
          .filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice)
          .map((c) => `${c.id}|${c.name}|${c.type === ChannelType.GuildVoice ? 'voice' : 'text'}`);
        const roles = guild.roles.cache
          .filter((r) => r.id !== guild.id)
          .map((r) => `${r.id}|${r.name}`);
        return {
          ok: true,
          data: {
            name: guild.name,
            id: guild.id,
            ownerId: guild.ownerId,
            memberCount: guild.memberCount,
            channels: channels.slice(0, 80),
            roles: roles.slice(0, 60),
            settings,
          },
        };
      }

      case 'find_user': {
        const q = args.query.toLowerCase().replace(/^@/, '');
        await guild.members.fetch({ query: q, limit: 5 }).catch(() => {});
        const matches = guild.members.cache
          .filter((m) =>
            m.user.username.toLowerCase().includes(q) ||
            m.user.tag.toLowerCase().includes(q) ||
            (m.nickname && m.nickname.toLowerCase().includes(q)),
          )
          .first(5)
          .map((m) => ({ id: m.id, tag: m.user.tag, nickname: m.nickname }));
        return { ok: true, data: matches };
      }

      default:
        return { ok: false, error: `Bilinmeyen tool: ${name}` };
    }
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}
