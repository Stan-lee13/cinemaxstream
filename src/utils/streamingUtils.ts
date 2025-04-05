
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
    sflix: (id, _) => 
      `https://sflix.to/watch-movie/${id}`,
      
    primewire_tf: (id, _) =>
      `https://primewire.tf/watch/${id}`,
      
    fzmovies_net: (id, _) => 
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
    fmovies: (id, _) => 
      `https://fmovies.to/watch/${id}`,
      
    fmovies_net: (id, _) => 
      `https://fmovies.net/movie/${id}`,
    
    // Premium providers  
    prime_video: (id, _) => 
      `https://www.amazon.com/gp/video/detail/${id}`,

    netflix: (id, _) => 
      `https://www.netflix.com/title/${id}`,
    
    disney_plus: (id, _) => 
      `https://www.disneyplus.com/video/${id}`,
    
    hbo_max: (id, _) => 
      `https://play.hbomax.com/page/${id}`,
    
    hulu: (id, _) => 
      `https://www.hulu.com/watch/${id}`,
  };
  
  // Choose best provider by content type if not specified
  if (!provider) {
    const contentType = options.contentType || 'movie';
    if (contentType === 'movie') {
      provider = 'vidsrc_in';
    } else if (contentType === 'series' || contentType === 'anime') {
      provider = 'vidsrc_xyz';
    }
  }
  
  // Choose provider function or fallback
  const providerFn = providers[provider] || providers.vidsrc_xyz;
  
  // Return URL
  return providerFn(contentId, options);
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
      
    standard: (id, quality) =>
      `https://api.example.com/download/${id}?quality=${quality}`
  };
  
  // Distribute between providers based on quality
  let provider = 'standard';
  if (['4k', '1080p'].includes(quality)) {
    provider = 'filemoon';
  } else if (quality === '720p') {
    provider = 'streamtape';
  } else {
    provider = 'vidcloud';
  }
  
  return providers[provider](contentId, quality);
};

/**
 * Get trailer URL for the content 
 * Uses YouTube API to fetch trailer
 */
export const getTrailerUrl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  try {
    // In a real implementation, we would fetch from TMDB API
    const trailerBaseUrl = 'https://www.youtube.com/embed/';
    
    // Mock API request - in a real implementation this would use TMDB API
    const mockTrailerKeys: Record<string, string> = {
      '127532': 'dQw4w9WgXcQ', // Default example
      '634649': 'JfVOs4VSpmA', // Spider-Man: No Way Home
      '505642': '8YjFbMbfXaQ', // Black Panther: Wakanda Forever
      '1124620': 'UIHx43DVdk', // Silent Night
      '906126': 'X4d_v-HyR4o'  // Godzilla x Kong
    };
    
    // Return either the mapped trailer key or a default
    const trailerKey = mockTrailerKeys[contentId] || contentId;
    return `${trailerBaseUrl}${trailerKey}`;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return `https://www.youtube.com/embed/dQw4w9WgXcQ`; // Fallback trailer
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
