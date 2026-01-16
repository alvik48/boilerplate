cd ..

echo "Pulling updates from GIT"
git pull

echo "Installing NPM dependencies"
pnpm install

echo "Updating Prisma"
pnpm --filter backend_api run prisma:migrate:deploy
pnpm --filter backend_api run prisma:generate

echo "Building packages"
pnpm --filter "@packages/*" build

echo "Building apps"
pnpm run build

echo "Restarting apps via PM2"
pm2 restart ecosystem.config.cjs
