# StreamVibe - Premium Streaming Platform

A modern, production-ready streaming platform built with React, TypeScript, and Supabase.

## 🚀 Production Features

### Core Functionality
- **Streaming**: Multi-provider video streaming with ad-blocking technology
- **Authentication**: Secure user authentication with Pro plan support
- **Content Discovery**: Advanced search and personalized recommendations
- **Download System**: Smart download management for offline viewing
- **Mobile-First**: Fully responsive design optimized for all devices

### Security & Performance
- **Production Security**: Content Security Policy, XSS protection, rate limiting
- **Error Monitoring**: Comprehensive error tracking and reporting system
- **Performance Optimization**: Core Web Vitals monitoring, lazy loading, caching
- **Type Safety**: Full TypeScript implementation with production-grade type definitions

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Video Players**: Plyr, Video.js with custom iframe handling
- **State Management**: React Query, Context API
- **Build Tools**: Vite, ESLint, TypeScript

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]
cd streamvibe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Setup
1. Create a new Supabase project
2. Run the database migrations from `supabase/migrations/`
3. Configure authentication providers in the Supabase dashboard
4. Set up RLS policies for secure data access

## 🎯 Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Security policies tested
- [ ] Performance optimizations enabled
- [ ] Error monitoring configured

### Build Commands
```bash
# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Preview production build
npm run preview
```

## 🔐 Security Features

### Authentication
- Email/password authentication
- Google OAuth integration
- Pro tier access control
- Guest access with limited features

### Premium Codes
- `Stanley123.` - Full Pro access
- Custom promo code system for marketing campaigns

### Content Security
- Multi-provider streaming sources (vidsrc.xyz, vidsrc.su, vidsrc.vip)
- Advanced ad-blocking technology
- Secure iframe sandboxing
- Rate limiting and abuse prevention

## 📊 Analytics & Monitoring

### Performance Metrics
- Core Web Vitals (LCP, FID, CLS)
- Page load times and user interactions
- Error rates and crash reporting
- User engagement analytics

### Error Handling
- Production-grade error boundaries
- Comprehensive logging system
- Automatic error reporting
- User-friendly error messages

## 🎮 Features

### Content Management
- **Movies & TV Shows**: Comprehensive catalog with TMDB integration
- **Anime**: Dedicated anime section with specialized content
- **Documentaries**: Curated documentary collection
- **Sports**: Sports content and live events

### User Experience
- **Personalized Recommendations**: AI-powered content suggestions
- **Continue Watching**: Resume playback from where you left off
- **Favorites**: Save and organize your favorite content
- **Download Queue**: Manage offline content efficiently

### Video Streaming
- **Multi-Quality**: Auto-adaptive quality based on connection
- **Multiple Sources**: Fallback providers for maximum availability
- **Ad-Free Experience**: Advanced ad-blocking technology
- **Mobile Optimized**: Touch-friendly controls and gestures

## 🛡 Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── services/           # API services
```

### Security Architecture
- Content Security Policy (CSP) headers
- XSS protection with input sanitization
- Rate limiting for API endpoints
- Secure token management
- HTTPS-only in production

### Performance Architecture
- Code splitting and lazy loading
- Image optimization and lazy loading
- Service worker for caching
- Bundle optimization
- CDN integration for static assets

## 🚨 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript configuration: `npm run type-check`
- Verify environment variables are set correctly

**Streaming Issues**
- Check if streaming providers are accessible
- Verify ad-blocking is not interfering
- Test with different video sources

**Authentication Problems**
- Verify Supabase configuration
- Check OAuth provider settings
- Ensure redirectUrls are configured

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev

# View production logs
npm run logs:production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Maintain 90%+ test coverage
- Use semantic commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Production Ready

This application is fully production-ready with:
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ Mobile responsiveness
- ✅ Scalable architecture
- ✅ Type safety throughout
- ✅ Production monitoring
- ✅ Automated testing capabilities

---

**StreamVibe** - Experience entertainment without limits.
