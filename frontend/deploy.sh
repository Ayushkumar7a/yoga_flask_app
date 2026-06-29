#!/usr/bin/env bash

# Exit on error
set -e

# Resolve script directory and navigate to frontend/
cd "$(dirname "$0")"

echo "Building production React app..."
npm run build

echo "Navigating into build directory..."
cd dist

echo "Initializing Git repository in dist..."
git init
git checkout -B gh-pages

echo "Adding all files..."
git add .

echo "Committing deploy..."
git commit -m "Deploy to GitHub Pages"

echo "Adding remote origin..."
git remote add origin https://github.com/Ayushkumar7a/yoga_flask_app.git

echo "Force pushing to gh-pages branch..."
git push -f origin gh-pages

echo "Deployment complete! Your app should be live shortly at:"
echo "https://Ayushkumar7a.github.io/yoga_flask_app/"
