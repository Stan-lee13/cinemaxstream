/**
 * Tracking and watch history utility functions
 */

/**
 * Track streaming activity
 */
export const trackStreamingActivity = (
  contentId: string,
  userId: string,
  currentTime: number,
  episodeId?: string
): void => {
  // In a real implementation, this would send data to a backend
  console.log(`Tracking activity: Content ID ${contentId}, User ID ${userId}, Time ${currentTime}, Episode ID ${episodeId || 'N/A'}`);
  
  // Store locally for history
  try {
    const historyKey = 'watch_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Find if this content already exists in history
    const existingIndex = history.findIndex((item: any) => 
      item.contentId === contentId && item.episodeId === episodeId
    );
    
    const timestamp = new Date().toISOString();
    
    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex].currentTime = currentTime;
      history[existingIndex].lastWatched = timestamp;
    } else {
      // Add new entry
      history.unshift({
        contentId,
        episodeId,
        currentTime,
        lastWatched: timestamp,
        userId
      });
    }
    
    // Keep only last 50 items
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving watch history:', error);
  }
};

/**
 * Mark content as complete
 */
export const markContentAsComplete = (
  contentId: string,
  userId: string,
  episodeId?: string
): void => {
  // In a real implementation, this would send data to a backend
  console.log(`Marking complete: Content ID ${contentId}, User ID ${userId}, Episode ID ${episodeId || 'N/A'}`);
  
  // Store completion status locally
  try {
    const completedKey = 'completed_content';
    const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
    
    const existingItem = completed.find((item: any) => 
      item.contentId === contentId && item.episodeId === episodeId
    );
    
    if (!existingItem) {
      completed.push({
        contentId,
        episodeId,
        userId,
        completedAt: new Date().toISOString()
      });
      
      localStorage.setItem(completedKey, JSON.stringify(completed));
    }
  } catch (error) {
    console.error('Error saving completion status:', error);
  }
};
