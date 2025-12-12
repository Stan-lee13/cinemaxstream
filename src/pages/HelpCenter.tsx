import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  PlayCircle, 
  Download, 
  Settings, 
  CreditCard, 
  Shield,
  MessageCircle,
  Book,
  Video
} from 'lucide-react';
import BackButton from "@/components/BackButton";
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const navigate = useNavigate();

  const helpTopics = [
    {
      icon: <PlayCircle className="w-8 h-8 text-cinemax-500" />,
      title: "Getting Started",
      description: "Learn how to use CinemaxStream",
      items: [
        { title: "Creating an account", action: () => navigate('/auth') },
        { title: "Browsing content", action: () => navigate('/') },
        { title: "Using search", action: () => navigate('/') },
        { title: "Managing your watchlist", action: () => navigate('/favorites') }
      ]
    },
    {
      icon: <Download className="w-8 h-8 text-cinemax-500" />,
      title: "Downloads",
      description: "Download content for offline viewing",
      items: [
        { title: "How to download", action: () => navigate('/downloads') },
        { title: "Manage downloads", action: () => navigate('/downloads') },
        { title: "Download limits", action: () => navigate('/manage-billing') },
        { title: "Pro & Premium benefits", action: () => navigate('/manage-billing') }
      ]
    },
    {
      icon: <Settings className="w-8 h-8 text-cinemax-500" />,
      title: "Account Settings",
      description: "Manage your profile",
      items: [
        { title: "Edit profile", action: () => navigate('/edit-profile') },
        { title: "Privacy settings", action: () => navigate('/security-settings') },
        { title: "Notifications", action: () => navigate('/notification-settings') },
        { title: "App preferences", action: () => navigate('/app-settings') }
      ]
    },
    {
      icon: <CreditCard className="w-8 h-8 text-cinemax-500" />,
      title: "Billing & Subscriptions",
      description: "Subscription and payment info",
      items: [
        { title: "View plans", action: () => navigate('/manage-billing') },
        { title: "Upgrade account", action: () => navigate('/manage-billing') },
        { title: "Premium codes", action: () => navigate('/') },
        { title: "Cancel subscription", action: () => navigate('/manage-billing') }
      ]
    },
    {
      icon: <Shield className="w-8 h-8 text-cinemax-500" />,
      title: "Safety & Security",
      description: "Keep your account secure",
      items: [
        { title: "Change password", action: () => navigate('/security-settings') },
        { title: "Security settings", action: () => navigate('/security-settings') },
        { title: "Privacy policy", action: () => navigate('/privacy') },
        { title: "Terms of service", action: () => navigate('/terms') }
      ]
    },
    {
      icon: <Video className="w-8 h-8 text-cinemax-500" />,
      title: "Streaming",
      description: "Get help with video playback",
      items: [
        { title: "Video quality settings", action: () => navigate('/app-settings') },
        { title: "Playback issues", action: () => navigate('/contact-support') },
        { title: "Supported devices", action: () => navigate('/faq') },
        { title: "Connection requirements", action: () => navigate('/faq') }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-gray-400 mb-12">Find answers and get support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="p-6 bg-secondary/20 border-gray-800 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center mb-4">
                  {topic.icon}
                  <h3 className="text-xl font-semibold ml-3">{topic.title}</h3>
                </div>
                <p className="text-gray-400 mb-4">{topic.description}</p>
                <ul className="space-y-2">
                  {topic.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button
                        onClick={item.action}
                        className="text-sm text-gray-300 hover:text-cinemax-500 cursor-pointer transition-colors text-left"
                      >
                        • {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-8 text-center">
            <MessageCircle className="w-12 h-12 text-cinemax-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Still Need Help?</h3>
            <p className="text-gray-400 mb-6">
              Our support team is ready to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact-support')}
                className="bg-cinemax-500 hover:bg-cinemax-600 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
              <Button 
                onClick={() => navigate('/faq')}
                variant="outline"
                className="gap-2"
              >
                <Book className="h-4 w-4" />
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
