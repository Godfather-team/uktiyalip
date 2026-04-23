// Keep-alive server for Replit
// Developed by Sxy.com | Sxyware

import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Sxyware',
    developer: 'Sxy.com',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export function keepAlive() {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KeepAlive] Server running on port ${PORT}`);
  });
}
