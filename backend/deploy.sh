#!/bin/bash

# Artisan Marketplace Backend Deployment Script

echo "🚀 Starting deployment for Artisan Marketplace Backend..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Check for environment variables
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure to configure environment variables."
    echo "Copy .env.example to .env and fill in your configuration."
fi

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."

# Deploy functions
echo "📤 Deploying Firebase Functions..."
firebase deploy --only functions

# Deploy Firestore rules and indexes
echo "🔒 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your API is now available at:"
echo "https://your-region-your-project-id.cloudfunctions.net/api"
echo ""
echo "📊 Monitor your functions at:"
echo "https://console.firebase.google.com/project/your-project-id/functions"
echo ""
echo "🎉 Happy coding!"