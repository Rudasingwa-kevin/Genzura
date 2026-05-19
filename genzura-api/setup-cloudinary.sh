#!/bin/bash

# Cloudinary Setup Script for Genzura
# This script guides you through setting up Cloudinary for logo hosting

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           GENZURA CLOUDINARY SETUP                               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "💡 Create .env file first (copy from .env.example)"
    exit 1
fi

echo "📋 Step 1: Get Cloudinary Credentials"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "1. Sign up at: https://cloudinary.com/users/register/free"
echo "2. Go to dashboard: https://cloudinary.com/console"
echo "3. Copy your credentials (Cloud Name, API Key, API Secret)"
echo ""
echo "Press ENTER when you have your credentials ready..."
read

echo ""
echo "📝 Step 2: Enter Your Cloudinary Credentials"
echo "────────────────────────────────────────────────────────────────"
echo ""

# Prompt for Cloud Name
read -p "Cloud Name: " CLOUD_NAME
if [ -z "$CLOUD_NAME" ]; then
    echo "❌ Cloud Name is required"
    exit 1
fi

# Prompt for API Key
read -p "API Key: " API_KEY
if [ -z "$API_KEY" ]; then
    echo "❌ API Key is required"
    exit 1
fi

# Prompt for API Secret
read -sp "API Secret (hidden): " API_SECRET
echo ""
if [ -z "$API_SECRET" ]; then
    echo "❌ API Secret is required"
    exit 1
fi

echo ""
echo "✅ Credentials received!"
echo ""

# Update .env file
echo "📝 Updating .env file..."

# Check if Cloudinary credentials already exist
if grep -q "CLOUDINARY_CLOUD_NAME" .env; then
    echo "⚠️  Cloudinary credentials already in .env"
    read -p "Overwrite existing credentials? (y/n): " OVERWRITE
    if [ "$OVERWRITE" != "y" ]; then
        echo "❌ Cancelled"
        exit 0
    fi
    # Remove old credentials
    sed -i '/CLOUDINARY_CLOUD_NAME/d' .env
    sed -i '/CLOUDINARY_API_KEY/d' .env
    sed -i '/CLOUDINARY_API_SECRET/d' .env
fi

# Add new credentials
echo "" >> .env
echo "# Cloudinary Configuration" >> .env
echo "CLOUDINARY_CLOUD_NAME=$CLOUD_NAME" >> .env
echo "CLOUDINARY_API_KEY=$API_KEY" >> .env
echo "CLOUDINARY_API_SECRET=$API_SECRET" >> .env

echo "✅ .env file updated!"
echo ""

# Upload logo
echo "📤 Step 3: Upload Logo to Cloudinary"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Uploading Genzura logo to Cloudinary..."
echo ""

node upload-logo-to-cloudinary.js

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    SETUP COMPLETE! ✅                            ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Your logo is now hosted on Cloudinary CDN!"
    echo ""
    echo "Next steps:"
    echo "  1. Check .env file for LOGO_URL"
    echo "  2. Restart your server: npm run dev"
    echo "  3. Send a test email to verify"
    echo ""
    echo "📧 Test command:"
    echo "  curl -X POST http://localhost:5000/api/admin/jobs/run-expiry-check \\"
    echo "    -H \"Authorization: Bearer YOUR_TOKEN\""
    echo ""
else
    echo ""
    echo "❌ Upload failed. Please check the error above."
    echo ""
    echo "Common issues:"
    echo "  • Wrong credentials → Check Cloudinary dashboard"
    echo "  • Logo file missing → Run from genzura-api folder"
    echo "  • Network error → Check internet connection"
    echo ""
fi
