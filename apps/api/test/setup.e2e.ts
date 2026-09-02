process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??=
  'postgresql://audiovintage:audiovintage@localhost:5432/audiovintage';
process.env.STRIPE_SECRET_KEY = '';
process.env.STRIPE_WEBHOOK_SECRET = '';
process.env.SMTP_HOST = '';
process.env.DEV_JWT_SECRET = 'audiovintage-dev-secret-key';
