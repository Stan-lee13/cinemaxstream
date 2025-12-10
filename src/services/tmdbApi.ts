import { toast } from "sonner";
import { getImageUrl, normalizeContentType } from "@/utils/urlUtils";
import { ContentItem, Season, Episode } from "@/types/content";
import { getTrailerUrlImpl } from "@/utils/providers/trailerProviders";

// Re-export for compatibility with other modules
export type { ContentItem } from "@/types/content";

// Import from production-ready API
import { 
  tmdbApi as productionTmdbApi, 
  searchContent as productionSearchContent,
  getNewReleases as productionGetNewReleases,
  getTopRated as productionGetTopRated,
  getContentDetails as productionGetContentDetails,
  getSimilarContent as productionGetSimilarContent
} from './tmdbApiProduction';

// Export the production-ready functions
export const tmdbApi = productionTmdbApi;
export const searchContent = productionSearchContent;
export const getNewReleases = productionGetNewReleases;
export const getTopRated = productionGetTopRated;
export const getContentDetails = productionGetContentDetails;
export const getSimilarContent = productionGetSimilarContent;