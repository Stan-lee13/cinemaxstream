
// Mock provider data
const PROVIDERS = [
  { id: "provider1", name: "Secure Stream", contentType: "all" },
  { id: "provider2", name: "Premium CDN", contentType: "movies" },
  { id: "provider3", name: "Series Stream", contentType: "series" },
];

// Mock streaming URLs for different providers
const STREAMING_URLS = {
  provider1: {
    movies: {
      "movie-1": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8",
      "movie-2": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "movie-3": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    series: {
      "series-1": {
        "s1e1": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "s1e2": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      "series-2": {
        "s1e1": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "s1e2": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      }
    }
  },
  provider2: {
    movies: {
      "movie-1": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "movie-2": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "movie-3": "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
    }
  },
  provider3: {
    series: {
      "series-1": {
        "s1e1": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "s1e2": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      "series-2": {
        "s1e1": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "s1e2": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      }
    }
  }
};

// Fallback URLs if specific content is not found
const FALLBACK_URLS = {
  movies: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  series: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
};

// Get available streaming providers for a content
export const getAvailableProviders = (contentId: string, contentType: string) => {
  // Return all applicable providers for this content type
  return PROVIDERS.filter(provider => 
    provider.contentType === 'all' || provider.contentType === contentType
  );
};

// Determine best provider based on content type
export const getBestProviderForContentType = (contentType: string) => {
  // Default to first provider
  if (contentType === 'movies') {
    return "provider2";  // Premium CDN optimized for movies
  } else if (contentType === 'series') {
    return "provider3";  // Series Stream optimized for series
  }
  return "provider1";    // Default secure stream for all content
};

// Get streaming URL based on content info and provider
export const getStreamingUrl = (
  contentId: string,
  contentType: string,
  providerId: string,
  episodeId?: string,
  seasonNumber?: number,
  episodeNumber?: number
) => {
  try {
    const providerUrls = STREAMING_URLS[providerId as keyof typeof STREAMING_URLS];
    
    if (!providerUrls) {
      console.error(`Provider ${providerId} not found, using fallback`);
      return FALLBACK_URLS[contentType as keyof typeof FALLBACK_URLS];
    }
    
    if (contentType === 'movie' || contentType === 'movies') {
      const movieUrl = providerUrls.movies?.[contentId];
      if (movieUrl) return movieUrl;
    } else if (contentType === 'series' || contentType === 'tv') {
      if (episodeId) {
        const episodeUrl = providerUrls.series?.[contentId]?.[episodeId];
        if (episodeUrl) return episodeUrl;
      } else if (seasonNumber && episodeNumber) {
        // Try to construct episode ID from season and episode numbers
        const constructedEpisodeId = `s${seasonNumber}e${episodeNumber}`;
        const episodeUrl = providerUrls.series?.[contentId]?.[constructedEpisodeId];
        if (episodeUrl) return episodeUrl;
      }
    }
    
    // If we didn't find a matching URL, use the fallback
    console.error(`Content not found for ${contentId} with provider ${providerId}, using fallback`);
    return FALLBACK_URLS[contentType as keyof typeof FALLBACK_URLS];
    
  } catch (error) {
    console.error("Error getting streaming URL:", error);
    return FALLBACK_URLS[contentType as keyof typeof FALLBACK_URLS];
  }
};

// Track streaming activity for analytics
export const trackStreamingActivity = (
  contentId: string,
  userId: string,
  timestamp: number,
  episodeId?: string
) => {
  console.log(`Tracking: user ${userId} watched ${contentId} ${episodeId ? `episode ${episodeId}` : ''} at ${timestamp}s`);
  // In a real app this would make an API call to record the activity
};

// Mark content as complete
export const markContentAsComplete = (
  contentId: string,
  userId: string,
  episodeId?: string
) => {
  console.log(`Marking as complete: user ${userId} finished ${contentId} ${episodeId ? `episode ${episodeId}` : ''}`);
  // In a real app this would make an API call to mark as complete
};

// Function to start screen recording
export const startRecording = (videoElement: HTMLVideoElement, fileName: string) => {
  // Using MediaRecorder API to record video
  try {
    // Create a new MediaStream from the video element
    const stream = (videoElement as any).captureStream();
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = `${fileName}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
    };
    
    recorder.start();
    console.log('Recording started');
    
    // Return function to stop recording
    return () => {
      recorder.stop();
      console.log('Recording stopped');
    };
  } catch (error) {
    console.error('Error starting recording:', error);
    return () => {}; // Return empty function if recording fails
  }
};
