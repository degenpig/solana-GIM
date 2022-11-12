# Gimmicks

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

SASS via [Bootstrap](https://getbootstrap.com/).

## Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

1. All pushes to "main" are pushed to production via Netlify, [https://app.netlify.com/sites/gimmicks/](https://app.netlify.com/sites/gimmicks/).

## Strapi

### Production

1. SSH into `159.203.8.125`
2. `cd /var/www/strapi-live.therealgimmicks.com/strapi`
3. `sudo su stonercats`
4. Update the code with `git pull origin <branch>`
5. If needed, run `npm i` to update/install dependencies
6. Run `NODE_ENV=production npm run build` to generate a production build
7. Finally, run `pm2 restart gimmicks-strapi-live` to restart the app
  1. If the app has been stopped, run `pm2 start gimmicks-strapi-live` to start it
  2. If the app has been deleted, run `pm2 start ecosystems.config.js --only gimmicks-strapi-live` to create and start it

### Staging

1. SSH into `159.203.8.125`
2. `cd /var/www/strapi-staging.therealgimmicks.com/strapi`
3. `sudo su stonercats`
4. Update the code with `git pull origin <branch>`
5. If needed, run `npm i` to update/install dependencies
6. Run `NODE_ENV=production npm run build` to generate a production build
7. Finally, run `pm2 restart gimmicks-strapi-staging` to restart the app
  1. If the app has been stopped, run `pm2 start gimmicks-strapi-staging` to start it
  2. If the app has been deleted, run `pm2 start ecosystems.config.js --only gimmicks-strapi-staging` to create and start it