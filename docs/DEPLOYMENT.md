# Deployment Guide

This guide covers deployment options for Interactive Astronomy Pictionary.

## 🌐 GitHub Pages (Recommended)

### Automatic Deployment
1. Fork/clone the repository
2. Enable GitHub Pages in repository settings
3. Choose "Deploy from a branch" and select `main`
4. Your game will be available at `https://yourusername.github.io/astronomy-pictionary`

### Manual Deployment
```bash
# Install gh-pages (if using npm)
npm install --save-dev gh-pages

# Deploy to GitHub Pages
npm run deploy
