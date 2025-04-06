
/**
 * Streaming utility functions
 */

// Define quality options for streaming and downloading
export const QUALITY_OPTIONS = [
  { value: "4k", label: "4K (2160p)" },
  { value: "1080p", label: "Full HD (1080p)" },
  { value: "720p", label: "HD (720p)" },
  { value: "480p", label: "SD (480p)" },
  { value: "360p", label: "Low (360p)" }
];

// Define source types for different providers
export enum SourceType {
  DIRECT = 'direct',  // Direct video URL (mp4, etc)
  IFRAME = 'iframe',  // Embed via iframe
  HLS = 'hls',        // HLS streaming (.m3u8)
  DASH = 'dash'       // DASH streaming (.mpd)
}

// Provider configuration
export const providerConfigs = {
  // Main providers
  vidsrc_xyz: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  vidsrc_pro: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  vidsrc_wtf: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  vidsrc_in: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie']
  },
  embed_su: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  sflix: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  primewire_tf: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  fzmovies_net: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie']
  },
  embed_rgshows: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  godriveplayer: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  aniwatch: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['anime']
  },
  fmovies: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  fmovies_net: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  // Premium providers
  netflix: { 
    type: SourceType.IFRAME,
    isPremium: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  prime_video: { 
    type: SourceType.IFRAME,
    isPremium: true,
    contentTypes: ['movie', 'series']
  },
  disney_plus: { 
    type: SourceType.IFRAME,
    isPremium: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  hbo_max: { 
    type: SourceType.IFRAME,
    isPremium: true,
    contentTypes: ['movie', 'series']
  },
  hulu: { 
    type: SourceType.IFRAME,
    isPremium: true,
    contentTypes: ['series']
  },
  // Download providers as streaming
  filemoon: { 
    type: SourceType.DIRECT,
    supportsFullHD: true,
    contentTypes: ['movie', 'series'],
    supportsDownload: true
  },
  streamtape: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series'],
    supportsDownload: true
  },
  vidcloud: { 
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series', 'anime'],
    supportsDownload: true
  },
  // Additional streaming providers
  lookmovie: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  gomovies: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  moviecrumbs: {
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['movie', 'series']
  },
  moviesjoy: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  dopebox: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series']
  },
  zoro: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['anime']
  },
  gogoanime: {
    type: SourceType.IFRAME,
    supportsFullHD: false,
    contentTypes: ['anime']
  },
  crunchyroll: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    isPremium: true,
    contentTypes: ['anime']
  },
  funimation: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    isPremium: true,
    contentTypes: ['anime']
  }
};

/**
 * Get streaming URL for the content
 */
export const getStreamingUrl = (contentId: string, provider: string = 'vidsrc_xyz', options: any = {}): string => {
  // Default providers
  const providers: Record<string, (id: string, opts: any) => string> = {
    // Main providers
    vidsrc_xyz: (id, opts) => 
      `https://vidsrc.xyz/embed/${id}?autoplay=${opts.autoplay ? '1' : '0'}`,
    
    vidsrc_pro: (id, opts) =>
      `https://vidsrc.pro/embed/movie?tmdb=${id}&autoplay=${opts.autoplay ? '1' : '0'}`,
    
    vidsrc_wtf: (id, opts) =>
      `https://vidsrc.wtf/embed?tmdb=${id}`,
    
    vidsrc_in: (id, opts) => 
      `https://vidsrc.in/embed?tmdb=${id}${opts.autoplay ? '&autoplay=1' : ''}`,
    
    embed_su: (id, opts) =>
      `https://embed.su/movie?tmdb=${id}${opts.autoplay ? '&autoplay=1' : ''}`,
    
    // Additional streaming providers
    sflix: (id, opts) => 
      `https://sflix.to/watch-movie/${id}`,
      
    primewire_tf: (id, opts) =>
      `https://primewire.tf/watch/${id}`,
      
    fzmovies_net: (id, opts) => 
      `https://fzmovies.net/movie/${id}`,
      
    embed_rgshows: (id, opts) => {
      const type = opts.episode ? 'show' : 'movie';
      return `https://embed.rgshows.me/${type}?id=${id}${opts.episode ? `&s=${opts.season}&e=${opts.episodeNum}` : ''}`;
    },
    
    godriveplayer: (id, opts) => {
      const type = opts.episode ? 'tv' : 'movie';
      const season = opts.season || '1';
      const episode = opts.episodeNum || '1';
      return `https://database.gdriveplayer.us/player.php?type=${type}&tmdb=${id}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}`;
    },
    
    // Anime specific providers
    aniwatch: (id, opts) => {
      // Construct URL for anime content
      let url = `https://aniwatch.to/watch/${id}`;
      if (opts.episode) {
        url += `/ep-${opts.episode}`;
      }
      return url;
    },
    
    // Movie/Series providers
    fmovies: (id, opts) => 
      `https://fmovies.to/watch/${id}`,
      
    fmovies_net: (id, opts) => 
      `https://fmovies.net/movie/${id}`,
    
    // Premium providers  
    prime_video: (id, opts) => 
      `https://www.amazon.com/gp/video/detail/${id}`,

    netflix: (id, opts) => 
      `https://www.netflix.com/title/${id}`,
    
    disney_plus: (id, opts) => 
      `https://www.disneyplus.com/video/${id}`,
    
    hbo_max: (id, opts) => 
      `https://play.hbomax.com/page/${id}`,
    
    hulu: (id, opts) => 
      `https://www.hulu.com/watch/${id}`,
      
    // Download providers that also support streaming
    filemoon: (id, opts) => 
      `https://filemoon.in/e/${id}?quality=${opts.quality || '1080p'}`,
      
    streamtape: (id, opts) => 
      `https://streamtape.com/e/${id}/`,
      
    vidcloud: (id, opts) => 
      `https://vidcloud.stream/player?id=${id}`,

    // Additional providers
    lookmovie: (id, opts) => {
      const type = opts.episode ? 'shows' : 'movies';
      return `https://lookmovie.io/embed/${type}/play/${id}`;
    },
    
    gomovies: (id, opts) => 
      `https://gomovies-online.cam/watch-movie/${id}${opts.episode ? `/episode-${opts.episode}` : ''}`,
    
    moviecrumbs: (id, opts) => 
      `https://moviecrumbs.net/player/${id}${opts.episode ? `/s${opts.season}/e${opts.episode}` : ''}`,
    
    moviesjoy: (id, opts) => 
      `https://moviesjoy.to/movie/${id}${opts.episode ? `/season-${opts.season}/episode-${opts.episode}` : ''}`,
    
    dopebox: (id, opts) => 
      `https://dopebox.to/embed/${id}${opts.episode ? `/${opts.season}-${opts.episode}` : ''}`,
    
    zoro: (id, opts) => 
      `https://zoro.to/watch/${id}${opts.episode ? `/episode-${opts.episode}` : ''}`,
    
    gogoanime: (id, opts) => 
      `https://gogoanime.tel/category/${id}${opts.episode ? `-episode-${opts.episode}` : ''}`,
    
    crunchyroll: (id, opts) => 
      `https://www.crunchyroll.com/watch/${id}${opts.episode ? `/${opts.episode}` : ''}`,
    
    funimation: (id, opts) => 
      `https://www.funimation.com/player/${id}/`
  };
  
  // Choose best provider by content type if not specified
  if (!provider) {
    const contentType = options.contentType || 'movie';
    if (contentType === 'movie') {
      provider = 'vidsrc_in';
    } else if (contentType === 'series') {
      provider = 'vidsrc_xyz';
    } else if (contentType === 'anime') {
      provider = 'aniwatch';
    }
  }
  
  // Choose provider function or fallback
  const providerFn = providers[provider] || providers.vidsrc_xyz;
  
  // Return URL
  return providerFn(contentId, options);
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSource = (provider: string): boolean => {
  const config = providerConfigs[provider as keyof typeof providerConfigs];
  return config?.type === SourceType.IFRAME;
};

/**
 * Get download URL for the content
 */
export const getDownloadUrl = (contentId: string, quality: string = '1080p'): string => {
  // Download providers
  const providers: Record<string, (id: string, quality: string) => string> = {
    filemoon: (id, quality) =>
      `https://filemoon.in/d/${id}?quality=${quality}`,
      
    streamtape: (id, quality) =>
      `https://streamtape.com/v/${id}/${encodeURIComponent(quality)}`,
      
    vidcloud: (id, quality) =>
      `https://vidcloud.stream/download/${id}?quality=${quality}`,
    
    fzmovies_net: (id, quality) =>
      `https://fzmovies.net/download/${id}?quality=${quality}`,
      
    standard: (id, quality) =>
      `https://api.example.com/download/${id}?quality=${quality}`
  };
  
  // Distribute between providers based on quality
  let provider = 'standard';
  if (['4k', '1080p'].includes(quality)) {
    provider = 'filemoon';
  } else if (quality === '720p') {
    provider = 'streamtape';
  } else if (quality === '480p') {
    provider = 'fzmovies_net';
  } else {
    provider = 'vidcloud';
  }
  
  return providers[provider](contentId, quality);
};

/**
 * Get trailer URL from YouTube API
 */
export const getTrailerUrl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  try {
    // Real API call would go here, using the YouTube Data API
    // For now simulating with a fetch to a mock service and fallback keys
    
    // First, try to get from TMDB (in a real implementation)
    try {
      const tmdbApiKey = 'mock_key'; // In a real app, this would be the TMDB API key
      const movieOrTv = contentType === 'movie' ? 'movie' : 'tv';
      const url = `https://api.themoviedb.org/3/${movieOrTv}/${contentId}/videos?api_key=${tmdbApiKey}`;
      
      // In a real implementation, we would fetch from this URL
      // const response = await fetch(url);
      // const data = await response.json();
      
      // Simulate a response with our mock data
      const mockTrailerKeys: Record<string, string> = {
        '127532': 'dQw4w9WgXcQ', // Default example
        '634649': 'JfVOs4VSpmA', // Spider-Man: No Way Home
        '505642': '8YjFbMbfXaQ', // Black Panther: Wakanda Forever
        '1124620': 'UIHx43DVdk',  // Silent Night
        '906126': 'X4d_v-HyR4o',  // Godzilla x Kong
        '119495': 'Frd8WJ5FxHA',  // Wednesday
        '950387': 'UEBkR-L8OL8'   // Oppenheimer
      };
      
      const trailerKey = mockTrailerKeys[contentId] || 'dQw4w9WgXcQ';
      return trailerKey;
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      // Fallback to default key
      return 'dQw4w9WgXcQ';
    }
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return 'dQw4w9WgXcQ'; // Fallback trailer
  }
};

/**
 * Start recording for live content
 */
export const startRecording = async (options = {}): Promise<MediaStream | null> => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      console.log('Screen recording started:', stream);
      return stream;
    } else {
      throw new Error('Screen recording not supported');
    }
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
};

/**
 * Get a list of all available streaming services
 */
export const getAllStreamingServices = () => {
  return Object.entries(providerConfigs).map(([id, config]) => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    isPremium: config.isPremium || false,
    supportsDownload: config.supportsDownload || false,
    contentTypes: config.contentTypes || ['movie'],
    supportsFullHD: config.supportsFullHD !== undefined ? config.supportsFullHD : false
  }));
};

/**
 * Generate correct runtime for content based on content type
 */
export const getContentRuntime = (contentType: string, episodeNumber?: number): string => {
  // Default runtimes based on content type
  const defaultRuntimes: Record<string, number> = {
    'movie': 120, // 2 hours average
    'series': 45, // 45 minutes average
    'anime': 24,  // 24 minutes average
  };
  
  const minutes = defaultRuntimes[contentType] || 90;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};
