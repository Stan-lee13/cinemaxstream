import React, { useState } from 'react';
import { Download, FileText, Calendar, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuth from '@/contexts/authHooks';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ExportData: React.FC = () => {
  const { user } = useAuth();
  const { profileData } = useUserProfile();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) {
      toast.error('Please sign in to export your data');
      return;
    }

    setIsExporting(true);

    try {
      // Fetch all user data
      const [watchHistoryResult, favoritesResult, downloadRequestsResult, watchSessionsResult] = await Promise.all([
        supabase.from('user_watch_history').select('*').eq('user_id', user.id),
        supabase.from('user_favorites').select('*').eq('user_id', user.id),
        supabase.from('download_requests').select('*').eq('user_id', user.id),
        supabase.from('watch_sessions').select('*').eq('user_id', user.id)
      ]);

      // Format data in human-readable format
      let readableText = '='.repeat(60) + '\n';
      readableText += 'YOUR PERSONAL DATA EXPORT\n';
      readableText += '='.repeat(60) + '\n\n';
      
      readableText += `Export Date: ${new Date().toLocaleString()}\n`;
      readableText += `Email: ${user.email}\n`;
      readableText += `Account Created: ${new Date(user.created_at || '').toLocaleString()}\n\n`;

      // Profile Information
      readableText += '-'.repeat(60) + '\n';
      readableText += 'PROFILE INFORMATION\n';
      readableText += '-'.repeat(60) + '\n';
      readableText += `Username: ${profileData?.username || 'Not set'}\n`;
      readableText += `Role: ${profileData?.role || 'free'}\n`;
      readableText += `Subscription Tier: ${profileData?.subscription_tier || 'free'}\n`;
      readableText += `Timezone: ${profileData?.timezone || 'UTC'}\n\n`;

      // Watch History
      readableText += '-'.repeat(60) + '\n';
      readableText += 'WATCH HISTORY\n';
      readableText += '-'.repeat(60) + '\n';
      const watchHistory = watchHistoryResult.data || [];
      if (watchHistory.length > 0) {
        watchHistory.forEach((item, index) => {
          readableText += `${index + 1}. Content ID: ${item.content_id}\n`;
          readableText += `   Last Watched: ${new Date(item.last_watched).toLocaleString()}\n`;
          readableText += `   Progress: ${item.watch_position || 0} seconds\n`;
          readableText += `   Completed: ${item.completed ? 'Yes' : 'No'}\n\n`;
        });
      } else {
        readableText += 'No watch history found.\n\n';
      }

      // Favorites
      readableText += '-'.repeat(60) + '\n';
      readableText += 'FAVORITES\n';
      readableText += '-'.repeat(60) + '\n';
      const favorites = favoritesResult.data || [];
      if (favorites.length > 0) {
        favorites.forEach((item, index) => {
          readableText += `${index + 1}. Content ID: ${item.content_id}\n`;
          readableText += `   Added: ${new Date(item.created_at).toLocaleString()}\n\n`;
        });
      } else {
        readableText += 'No favorites found.\n\n';
      }

      // Download Requests
      readableText += '-'.repeat(60) + '\n';
      readableText += 'DOWNLOAD REQUESTS\n';
      readableText += '-'.repeat(60) + '\n';
      const downloads = downloadRequestsResult.data || [];
      if (downloads.length > 0) {
        downloads.forEach((item, index) => {
          readableText += `${index + 1}. ${item.content_title} (${item.content_type})\n`;
          readableText += `   Status: ${item.status}\n`;
          readableText += `   Quality: ${item.quality || 'N/A'}\n`;
          readableText += `   Requested: ${new Date(item.created_at).toLocaleString()}\n`;
          if (item.season_number) readableText += `   Season: ${item.season_number}, Episode: ${item.episode_number}\n`;
          readableText += `\n`;
        });
      } else {
        readableText += 'No download requests found.\n\n';
      }

      // Watch Sessions
      readableText += '-'.repeat(60) + '\n';
      readableText += 'WATCH SESSIONS\n';
      readableText += '-'.repeat(60) + '\n';
      const sessions = watchSessionsResult.data || [];
      if (sessions.length > 0) {
        readableText += `Total Sessions: ${sessions.length}\n`;
        readableText += `Total Watch Time: ${Math.round(sessions.reduce((acc, s) => acc + (s.total_watched_time || 0), 0) / 60)} minutes\n\n`;
        sessions.slice(0, 10).forEach((session, index) => {
          readableText += `${index + 1}. ${session.content_title || 'Unknown'}\n`;
          readableText += `   Date: ${session.session_start ? new Date(session.session_start).toLocaleString() : 'N/A'}\n`;
          readableText += `   Duration: ${Math.round((session.total_watched_time || 0) / 60)} minutes\n\n`;
        });
        if (sessions.length > 10) {
          readableText += `... and ${sessions.length - 10} more sessions\n\n`;
        }
      } else {
        readableText += 'No watch sessions found.\n\n';
      }

      readableText += '='.repeat(60) + '\n';
      readableText += 'END OF EXPORT\n';
      readableText += '='.repeat(60) + '\n';

      // Create and download text file
      const blob = new Blob([readableText], {
        type: 'text/plain'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_export_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const dataTypes = [
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Favorites',
      description: 'All movies and shows you\'ve marked as favorites'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Watch History',
      description: 'Your complete viewing history and progress'
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'Downloads',
      description: 'Records of all your download requests'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Profile Data',
      description: 'Your profile information and preferences'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Export My Data</h1>
          <p className="text-muted-foreground">
            Download a copy of all your data in JSON format for your records.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Data Export
              </CardTitle>
              <CardDescription>
                Export all your personal data including watch history, favorites, and profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {dataTypes.map((type, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="text-primary">{type.icon}</div>
                    <div>
                      <h3 className="font-medium text-white">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/20 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Export Information
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Data will be exported in human-readable text format</li>
                  <li>• File will include all your activity data</li>
                  <li>• Export is generated in real-time</li>
                  <li>• Easy to read and understand</li>
                  <li>• No personal data is shared with third parties</li>
                </ul>
              </div>

              <Button 
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full md:w-auto"
              >
                {isExporting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This export contains your personal data. Please keep the exported file secure and 
                do not share it with unauthorized parties. The export includes your viewing history, 
                preferences, and account information as stored in our system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportData;