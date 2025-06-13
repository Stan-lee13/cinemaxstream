
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bot,
  X,
  Send,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  Calendar,
  Clock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";

interface VideoAssistantProps {
  contentTitle?: string;
  contentType?: string;
  onRequestEpisode?: (season: number, episode: number) => void;
  onRequestSkip?: (seconds: number) => void;
  onRequestRelated?: () => void;
  onRequestResumePlayback?: () => void; // New prop
  onRequestShowInfo?: () => void; // New prop
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

const VideoAssistant = ({
  contentTitle = 'this content',
  contentType = 'movie',
  onRequestEpisode,
  onRequestSkip,
  onRequestRelated,
  onRequestResumePlayback,
  onRequestShowInfo
}: VideoAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi there! I'm your video assistant. How can I help you with ${contentTitle}?`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const { register, handleSubmit, reset, formState } = useForm<{ message: string }>();
  
  const onSubmit = (data: { message: string }) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: data.message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    reset();
    
    // Process the message
    setTimeout(() => {
      handleAssistantResponse(data.message);
    }, 500);
  };
  
  const handleAssistantResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    // Basic response logic
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `Hi there! I'm happy to help with ${contentTitle}!`;
    } 
    else if (lowerMessage.includes('skip') || lowerMessage.includes('forward')) {
      const seconds = 30;
      response = `I've skipped forward by ${seconds} seconds.`;
      if (onRequestSkip) onRequestSkip(seconds);
    }
    else if (lowerMessage.includes('back') || lowerMessage.includes('rewind')) {
      const seconds = -15;
      response = `I've rewound by 15 seconds.`;
      if (onRequestSkip) onRequestSkip(seconds);
    }
    else if (lowerMessage.includes('episode') && contentType !== 'movie') {
      const episodeMatch = userMessage.match(/episode (\d+)/i);
      const seasonMatch = userMessage.match(/season (\d+)/i);
      
      const season = seasonMatch ? parseInt(seasonMatch[1]) : 1;
      const episode = episodeMatch ? parseInt(episodeMatch[1]) : 1;
      
      response = `Playing Season ${season}, Episode ${episode}.`;
      if (onRequestEpisode) onRequestEpisode(season, episode);
    }
    else if (lowerMessage.includes('similar') || lowerMessage.includes('related') || lowerMessage.includes('like this')) {
      response = `I'll show you similar content to ${contentTitle}.`;
      if (onRequestRelated) onRequestRelated();
    }
    else if (lowerMessage.includes('what') && (lowerMessage.includes('about') || lowerMessage.includes('plot') || lowerMessage.includes('story'))) {
      response = `${contentTitle} is a ${contentType} currently playing. For a detailed plot summary, you can click the Info button or ask me specific questions about the content.`;
    }
    else if (lowerMessage.includes('thank')) {
      response = "You're welcome! Enjoy your viewing experience.";
    }
    else {
      response = "I'm not sure I understand. If you need help with playback, finding episodes, or getting content information, just let me know!";
    }
    
    // Add assistant message
    const assistantMessage: Message = {
      id: Date.now().toString(),
      text: response,
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };
  
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'play':
        if (onRequestResumePlayback) {
          onRequestResumePlayback();
        } else {
          toast.info("Resume playback action requested.");
        }
        break;
      case 'info':
        if (onRequestShowInfo) {
          onRequestShowInfo();
        } else {
          toast.info(`Show info requested for ${contentTitle}.`);
        }
        break;
      case 'next':
        if (contentType !== 'movie') {
          toast.info("Requesting next episode..."); // More generic toast
          if (onRequestEpisode) {
            // Ideally, we'd need current season/episode context here to request the *actual* next one.
            // For now, calling it (if provided) is kept, but this part may need future enhancement.
            // Example: if current is S1E1, next could be S1E2.
            // The parent (ContentDetail) provides handleEpisodeSelect which might have this context.
            // However, VideoAssistant doesn't know the current episode to increment it.
            // The previous (1,2) was an example, let's remove specific numbers if not available.
            // Or rely on parent to handle "next" logic if no specific episode is passed.
            onRequestEpisode(-1, -1); // Signal to parent to play "next" based on its context
          }
        }
        break;
      default:
        break;
    }
  };
  
  return (
    <>
      {/* Assistant trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-600"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Assistant dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-[350px] max-w-[90vw] rounded-lg bg-gray-900/95 backdrop-blur-md border border-gray-800 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium">Video Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Messages */}
            <div className="p-4 h-[300px] overflow-y-auto scrollbar-none">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      {message.text}
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
              <Button 
                variant="secondary" 
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleQuickAction('play')}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Resume
              </Button>
              {contentType !== 'movie' && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => handleQuickAction('next')}
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Next Episode
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleQuickAction('info')}
              >
                <Info className="h-4 w-4 mr-1" />
                Show Info
              </Button>
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    {...register('message', { required: true })}
                    type="text"
                    placeholder="Type your question..."
                    className="w-full p-2 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="default"
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoAssistant;
