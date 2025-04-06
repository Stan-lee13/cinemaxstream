
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Accordion,
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqCategories = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is CinemaxStream?",
          answer: "CinemaxStream is a premium streaming platform that provides access to thousands of movies, TV shows, anime, and other video content from various sources in one convenient place."
        },
        {
          question: "Is CinemaxStream free to use?",
          answer: "Yes, the basic service of CinemaxStream is free to use. We also offer premium features that require a subscription. Premium features include ad-free viewing, higher quality streams, and exclusive content."
        },
        {
          question: "Do I need to create an account?",
          answer: "You can browse and watch most content without an account. However, creating a free account gives you features like watch history tracking, favorites lists, and personalized recommendations."
        },
        {
          question: "What devices can I use to watch CinemaxStream?",
          answer: "CinemaxStream is accessible on any device with a web browser, including computers, tablets, smartphones, and smart TVs. We also support features like picture-in-picture and casting to Chromecast devices."
        }
      ]
    },
    {
      category: "Content & Streaming",
      questions: [
        {
          question: "What content is available on CinemaxStream?",
          answer: "CinemaxStream offers movies, TV series, documentaries, anime, and more. Our library includes both new releases and classics from around the world."
        },
        {
          question: "Why do you offer multiple providers for the same content?",
          answer: "Streaming sources can sometimes be unreliable or unavailable in certain regions. By offering multiple providers, we ensure you can always find a working source for your content."
        },
        {
          question: "What is the difference between standard and premium sources?",
          answer: "Standard sources are free to use, but may occasionally have lower quality or advertisements. Premium sources offer higher quality streams without ads, but may require a subscription to the respective service."
        },
        {
          question: "What does the 'Premium' badge on content mean?",
          answer: "Content marked with the Premium badge is exclusive to our premium subscribers. It may include early releases, special editions, or content not widely available elsewhere."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "Why is my video not playing?",
          answer: "This could be due to several reasons: your internet connection, the specific provider being unavailable, or regional restrictions. Try selecting a different provider from the dropdown menu, checking your internet connection, or using a VPN if content is regionally restricted."
        },
        {
          question: "How do I improve streaming quality?",
          answer: "For best streaming quality: 1) Use a wired internet connection if possible, 2) Close other applications using bandwidth, 3) Try different streaming providers, 4) Adjust the quality settings in the player, 5) Upgrade to premium for access to higher quality streams."
        },
        {
          question: "What can I do if the video is buffering?",
          answer: "If your video is buffering, try: lowering the quality in the player settings, pausing the video for a few moments to allow it to pre-load, switching to a different streaming provider, or checking your internet connection speed."
        },
        {
          question: "Why are subtitles not working?",
          answer: "Subtitles depend on the streaming provider and the specific content. Not all providers offer subtitles for all content. If a provider does support subtitles, you can enable them from the player controls."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          question: "How do I upgrade to a premium account?",
          answer: "Go to your account settings and select 'Upgrade to Premium' to see available plans. We offer monthly and annual subscription options with various payment methods."
        },
        {
          question: "How can I cancel my premium subscription?",
          answer: "You can cancel anytime from your account settings under 'Subscription'. Your premium features will remain active until the current billing period ends."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, PayPal, and various cryptocurrency payments for premium subscriptions."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard security measures and do not store your full payment details. All transactions are processed through secure payment processors."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-cinemax-500">{category.category}</h2>
              
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, i) => (
                  <AccordionItem key={i} value={`item-${index}-${i}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-300">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is ready to assist you with any other questions you might have.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/help-center"
              className="px-6 py-3 bg-cinemax-500 rounded-md font-medium hover:bg-cinemax-600 transition-colors"
            >
              Visit Help Center
            </Link>
            <Link 
              to="/contact"
              className="px-6 py-3 bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
