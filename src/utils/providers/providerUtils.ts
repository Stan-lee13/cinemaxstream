
import { providerConfigs, SourceType } from '../streamingUtils';

export type ProviderOptions = {
  autoplay?: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary' | string;
  season?: number | null;
  episodeNum?: number | null;
};

/**
 * Get streaming URL for the content based on provider
 */
export const getStreamingUrlForProvider = (contentId: string, provider: string = 'vidsrc_xyz', options: ProviderOptions = {}): string => {
  // Provider URL construction functions
  const providers: Record<string, (id: string, opts: ProviderOptions) => string> = {
    vidsrc_xyz: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' && !isNaN(opts.season) ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' && !isNaN(opts.episodeNum) ? opts.episodeNum : '';
      
      if (type === 'movie') {
        return `https://vidsrc.xyz/embed/${type}/${id}?autoplay=${opts.autoplay ? '1' : '0'}`;
      } else {
        const seasonEpisodePath = (season !== '' && episode !== '') ? `/${season}/${episode}` : '';
        return `https://vidsrc.xyz/embed/${type}/${id}${seasonEpisodePath}?autoplay=${opts.autoplay ? '1' : '0'}`;
      }
    },
    
    vidsrc_in: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' && !isNaN(opts.season) ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' && !isNaN(opts.episodeNum) ? opts.episodeNum : '';
      const seasonEpisodePath = (season !== '' && episode !== '') ? `/${season}-${episode}` : '';
      return `https://vidsrc.in/embed/${type}/${id}${seasonEpisodePath}`;
    },
    
    vidrock_net: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' && !isNaN(opts.season) ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' && !isNaN(opts.episodeNum) ? opts.episodeNum : '';
      
      if (type === 'movie') {
        return `https://vidrock.net/movie/${id}?autoplay=${opts.autoplay ? 'true' : 'false'}&autonext=true&download=false`;
      } else {
        const seasonEpisodePath = (season !== '' && episode !== '') ? `/${season}/${episode}` : '';
        return `https://vidrock.net/tv/${id}${seasonEpisodePath}?autoplay=${opts.autoplay ? 'true' : 'false'}&autonext=true&download=false&episodeselector=true`;
      }
    }
  };
  
  // Choose best provider by content type if not specified
  if (!provider || !providers[provider]) {
    provider = 'vidsrc_xyz'; // Default fallback
  }
  
  // Choose provider function
  const providerFn = providers[provider];
  
  // Return URL
  return providerFn(contentId, options);
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSourceImpl = (provider: string): boolean => {
  const config = providerConfigs[provider as keyof typeof providerConfigs];
  return config?.type === SourceType.IFRAME;
};
