
import { providerConfigs, SourceType } from '../streamingUtils';

/**
 * Get streaming URL for the content based on provider
 */
export const getStreamingUrlForProvider = (contentId: string, provider: string = 'vidsrc_su', options: any = {}): string => {
  // Provider URL construction functions - only the three requested providers
  const providers: Record<string, (id: string, opts: any) => string> = {
    vidsrc_xyz: (id, opts) => 
      `https://vidsrc.xyz/embed/${id}?autoplay=${opts.autoplay ? '1' : '0'}`,
    
    vidsrc_su: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' && !isNaN(opts.season) ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' && !isNaN(opts.episodeNum) ? opts.episodeNum : '';
      const seasonEpisodePath = (season !== '' && episode !== '') ? `/season-${season}/episode-${episode}` : '';
      return `https://vidsrc.su/embed/${type}/${id}${seasonEpisodePath}`;
    },
    
    vidsrc_vip: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' && !isNaN(opts.season) ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' && !isNaN(opts.episodeNum) ? opts.episodeNum : '';
      const seasonEpisodePath = (season !== '' && episode !== '') ? `/s${season}e${episode}` : '';
      return `https://vidsrc.vip/embed/${type}/${id}${seasonEpisodePath}?autoplay=${opts.autoplay ? '1' : '0'}`;
    }
  };
  
  // Choose best provider by content type if not specified
  if (!provider || !providers[provider]) {
    provider = 'vidsrc_su'; // Default fallback
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
