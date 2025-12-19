import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Calendar, Star, Clock, ShieldCheck, Database, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '@/contexts/authHooks';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const ExportData: React.FC = () => {
  const { user } = useAuth();
  const { profileData } = useUserProfile();
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".export-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".info-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".data-type-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      color: "bg-yellow-500/10 border-yellow-500/20",
      title: 'Favorites',
      description: 'Your library of saved movies and shows'
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      color: "bg-blue-500/10 border-blue-500/20",
      title: 'Watch History',
      description: 'Comprehensive viewing log and progress'
    },
    {
      icon: <Download className="w-5 h-5 text-emerald-400" />,
      color: "bg-emerald-500/10 border-emerald-500/20",
      title: 'Downloads',
      description: 'Record of offline content requests'
    },
    {
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      color: "bg-purple-500/10 border-purple-500/20",
      title: 'Profile Data',
      description: 'Account details and preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Button>

          <div className="export-header mb-10 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-500/10 text-blue-500 mb-6 border border-blue-500/20 shadow-lg shadow-blue-900/20">
              <Database className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">
              Export Your Data
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Download a transparency report containing your personal data, preferences, and activity history in a readable format.
            </p>
          </div>

          <div className="info-card bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-1">
            <div className="p-6 md:p-8 bg-black/20 rounded-[20px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {dataTypes.map((type, index) => (
                  <div key={index} className={`data-type-item flex items-start gap-4 p-4 ${type.color} border rounded-2xl transition-transform hover:scale-[1.02]`}>
                    <div className="p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{type.title}</h3>
                      <p className="text-sm text-gray-400 leading-snug">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center bg-white/5 rounded-2xl p-6 border border-white/5">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Privacy & Security Notice
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-2 pl-1">
                    <li>• The exported file contains sensitive personal information.</li>
                    <li>• Keep this file secure and do not share it with untrusted parties.</li>
                    <li>• The data is provided in JSON-like text format for easy reading.</li>
                  </ul>
                </div>

                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full md:w-auto h-12 px-8 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-base transition-all hover:scale-105"
                >
                  {isExporting ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Data Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExportData;