// Snipe tracking - store last deleted message per channel
// Developed by Sxy.com | Sxyware

const snipeMap = new Map();

export function getSnipe(channelId) {
  return snipeMap.get(channelId) || null;
}

export default {
  name: 'messageDelete',
  once: false,
  async execute(message) {
    if (!message.guild || message.author?.bot) return;
    if (!message.content && message.attachments.size === 0) return;
    snipeMap.set(message.channel.id, {
      content: message.content || '*(içerik yok)*',
      author: {
        id: message.author.id,
        tag: message.author.tag,
        avatar: message.author.displayAvatarURL(),
      },
      attachment: message.attachments.first()?.url || null,
      time: Date.now(),
    });
    setTimeout(() => {
      const cur = snipeMap.get(message.channel.id);
      if (cur && Date.now() - cur.time >= 5 * 60 * 1000) snipeMap.delete(message.channel.id);
    }, 5 * 60 * 1000);
  },
};
