#!/bin/bash

set -e

echo "🔐 Injected environment variables:"

APP_DIR=~/apps/hustl-api

# Clone or pull latest code
if [ -d "$APP_DIR" ]; then
  echo "📂 Pulling latest code"
  cd "$APP_DIR"
  git pull origin main
else
  echo "📥 Cloning repository"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "📄 Moving environment file"
mv ~/.hustl.env "$APP_DIR"/.env

# Load NVM and PNPM (ensure path is available)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
source "$HOME/.bashrc"
source "$HOME/.profile"

echo "🏗️ Building project"
sudo apt install unzip

curl -fsSL https://bun.sh/install | bash

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

bun install
bun run build

echo "🔄 Running migrations"
bun run migrate:deploy

echo "🚀 Starting application"
pm2 list | grep -q hustl-api && pm2 restart hustl-api || pm2 start "bun run start" --name hustl-api
