# Cubist Inspired Portraits

A mobile-optimized web application for creating artistic portraits by combining pre-made facial elements with freehand drawing capabilities. Built with React, TypeScript, and optimized for iOS devices.

## Features

🎨 **Creative Tools**
- Drag & drop facial elements (heads, eyes, noses, mouths, ears, misc items)
- Freehand drawing with customizable brush sizes and colors
- Element manipulation with resize/rotate handles
- Signature functionality
- Image upload capability

📱 **Mobile Optimized**
- Touch-friendly interface designed for mobile devices
- iOS-specific optimizations and PWA capabilities
- Collapsible sidebar for facial elements
- Bottom toolbar for drawing controls
- Gesture support for canvas interactions

💾 **Advanced Features**
- A4 canvas size (794px x 1123px) for print-ready artwork
- Comprehensive layers panel with visibility toggles
- Undo/redo functionality with keyboard shortcuts
- Save artwork as high-quality JPEG
- Offline capability with service worker

🔄 **State Management**
- Complete history tracking for undo/redo
- Real-time canvas state synchronization
- Element reordering and layer management
- Persistent drawing data

## Installation & Deployment

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

### Deployment to Web Hosting

This app is ready to deploy to any static hosting service:

**Recommended hosting platforms:**
- **Netlify** - Drag & drop the `dist` folder
- **Vercel** - Connect your GitHub repo
- **GitHub Pages** - Push to gh-pages branch
- **Firebase Hosting** - Use Firebase CLI
- **AWS S3** - Upload to S3 bucket with static hosting

**Build and deploy steps:**
```bash
# 1. Build the production version
npm run build

# 2. The built files will be in the 'dist' folder
# 3. Upload the entire 'dist' folder contents to your hosting provider
# 4. Configure your domain to point to the hosting service
```

### iOS PWA Installation

When users visit your website on iOS Safari:

1. **Add to Home Screen:**
   - Tap the Share button in Safari
   - Scroll down and tap "Add to Home Screen"
   - The app will install like a native iOS app

2. **PWA Features:**
   - Fullscreen app experience
   - Offline functionality
   - App icon on home screen
   - Native-like performance
   - Background updates

## Project Structure

```
├── App.tsx                 # Main application component
├── main.tsx               # App entry point with PWA setup
├── index.html             # HTML template with iOS optimizations
├── manifest.json          # PWA manifest for app installation
├── sw.js                  # Service worker for offline functionality
├── offline.html           # Offline fallback page
├── components/
│   ├── Canvas.tsx         # Main drawing canvas component
│   ├── Sidebar.tsx        # Collapsible sidebar with elements
│   ├── MobileHeader.tsx   # Top navigation with undo/redo
│   ├── DrawingTools.tsx   # Bottom toolbar with drawing controls
│   ├── LayersPanel.tsx    # Layer management interface
│   └── ui/               # Reusable UI components (buttons, inputs, etc.)
├── styles/
│   └── globals.css       # Global styles with mobile optimizations
└── vite.config.ts        # Build configuration with PWA setup
```

## iOS-Specific Features

### Touch Optimizations
- **Prevent zoom on input focus** - Maintains viewport stability
- **Touch-friendly targets** - All interactive elements are 44px minimum
- **Gesture prevention** - Disables unwanted iOS gestures during drawing
- **Safe area handling** - Respects iPhone notch and home indicator

### PWA Capabilities
- **Installable** - Users can add to home screen for app-like experience
- **Offline ready** - Core functionality works without internet
- **Background sync** - Artwork saves when connection returns
- **Push notifications** - Ready for future notification features

### Performance
- **Optimized rendering** - Efficient canvas operations for smooth drawing
- **Memory management** - Automatic cleanup to prevent crashes
- **Lazy loading** - Components load as needed
- **Image caching** - Facial elements cached for fast access

## Canvas Technical Details

- **Dimensions:** A4 size (794px × 1123px) for print compatibility
- **Layers:** Drawing layer renders on top of all elements
- **Element handling:** Head shapes fill entire canvas, other elements are resizable
- **Export format:** High-quality JPEG with white background
- **Touch handling:** Optimized for mobile drawing with pressure support

## Browser Compatibility

- **iOS Safari** 12+ (Primary target)
- **Chrome Mobile** 70+
- **Firefox Mobile** 70+
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)

## Asset Sources

Facial element images are hosted at:
```
https://cdn.jsdelivr.net/gh/Ninja4554/Cubist-images/
```

Categories include:
- `headShapes` - Full canvas head shapes
- `Eyes` - Eye variations
- `Ears` - Ear shapes
- `noses` - Nose options
- `mouths` - Mouth expressions
- `misc` - Additional decorative elements

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## License

This project is configured for web deployment with full iOS PWA capabilities. All components are optimized for mobile touch interfaces and production-ready for any domain hosting.

---

**Ready to deploy!** 🚀 Upload to your preferred hosting service and share your domain for users to create amazing cubist portraits on their mobile devices.