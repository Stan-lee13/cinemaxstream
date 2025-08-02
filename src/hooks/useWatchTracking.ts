
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreditSystem } from './useCreditSystem';

export interface WatchEvent {
  action: 'play' | 'pause' | 'seek' | 'ended';
  time: number;
  timestamp: string;
}

export interface WatchSession {
  id?: string;
  user_id: string;
  content_id: string;
  content_title?: string;
  content_duration?: number;
  session_start: string;
  session_end?: string;
  total_watched_time: number;
  watch_events: WatchEvent[];
  credit_deducted: boolean;
}

export const useWatchTracking = () => {
  const { user } = useAuth();
  const { deductStreamingCredit } = useCreditSystem();
  const [currentSession, setCurrentSession] = useState<WatchSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchTimeRef = useRef(0);
  const lastPlayTimeRef = useRef(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start tracking a new watch session
  const startWatchSession = useCallback(async (
    contentId: string,
    contentTitle?: string,
    estimatedDuration?: number
  ) => {
    if (!user) return null;

    try {
      // Get content duration from AI if not provided
      let contentDuration = estimatedDuration;
      if (!contentDuration && contentTitle) {
        contentDuration = await getContentDurationFromAI(contentTitle);
      }

      const session: WatchSession = {
        user_id: user.id,
        content_id: contentId,
        content_title: contentTitle,
        content_duration: contentDuration,
        session_start: new Date().toISOString(),
        total_watched_time: 0,
        watch_events: [],
        credit_deducted: false
      };

      // Save session to database - convert watch_events to JSONB format
      const { data, error } = await supabase
        .from('watch_sessions')
        .insert({
          ...session,
          watch_events: JSON.stringify(session.watch_events)
        })
        .select()
        .single();

      if (error) throw error;

      // Transform back to our interface with proper type handling
      const sessionData: WatchSession = {
        ...data,
        watch_events: Array.isArray(data.watch_events) 
          ? (data.watch_events as unknown as WatchEvent[])
          : JSON.parse(data.watch_events as string || '[]') as WatchEvent[]
      };

      setCurrentSession(sessionData);
      setIsTracking(true);
      watchTimeRef.current = 0;
      lastPlayTimeRef.current = Date.now();

      return sessionData;
    } catch (error) {
      console.error('Error starting watch session:', error);
      return null;
    }
  }, [user]);

  // Add watch event
  const addWatchEvent = useCallback(async (action: WatchEvent['action'], currentTime: number) => {
    if (!currentSession || !isTracking) return;

    const now = Date.now();
    const event: WatchEvent = {
      action,
      time: currentTime,
      timestamp: new Date().toISOString()
    };

    // Calculate watched time for play/pause cycles
    if (action === 'pause' && lastPlayTimeRef.current > 0) {
      const watchedDuration = (now - lastPlayTimeRef.current) / 1000;
      watchTimeRef.current += watchedDuration;
    } else if (action === 'play') {
      lastPlayTimeRef.current = now;
    } else if (action === 'ended') {
      if (lastPlayTimeRef.current > 0) {
        const watchedDuration = (now - lastPlayTimeRef.current) / 1000;
        watchTimeRef.current += watchedDuration;
      }
    }

    const updatedEvents = [...currentSession.watch_events, event];
    const updatedSession = {
      ...currentSession,
      watch_events: updatedEvents,
      total_watched_time: Math.round(watchTimeRef.current)
    };

    setCurrentSession(updatedSession);

    // Update database
    try {
      await supabase
        .from('watch_sessions')
        .update({
          watch_events: JSON.stringify(updatedEvents),
          total_watched_time: Math.round(watchTimeRef.current)
        })
        .eq('id', currentSession.id);
    } catch (error) {
      console.error('Error updating watch session:', error);
    }

    // Check if we should deduct credit on ended
    if (action === 'ended') {
      await checkAndDeductCredit(updatedSession);
    }
  }, [currentSession, isTracking]);

  // Check if session qualifies for credit deduction using AI
  const checkAndDeductCredit = useCallback(async (session: WatchSession) => {
    if (session.credit_deducted) return;

    try {
      // Analyze session with AI
      const shouldDeduct = await analyzeWatchSessionWithAI(session);
      
      if (shouldDeduct) {
        const success = await deductStreamingCredit();
        if (success) {
          // Update session as credit deducted
          await supabase
            .from('watch_sessions')
            .update({ credit_deducted: true })
            .eq('id', session.id);
          
          setCurrentSession(prev => prev ? { ...prev, credit_deducted: true } : null);
        }
      }
    } catch (error) {
      console.error('Error analyzing watch session:', error);
    }
  }, [deductStreamingCredit]);

  // End watch session
  const endWatchSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      const endTime = new Date().toISOString();
      const finalWatchTime = Math.round(watchTimeRef.current);

      await supabase
        .from('watch_sessions')
        .update({
          session_end: endTime,
          total_watched_time: finalWatchTime
        })
        .eq('id', currentSession.id);

      // Check for credit deduction one final time
      await checkAndDeductCredit({
        ...currentSession,
        session_end: endTime,
        total_watched_time: finalWatchTime
      });

      setCurrentSession(null);
      setIsTracking(false);
      watchTimeRef.current = 0;
      lastPlayTimeRef.current = 0;

      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error ending watch session:', error);
    }
  }, [currentSession, checkAndDeductCredit]);

  return {
    currentSession,
    isTracking,
    startWatchSession,
    addWatchEvent,
    endWatchSession
  };
};

// Get content duration from AI
const getContentDurationFromAI = async (title: string): Promise<number | undefined> => {
  try {
    const response = await supabase.functions.invoke('get-content-duration', {
      body: { title }
    });

    if (response.error) return undefined;
    
    return response.data?.duration;
  } catch (error) {
    console.error('Error getting content duration from AI:', error);
    return undefined;
  }
};

// Analyze watch session with AI
const analyzeWatchSessionWithAI = async (session: WatchSession): Promise<boolean> => {
  try {
    // Basic rule-based check first
    const watchedMinutes = session.total_watched_time / 60;
    const watchedPercentage = session.content_duration 
      ? (session.total_watched_time / session.content_duration) * 100 
      : 0;

    // If watched at least 20 minutes OR 50% of content, deduct credit
    if (watchedMinutes >= 20 || watchedPercentage >= 50) {
      return true;
    }

    // Use AI for more complex analysis
    const response = await supabase.functions.invoke('analyze-watch-session', {
      body: {
        movie: {
          title: session.content_title,
          duration: session.content_duration
        },
        session: {
          events: session.watch_events,
          total_watched_time: session.total_watched_time
        }
      }
    });

    if (response.error) return false;
    
    return response.data?.shouldDeduct === 'YES';
  } catch (error) {
    console.error('Error analyzing watch session with AI:', error);
    // Fallback to basic rules
    const watchedMinutes = session.total_watched_time / 60;
    const watchedPercentage = session.content_duration 
      ? (session.total_watched_time / session.content_duration) * 100 
      : 0;
    
    return watchedMinutes >= 20 || watchedPercentage >= 50;
  }
};
