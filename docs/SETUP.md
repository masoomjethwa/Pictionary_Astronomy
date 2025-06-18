# Setup Guide

This guide covers how to set up Interactive Astronomy Pictionary for development or local hosting.

## Quick Start

### For Players
1. Visit the live demo: **[Play Now](https://yourusername.github.io/interactive-astronomy-pictionary)**
2. No installation required - works in any modern web browser

### For Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/interactive-astronomy-pictionary.git
cd interactive-astronomy-pictionary

# Serve locally
python3 -m http.server 5000

# Open in browser
open http://localhost:5000
```

## Development Environment

### Prerequisites
- **Web Browser**: Chrome 60+, Firefox 55+, Safari 12+, or Edge 79+
- **Local Server** (optional): Python 3.x, Node.js, or any HTTP server
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Project Structure
```
interactive-astronomy-pictionary/
├── index.html              # Main game file
├── css/
│   └── style.css           # Game styling
├── js/
│   └── script.js           # Game logic
├── docs/                   # Documentation
├── assets/                 # Screenshots and media
├── .github/                # GitHub templates
└── README.md               # This file
```

### File Dependencies
- **No build process required** - pure HTML/CSS/JavaScript
- **External dependencies**: Font Awesome icons (CDN)
- **No npm installation needed** for basic usage

## Local Server Options

### Python (Recommended)
```bash
# Python 3.x
python3 -m http.server 5000

# Python 2.x (if needed)
python -m SimpleHTTPServer 5000
```

### Node.js
```bash
# Install a simple server
npm install -g http-server

# Serve files
http-server -p 5000
```

### PHP
```bash
php -S localhost:5000
```

### Other Options
- **Live Server** (VS Code extension)
- **Xampp/Wamp/Mamp** for local development
- **Browser file:// protocol** (limited functionality)

## Configuration

### Browser Settings
- **JavaScript**: Must be enabled
- **Local Storage**: Required for game saves
- **Cookies**: Not required
- **Internet**: Only needed for initial load and Font Awesome icons

### Mobile Development
- **Chrome DevTools**: Use device emulation
- **Real Device Testing**: Access via local network IP
- **Touch Events**: Fully supported natively

## Contributing Setup

### Fork and Clone
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/yourusername/interactive-astronomy-pictionary.git
cd interactive-astronomy-pictionary

# Add upstream remote
git remote add upstream https://github.com/original/interactive-astronomy-pictionary.git
```

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test locally
python3 -m http.server 5000

# Commit changes
git add .
git commit -m "Add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Code Style
- **HTML**: Semantic markup, proper indentation
- **CSS**: BEM methodology preferred, mobile-first
- **JavaScript**: ES6+, clear variable names, comments for complex logic
- **Files**: Unix line endings (LF), UTF-8 encoding

## Testing

### Manual Testing Checklist
- [ ] Game loads without errors
- [ ] Teams can be added and removed
- [ ] Cards draw correctly from all categories
- [ ] Timer functions properly
- [ ] Board movement works
- [ ] Game saves and loads state
- [ ] Responsive design on different screen sizes
- [ ] Keyboard navigation works
- [ ] Print functionality works

### Browser Testing
Test on multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablets

### Accessibility Testing
- **Screen readers**: NVDA, JAWS, VoiceOver
- **Keyboard only**: Tab navigation, Enter/Space activation
- **High contrast**: Windows high contrast mode
- **Zoom**: 200% browser zoom compatibility

## Deployment

### GitHub Pages (Recommended)
1. **Enable Pages**: Repository Settings → Pages
2. **Source**: Deploy from branch `main`
3. **Custom domain** (optional): Configure in settings
4. **Automatic deployment**: Push to main branch

### Other Hosting Options
- **Netlify**: Drag and drop deployment
- **Vercel**: Git integration and instant deployment
- **Firebase Hosting**: Google's hosting platform
- **Traditional web hosting**: Upload files via FTP

### Build Process
No build process required - files can be deployed as-is:
- **HTML**: Single file with all game content
- **CSS**: Standalone stylesheet
- **JavaScript**: Single script file
- **Assets**: Images and documentation

## Troubleshooting

### Common Issues

#### Game Won't Load
- **Check console**: F12 → Console for JavaScript errors
- **Clear cache**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Try different browser**: Rule out browser-specific issues

#### Local Server Issues
- **Port already in use**: Try different port (e.g., 8000, 3000)
- **Firewall blocking**: Check firewall settings
- **Python not found**: Install Python or use alternative server

#### Mobile Issues
- **Touch not working**: Ensure proper viewport meta tag
- **Performance slow**: Test on actual device, not just emulator
- **Layout broken**: Check CSS media queries

### Getting Help
- **GitHub Issues**: Report bugs and get support
- **Documentation**: Check docs/ folder for guides
- **Community**: Join discussions for peer support

## Performance Optimization

### Local Development
- **Browser caching**: Use developer tools to disable cache during development
- **Console monitoring**: Watch for performance warnings
- **Network throttling**: Test on slower connections

### Production Optimization
- **Image optimization**: Compress screenshots and assets
- **CSS minification**: Optional for better load times
- **JavaScript minification**: Optional for production deployment
- **CDN usage**: Font Awesome already uses CDN

## Security Considerations

### Local Development
- **Local server only**: Don't expose development server publicly
- **HTTPS not required**: For local development
- **No sensitive data**: Game uses only local storage

### Production Deployment
- **HTTPS recommended**: For production websites
- **Content Security Policy**: Consider adding CSP headers
- **Regular updates**: Keep documentation and links current

---

**Need help with setup? Check our [FAQ](docs/FAQ.md) or [create an issue](https://github.com/yourusername/interactive-astronomy-pictionary/issues).**