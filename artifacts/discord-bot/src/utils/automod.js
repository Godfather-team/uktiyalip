// Automod filters - link/invite/mention/caps/badwords
// Developed by Sxy.com | Sxyware

import { PermissionFlagsBits } from 'discord.js';
import { getAutomodConfig } from './database.js';
import { config } from '../config.js';

const INVITE_REGEX = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-z0-9-]+/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;

const BAD_WORDS = [
  'amk', 'aq', 'orospu', 'piç', 'göt', 'siktir', 'amına', 'amına koyayım',
  'yarrak', 'sikim', 'sikiyim', 'pezevenk', 'kahpe', 'gavat', 'ibne',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'faggot',
];

function containsBadWord(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower));
}

function capsRatio(text) {
  const letters = text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, '');
  if (letters.length < 8) return 0;
  const caps = letters.replace(/[^A-ZÇĞİÖŞÜ]/g, '').length;
  return (caps / letters.length) * 100;
}

export async function runAutomod(message) {
  if (!message.guild || message.author.bot) return false;
  const member = message.member;
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return false;

  const cfg = getAutomodConfig(message.guild.id);
  const content = message.content;
  let triggered = null;

  if (cfg.antiInvite && INVITE_REGEX.test(content)) {
    triggered = 'Discord davet linki paylaşmak yasak.';
  } else if (cfg.antiLink && URL_REGEX.test(content) && !INVITE_REGEX.test(content)) {
    triggered = 'Bu kanalda link paylaşmak yasak.';
  } else if (cfg.antiMention && message.mentions.users.size + message.mentions.roles.size >= cfg.maxMentions) {
    triggered = `Tek mesajda ${cfg.maxMentions}+ etiket atmak yasak.`;
  } else if (cfg.antiCaps && capsRatio(content) >= cfg.capsThreshold && content.length >= 12) {
    triggered = 'Çok fazla büyük harf kullanma.';
  } else if (cfg.badWords && containsBadWord(content)) {
    triggered = 'Küfür/uygunsuz kelime kullanma.';
  }

  if (!triggered) return false;

  message.delete().catch(() => {});

  const warn = await message.channel
    .send({
      content: `<@${message.author.id}> 🚫 **${triggered}**`,
    })
    .catch(() => null);
  if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);

  return true;
}

export function getAutomodFooter() {
  return config.footer;
}
