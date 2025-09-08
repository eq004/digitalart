#!/bin/bash

# Cubist Portraits Deployment Script
# This script builds and prepares the app for deployment

echo "🎨 Building Cubist Portraits..."

# Clean previous build
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Type checking..."
npm run type-check

if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Please fix TypeScript errors."
  exit 1
fi

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Check the errors above."
  exit 1
fi

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Build directory not found!"
  exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "🚀 Deployment options:"
echo "1. Drag the 'dist' folder to Netlify Drop: https://app.netlify.com/drop"
echo "2. Upload dist contents to your domain"
echo "3. Deploy with CLI: npx netlify-cli deploy --prod --dir=dist"
echo ""
echo "🎉 Your Cubist Portraits app is ready for deployment!"