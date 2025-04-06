
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, ThumbsUp, ThumbsDown, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const AI_SUGGESTIONS = [
  "How do I find anime content?",
  "Can't play this video, help!",
  "How do I enable subtitles?",
  "Why do some sources require VPN?",
  "How to use picture-in-picture?"
];

const AI_RESPONSES: Record<string, string> = {
  "how do i find anime content?": "You can find anime content by clicking on the 'Anime' section in the navigation menu. We also have specialized anime providers like AniWatch and AniList available when watching anime content.",
  
  "can't play this video, help!": "If a video isn't playing, try these steps: 1) Switch to a different streaming provider using the dropdown menu, 2) Check your internet connection, 3) Try disabling any ad blockers or VPNs that might interfere, 4) Refresh the page and try again.",
  
  "how do i enable subtitles?": "To enable subtitles, look for the CC or subtitle icon in the video player controls. Click it to see available subtitle options. Note that subtitle availability depends on the streaming provider you're using.",
  
  "why do some sources require vpn?": "Some streaming sources may be region-restricted due to licensing agreements. Using a VPN allows you to access these sources by making it appear that you're browsing from a different location. We recommend using a reputable VPN service for the best experience.",
  
  "how to use picture-in-picture?": "To use picture-in-picture mode, start playing a video and look for the PiP icon in the player controls (usually in the top-right corner). Clicking this will pop the video out into a smaller window that stays on top of other windows, allowing you to browse while watching.",
  
  "default": "I'm your CinemaxStream assistant. I can help with finding content, troubleshooting playback issues, explaining features, and answering questions about our service. How can I assist you today?"
};

const AIStreamingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: "👋 Hi there! I'm your CinemaxStream assistant. I can help with finding content, troubleshooting issues, or answering questions about our service. How can I assist you today?",
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Find response after a short delay to simulate AI processing
    setTimeout(() => {
      const userInput = input.toLowerCase().trim();
      let responseContent = AI_RESPONSES[userInput] || AI_RESPONSES.default;
      
      // Check for keywords if no exact match
      if (!AI_RESPONSES[userInput]) {
        if (userInput.includes('anime')) {
          responseContent = AI_RESPONSES["how do i find anime content?"];
        } else if (userInput.includes('play') || userInput.includes('video') || userInput.includes('stream')) {
          responseContent = AI_RESPONSES["can't play this video, help!"];
        } else if (userInput.includes('subtitle') || userInput.includes('caption')) {
          responseContent = AI_RESPONSES["how do i enable subtitles?"];
        } else if (userInput.includes('vpn') || userInput.includes('region')) {
          responseContent = AI_RESPONSES["why do some sources require vpn?"];
        } else if (userInput.includes('picture') || userInput.includes('pip')) {
          responseContent = AI_RESPONSES["how to use picture-in-picture?"];
        }
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: responseContent,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    
    // Focus the input field after setting suggestion
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden mb-2"
          >
            {/* Chat header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="bg-cinemax-500/30 p-1.5 rounded-full">
                  <Bot className="h-5 w-5 text-cinemax-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">CinemaxStream Assistant</h3>
                  <p className="text-xs text-gray-400">Always here to help</p>
                </div>
              </div>
              <div className="flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={minimizeChat}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat messages */}
            <ScrollArea className="h-72 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                      <div className={`flex-shrink-0 mt-1 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                        {message.sender === 'user' ? (
                          <div className="bg-gray-700 p-1.5 rounded-full">
                            <User className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="bg-cinemax-500/30 p-1.5 rounded-full">
                            <Bot className="h-3 w-3 text-cinemax-500" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-cinemax-500 text-white'
                            : 'bg-gray-800 border border-gray-700'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-[10px] mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="bg-cinemax-500/30 p-1.5 rounded-full">
                        <Bot className="h-3 w-3 text-cinemax-500" />
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Suggested questions */}
            <div className="px-4 py-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-xs bg-gray-800 hover:bg-gray-700 rounded-full px-2 py-1"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chat input */}
            <div className="p-4 pt-2 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-grow"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-cinemax-500 hover:bg-cinemax-600"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized chat bubble */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-gray-800 border border-gray-700 shadow-lg rounded-full p-2 pr-4 mb-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-700"
            onClick={() => setIsMinimized(false)}
          >
            <div className="bg-cinemax-500/30 p-1 rounded-full">
              <Bot className="h-5 w-5 text-cinemax-500" />
            </div>
            <span className="text-sm font-medium">AI Assistant</span>
            <Maximize2 className="h-4 w-4 opacity-70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat bubble button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-cinemax-500 hover:bg-cinemax-600'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

export default AIStreamingAssistant;
