
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, HelpCircle, FileText, PlayCircle, Settings, MessageSquare } from 'lucide-react';

const HelpCenter = () => {
  // Popular help categories
  const helpCategories = [
    { 
      title: "Getting Started", 
      icon: <PlayCircle className="h-6 w-6" />,
      description: "New to CinemaxStream? Learn the basics.",
      articles: [
        { title: "Creating an account", url: "/help-center/account-creation" },
        { title: "Browsing content", url: "/help-center/browsing" },
        { title: "Using the video player", url: "/help-center/player" },
        { title: "Understanding providers", url: "/help-center/providers" }
      ]
    },
    { 
      title: "Account & Settings", 
      icon: <Settings className="h-6 w-6" />,
      description: "Manage your account and preferences.",
      articles: [
        { title: "Premium subscription features", url: "/help-center/premium" },
        { title: "Account security", url: "/help-center/security" },
        { title: "Profile settings", url: "/help-center/profile" },
        { title: "Payment methods", url: "/help-center/payment" }
      ]
    },
    { 
      title: "Troubleshooting", 
      icon: <HelpCircle className="h-6 w-6" />,
      description: "Solutions for common issues.",
      articles: [
        { title: "Video playback issues", url: "/help-center/playback-issues" },
        { title: "Connection problems", url: "/help-center/connection" },
        { title: "App performance", url: "/help-center/performance" },
        { title: "Provider errors", url: "/help-center/provider-errors" }
      ]
    },
    { 
      title: "Content Requests", 
      icon: <FileText className="h-6 w-6" />,
      description: "Request new content or report issues.",
      articles: [
        { title: "How to request new content", url: "/help-center/content-requests" },
        { title: "Reporting incorrect metadata", url: "/help-center/report-metadata" },
        { title: "Content availability", url: "/help-center/availability" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-300 mb-8">
            Find answers to common questions and learn how to get the most out of CinemaxStream
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search for help topics..." 
              className="pl-10 py-6 bg-gray-800 border-gray-700"
            />
            <Button className="absolute right-1 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="categories" className="w-full mb-12">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="categories">Help Categories</TabsTrigger>
            <TabsTrigger value="popular">Popular Articles</TabsTrigger>
            <TabsTrigger value="videos">Tutorial Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index} className="border-gray-700 bg-gray-800/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-cinemax-500/20 text-cinemax-500">
                        {category.icon}
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, i) => (
                        <li key={i}>
                          <Link 
                            to={article.url} 
                            className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                          >
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            <span>{article.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link 
                      to={`/help-center/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-cinemax-500 hover:underline"
                    >
                      View all articles in this category →
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Why is my video not playing?",
                "How do I enable subtitles?",
                "What does the Premium badge mean?",
                "How to switch streaming providers",
                "Using picture-in-picture mode",
                "Why do some sources require a VPN?",
                "Downloading content for offline viewing",
                "Managing your watch history"
              ].map((article, index) => (
                <Card key={index} className="border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{article}</CardTitle>
                  </CardHeader>
                  <CardFooter className="text-sm text-gray-400">
                    Updated 2 days ago
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Getting started with CinemaxStream",
                "Advanced player features tutorial",
                "Using the watchlist features",
                "Setting up your profile",
                "Finding the perfect content",
                "Understanding streaming quality options"
              ].map((video, index) => (
                <div key={index} className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <h3 className="font-medium">{video}</h3>
                    <p className="text-sm text-gray-300">3:45 min</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/contact"
              className="px-6 py-3 bg-cinemax-500 rounded-md font-medium hover:bg-cinemax-600 transition-colors"
            >
              Contact Support
            </Link>
            <Link 
              to="/faq"
              className="px-6 py-3 bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Visit FAQ
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
