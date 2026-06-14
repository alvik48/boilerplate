cd ..

echo "Pulling updates from GIT"
git pull

echo "Installing NPM dependencies"
pnpm install

echo "Updating Prisma"
# Apply Prisma migrations and client generation for each DB
# pnpm --filter @packages/<db_name> run prisma:migrate:deploy
# pnpm --filter @packages/<db_name> run prisma:generate

echo "Building packages"
pnpm --filter "@packages/*" build

echo "Building apps"
pnpm run build

echo "Restarting apps via PM2"
pm2 restart ecosystem.config.cjs
