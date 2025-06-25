
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthState';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { toast } from 'sonner';

export interface DownloadRequest {
  id: string;
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  searchQuery?: string;
  nkiriUrl?: string;
  downloadUrl?: string;
  quality?: string;
  fileSize?: string;
  status: 'pending' | 'searching' | 'found' | 'failed' | 'completed';
  errorMessage?: string;
  createdAt: string;
}

export interface DownloadResult {
  success: boolean;
  downloadLink?: string;
  nkiriUrl?: string;
  quality?: string;
  fileSize?: string;
  error?: string;
}

export const useSmartDownload = () => {
  const { user } = useAuth();
  const { userProfile, canDownload, deductDownloadCredit } = useCreditSystem();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DownloadRequest | null>(null);

  const initiateDownload = async (
    contentTitle: string,
    contentType: string,
    seasonNumber?: number,
    episodeNumber?: number,
    year?: string
  ): Promise<DownloadResult> => {
    if (!user) {
      toast.error('Please sign in to download content');
      return { success: false, error: 'Not authenticated' };
    }

    if (!canDownload()) {
      if (userProfile?.role === 'free') {
        toast.error('Downloads are only available for Pro and Premium users');
        return { success: false, error: 'Insufficient permissions' };
      } else {
        toast.error('Daily download limit reached');
        return { success: false, error: 'Daily limit exceeded' };
      }
    }

    setIsProcessing(true);

    try {
      // Create download request record
      const { data: requestData, error: requestError } = await supabase
        .from('download_requests')
        .insert({
          user_id: user.id,
          content_title: contentTitle,
          content_type: contentType,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          year: year,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      setCurrentRequest(requestData);

      // Step 1: AI Smart Search
      const searchResult = await performAISearch(requestData.id, contentTitle, contentType, seasonNumber, episodeNumber, year);
      
      if (!searchResult.success) {
        await updateRequestStatus(requestData.id, 'failed', searchResult.error);
        return searchResult;
      }

      // Step 2: Backend Scraping (Pro/Premium only)
      if (userProfile?.role !== 'free' && searchResult.nkiriUrl) {
        const scrapeResult = await performBackendScraping(requestData.id, searchResult.nkiriUrl);
        
        if (scrapeResult.success) {
          // Deduct download credit
          await deductDownloadCredit();
          await updateRequestStatus(requestData.id, 'completed');
          toast.success('Download link ready!');
          return scrapeResult;
        }
      }

      // Fallback: Just provide Nkiri URL for manual access
      await updateRequestStatus(requestData.id, 'found');
      return {
        success: true,
        nkiriUrl: searchResult.nkiriUrl,
        downloadLink: searchResult.nkiriUrl
      };

    } catch (error) {
      console.error('Download initiation error:', error);
      toast.error('Failed to process download request');
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
      setCurrentRequest(null);
    }
  };

  const performAISearch = async (
    requestId: string,
    title: string,
    type: string,
    season?: number,
    episode?: number,
    year?: string
  ): Promise<DownloadResult> => {
    try {
      await updateRequestStatus(requestId, 'searching');

      // Construct smart search query
      let searchQuery = title;
      if (season && episode) {
        searchQuery += ` Season ${season} Episode ${episode}`;
      } else if (season) {
        searchQuery += ` Season ${season}`;
      }
      if (year) {
        searchQuery += ` ${year}`;
      }

      // Update request with search query
      await supabase
        .from('download_requests')
        .update({ search_query: searchQuery })
        .eq('id', requestId);

      // Check cache first
      const { data: cachedResult } = await supabase
        .from('download_search_cache')
        .select('*')
        .eq('search_query', searchQuery)
        .single();

      if (cachedResult && cachedResult.nkiri_url) {
        return {
          success: true,
          nkiriUrl: cachedResult.nkiri_url
        };
      }

      // Call AI search function
      const { data: searchResult, error } = await supabase.functions.invoke('ai-download-search', {
        body: { searchQuery, contentType: type }
      });

      if (error) throw error;

      if (searchResult.success && searchResult.nkiriUrl) {
        // Cache the result
        await supabase
          .from('download_search_cache')
          .upsert({
            search_query: searchQuery,
            nkiri_url: searchResult.nkiriUrl,
            success_count: 1
          });

        // Update request
        await supabase
          .from('download_requests')
          .update({ nkiri_url: searchResult.nkiriUrl })
          .eq('id', requestId);

        return {
          success: true,
          nkiriUrl: searchResult.nkiriUrl
        };
      }

      return { success: false, error: 'No results found' };
    } catch (error) {
      console.error('AI search error:', error);
      return { success: false, error: error.message };
    }
  };

  const performBackendScraping = async (requestId: string, nkiriUrl: string): Promise<DownloadResult> => {
    try {
      const { data: scrapeResult, error } = await supabase.functions.invoke('nkiri-scraper', {
        body: { url: nkiriUrl, requestId }
      });

      if (error) throw error;

      if (scrapeResult.success) {
        // Update request with download details
        await supabase
          .from('download_requests')
          .update({
            download_url: scrapeResult.downloadLink,
            quality: scrapeResult.quality,
            file_size: scrapeResult.fileSize
          })
          .eq('id', requestId);

        return {
          success: true,
          downloadLink: scrapeResult.downloadLink,
          quality: scrapeResult.quality,
          fileSize: scrapeResult.fileSize
        };
      }

      return { success: false, error: scrapeResult.error };
    } catch (error) {
      console.error('Backend scraping error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, errorMessage?: string) => {
    await supabase
      .from('download_requests')
      .update({
        status,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', requestId);
  };

  return {
    initiateDownload,
    isProcessing,
    currentRequest
  };
};
