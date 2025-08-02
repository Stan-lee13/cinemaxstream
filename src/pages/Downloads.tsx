
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import LoadingState from '@/components/LoadingState';

interface DownloadRequest {
  id: string;
  content_title: string;
  content_type: string;
  season_number?: number;
  episode_number?: number;
  year?: string;
  search_query?: string;
  nkiri_url?: string;
  download_url?: string;
  quality?: string;
  file_size?: string;
  status: string;
  error_message?: string;
  created_at: string;
}

const Downloads = () => {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDownloads();
    }
  }, [user]);

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('download_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'completed':
      case 'found':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'searching': return 'Searching...';
      case 'found': return 'Found';
      case 'completed': return 'Ready';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  if (!user) {
    return (
      <ResponsiveLayout>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400">Please sign in to view your downloads.</p>
        </div>
        <Footer />
      </ResponsiveLayout>
    );
  }

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <Navbar />
        <LoadingState message="Loading your downloads..." />
        <Footer />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Downloads</h1>
          <p className="text-gray-400">Manage your download requests and access ready files</p>
        </div>

        {downloads.length === 0 ? (
          <div className="text-center py-16">
            <Download className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Downloads Yet</h2>
            <p className="text-gray-400 mb-6">Start downloading your favorite movies and series!</p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Content
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(download.status)}
                      <h3 className="font-semibold text-white">{download.content_title}</h3>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {getStatusText(download.status)}
                      </span>
                    </div>
                    
                    {download.season_number && download.episode_number && (
                      <p className="text-sm text-gray-400 mb-1">
                        Season {download.season_number}, Episode {download.episode_number}
                      </p>
                    )}
                    
                    {download.quality && (
                      <p className="text-sm text-gray-400 mb-1">
                        Quality: {download.quality}
                      </p>
                    )}
                    
                    {download.file_size && (
                      <p className="text-sm text-gray-400 mb-1">
                        Size: {download.file_size}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {new Date(download.created_at).toLocaleDateString()} at{' '}
                      {new Date(download.created_at).toLocaleTimeString()}
                    </p>
                    
                    {download.error_message && (
                      <p className="text-sm text-red-400 mt-2">
                        Error: {download.error_message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {download.download_url && download.download_url !== download.nkiri_url && (
                      <Button
                        onClick={() => window.open(download.download_url, '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    
                    {download.nkiri_url && (
                      <Button
                        onClick={() => window.open(download.nkiri_url, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Nkiri
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </ResponsiveLayout>
  );
};

export default Downloads;
