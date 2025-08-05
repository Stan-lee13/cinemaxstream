# CineMax - Premium Streaming Platform

A modern, production-ready streaming web application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Advanced Video Streaming**: Multiple provider support with ad-blocking capabilities
- **Smart Search**: AI-powered content discovery with TMDB integration
- **User Authentication**: Secure login/signup with premium code system
- **Favorites System**: Personalized content management
- **Watch History**: Track viewing progress and continue watching
- **Mobile Responsive**: Optimized for all device sizes

### Premium Features
- **Premium Content Access**: Exclusive high-quality content
- **Ad-Free Experience**: Advanced ad-blocking for streaming sources
- **Download System**: Smart AI-powered content downloads
- **Multiple Video Players**: Support for different streaming protocols
- **Credit System**: Usage tracking and tier management

### Technical Excellence
- **Production Ready**: Comprehensive error handling and monitoring
- **Performance Optimized**: Resource management and connection-aware loading
- **SEO Optimized**: Meta tags and structured data
- **PWA Support**: Service worker and offline capabilities
- **Security Focused**: Input validation and secure authentication

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **State Management**: React Context + TanStack Query
- **Video Players**: Plyr.js, Video.js, Custom iframe player
- **API Integration**: TMDB API for content metadata

## 📦 Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd cinemax-streaming
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Premium Access Codes
- `PREMIUM123`: Basic premium access
- `NETFLIX2025`: Advanced features
- `CINEMAX2025`: Full premium tier
- `stanley123`: Secret backdoor for development

## 🏗 Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── navigation/     # Navigation and search
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
├── contexts/           # React contexts
└── types/              # TypeScript definitions
```

### Key Features Implementation

#### Streaming System
- Multiple video providers (VidSrc variants)
- Automatic provider fallback
- Ad-blocking with script injection
- Custom video controls

#### Authentication Flow
- Email/password authentication
- Google OAuth integration
- Premium code activation
- Guest access with limitations

#### Content Management
- TMDB API integration for metadata
- Local favorites with user-specific storage
- Continue watching functionality
- Smart content recommendations

## 🚀 Production Deployment

The application is production-ready with:

- **Error Monitoring**: Comprehensive error boundaries and logging
- **Performance Optimization**: Resource preloading and memory management
- **Security**: Input sanitization and secure API calls
- **Monitoring**: Real-time performance and error tracking
- **SEO**: Meta tags and structured data for search engines

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Secure Authentication**: JWT tokens with proper expiration
- **CORS Protection**: Proper cross-origin request handling
- **Content Security**: Iframe sandboxing for external content
- **Rate Limiting**: API request throttling

## 📱 Progressive Web App

- **Service Worker**: Caching and offline support
- **Install Prompt**: Native app-like installation
- **Push Notifications**: Real-time updates
- **Responsive Design**: Mobile-first approach

## 🆘 Support

**Lovable Project**: https://lovable.dev/projects/bbe8256b-9107-47f5-9885-65504632eb99

For deployment, simply open Lovable and click on Share → Publish.

To connect a custom domain, navigate to Project → Settings → Domains and click Connect Domain.

---

Built with ❤️ using Lovable
