
import { providerConfigs, SourceType } from '../streamingUtils';

/**
 * Get streaming URL for the content based on provider
 */
export const getStreamingUrlForProvider = (contentId: string, provider: string = 'vidsrc_su', options: any = {}): string => {
  // Provider URL construction functions
  const providers: Record<string, (id: string, opts: any) => string> = {
    // Main providers
    vidsrc_xyz: (id, opts) => 
      `https://vidsrc.xyz/embed/${id}?autoplay=${opts.autoplay ? '1' : '0'}`,
    
    vidsrc_pro: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://vidsrc.pro/embed/${type}?tmdb=${id}&autoplay=${opts.autoplay ? '1' : '0'}`;
    },
    
    vidsrc_wtf: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://vidsrc.wtf/embed?tmdb=${id}&type=${type}`;
    },
    
    vidsrc_in: (id, opts) => 
      `https://vidsrc.in/embed?tmdb=${id}${opts.autoplay ? '&autoplay=1' : ''}`,
      
    vidsrc_pk: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://vidsrc.pk/${type}/${id}?autoplay=${opts.autoplay ? '1' : '0'}`;
    },
    
    vidsrc_co: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://vidsrc.co/${type}/${id}`;
    },
    
    vidsrc_cc: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://vidsrc.cc/embed/${type}/${id}${opts.autoplay ? '?autoplay=1' : ''}`;
    },
    
    vidsrc_su: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : '';
      const seasonEpisodePath = (season && episode) ? `/season-${season}/episode-${episode}` : '';
      return `https://vidsrc.su/embed/${type}/${id}${seasonEpisodePath}`;
    },
    
    embed_su: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://embed.su/${type}?tmdb=${id}${opts.autoplay ? '&autoplay=1' : ''}`;
    },
    
    // Additional streaming providers
    sflix: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://sflix.to/watch-${type}/${id}`;
    },
      
    primewire_tf: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'show';
      return `https://primewire.tf/${type}/${id}`;
    },
      
    fzmovies_net: (id, opts) => 
      `https://fzmovies.net/movie/${id}`,
      
    cinemull_cc: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://cinemull.cc/embed/${type}/${id}`;
    },
    
    embedplay_me: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' ? opts.season : 1;
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : 1;
      return `https://embedplay.me/player/${type}/${id}${type === 'tv' ? `/s${season}/e${episode}` : ''}`;
    },
      
    embed_rgshows: (id, opts) => {
      const type = opts.episode ? 'show' : 'movie';
      const season = typeof opts.season === 'number' ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : '';
      const seasonEpisodePath = (season && episode) ? `&s=${season}&e=${episode}` : '';
      return `https://embed.rgshows.me/${type}?id=${id}${seasonEpisodePath}`;
    },
    
    godriveplayer: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' ? opts.season : 1;
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : 1;
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
    fmovies: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://fmovies.to/watch/${type}/${id}`;
    },
      
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

    // New and updated providers
    brightcove: (id, opts) => {
      const accountId = opts.accountId || '1234567890';
      const playerId = opts.playerId || 'default';
      return `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?videoId=${id}`;
    },
    
    ooyala: (id, opts) => {
      const playerId = opts.playerId || 'default';
      return `https://player.ooyala.com/player.html?embedCode=${id}&playerBrandingId=${playerId}`;
    },
    
    wurl: (id, opts) => 
      `https://player.wurl.com/embed/${id}`,
    
    lookmovie: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movies' : 'shows';
      return `https://lookmovie.io/embed/${type}/play/${id}`;
    },
    
    gomovies: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://gomovies-online.cam/watch-${type}/${id}${opts.episode ? `/episode-${opts.episode}` : ''}`;
    },
    
    moviecrumbs: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'show';
      return `https://moviecrumbs.net/player/${type}/${id}${opts.episode ? `/s${opts.season}/e${opts.episode}` : ''}`;
    },
    
    moviesjoy: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://moviesjoy.to/${type}/${id}${opts.episode ? `/season-${opts.season}/episode-${opts.episode}` : ''}`;
    },
    
    dopebox: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://dopebox.to/embed/${type}/${id}${opts.episode ? `/${opts.season}-${opts.episode}` : ''}`;
    },
    
    zoro: (id, opts) => 
      `https://zoro.to/watch/${id}${opts.episode ? `/episode-${opts.episode}` : ''}`,
    
    gogoanime: (id, opts) => 
      `https://gogoanime.tel/category/${id}${opts.episode ? `-episode-${opts.episode}` : ''}`,
    
    crunchyroll: (id, opts) => 
      `https://www.crunchyroll.com/watch/${id}${opts.episode ? `/${opts.episode}` : ''}`,
    
    funimation: (id, opts) => 
      `https://www.funimation.com/player/${id}/`,
      
    vidfast: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      const season = typeof opts.season === 'number' ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : '';
      const seasonEpisodePath = (season && episode) ? `/season-${season}/episode-${episode}` : '';
      return `https://vidfast.co/embed/${type}/${id}${seasonEpisodePath}`;
    },

    anilist: (id, opts) => 
      `https://anilist.co/anime/${id}${opts.episode ? `/episode/${opts.episode}` : ''}`,

    pstream: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'tv';
      return `https://pstream.net/e/${type}/${id}${opts.season && opts.episodeNum ? `/${opts.season}/${opts.episodeNum}` : ''}`;
    },

    upcloud: (id, opts) => 
      `https://upcloud.video/embed/${id}${opts.quality ? `-${opts.quality}` : ''}`,

    // Updated based on videasy.net/docs
    videasy: (id, opts) => {
      const type = opts.contentType === 'movie' ? 'movie' : 'series';
      const season = typeof opts.season === 'number' ? opts.season : '';
      const episode = typeof opts.episodeNum === 'number' ? opts.episodeNum : '';
      
      if (type === 'movie') {
        return `https://videasy.net/embed/movies/${id}?autoplay=${opts.autoplay ? '1' : '0'}`;
      } else {
        // Handle series with proper season and episode format
        return `https://videasy.net/embed/series/${id}/${season || '1'}/${episode || '1'}?autoplay=${opts.autoplay ? '1' : '0'}`;
      }
    }
  };
  
  // Choose best provider by content type if not specified
  if (!provider) {
    const contentType = options.contentType || 'movie';
    if (contentType === 'movie') {
      provider = 'vidsrc_su';
    } else if (contentType === 'series') {
      provider = 'vidsrc_su';
    } else if (contentType === 'anime') {
      provider = 'aniwatch';
    }
  }
  
  // Choose provider function or fallback
  const providerFn = providers[provider] || providers.vidsrc_su;
  
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
