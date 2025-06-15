import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  HelpCircle, 
  PlayCircle, 
  Download, 
  Settings, 
  CreditCard, 
  Shield 
} from 'lucide-react';
import BackButton from "@/components/BackButton";

const HelpCenter = () => {
  const helpTopics = [
    {
      icon: <PlayCircle className="w-8 h-8 text-cinemax-500" />,
      title: "Getting Started",
      description: "Learn how to use CinemaxStream and explore our features",
      items: [
        "Creating an account",
        "Browsing content",
        "Using search and filters",
        "Managing your watchlist"
      ]
    },
    {
      icon: <Download className="w-8 h-8 text-cinemax-500" />,
      title: "Downloads & Offline",
      description: "Download content for offline viewing",
      items: [
        "How to download content",
        "Managing downloaded files",
        "Offline viewing limits",
        "Storage requirements"
      ]
    },
    {
      icon: <Settings className="w-8 h-8 text-cinemax-500" />,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      items: [
        "Profile management",
        "Privacy settings",
        "Notification preferences",
        "Language options"
      ]
    },
    {
      icon: <CreditCard className="w-8 h-8 text-cinemax-500" />,
      title: "Billing & Subscriptions",
      description: "Subscription plans and payment information",
      items: [
        "Subscription plans",
        "Payment methods",
        "Billing history",
        "Cancellation policy"
      ]
    },
    {
      icon: <Shield className="w-8 h-8 text-cinemax-500" />,
      title: "Safety & Security",
      description: "Keep your account secure",
      items: [
        "Password security",
        "Two-factor authentication",
        "Privacy protection",
        "Reporting content"
      ]
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-cinemax-500" />,
      title: "Troubleshooting",
      description: "Solve common technical issues",
      items: [
        "Video playback issues",
        "Connection problems",
        "App crashes",
        "Performance optimization"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-gray-400 mb-12">Get help with using CinemaxStream</p>
          
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
                    <li key={itemIndex} className="text-sm text-gray-300 hover:text-white cursor-pointer">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Need More Help?</h3>
            <p className="text-gray-400 mb-6">
              If you can't find what you're looking for, our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-cinemax-500 hover:bg-cinemax-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="/faq" 
                className="border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
