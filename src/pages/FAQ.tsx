import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BackButton from "@/components/BackButton";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign In' button in the top right corner, then select 'Sign Up' to create a new account with your email and password."
    },
    {
      question: "Is CinemaxStream free to use?",
      answer: "CinemaxStream offers both free and premium content. Basic features are free, while premium content requires a subscription."
    },
    {
      question: "Can I download content for offline viewing?",
      answer: "Yes, premium subscribers can download select movies and TV shows for offline viewing on their devices."
    },
    {
      question: "What devices are supported?",
      answer: "CinemaxStream works on all modern web browsers, smartphones, tablets, smart TVs, and streaming devices."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime by going to your Account settings and selecting 'Cancel Subscription'."
    },
    {
      question: "Why is content not loading?",
      answer: "Check your internet connection, clear your browser cache, or try refreshing the page. If issues persist, contact our support team."
    },
    {
      question: "Can I share my account with family?",
      answer: "Premium accounts support multiple user profiles for family sharing. Check our Terms of Service for details."
    },
    {
      question: "How often is new content added?",
      answer: "We add new movies, TV shows, and anime regularly. Check our 'New Releases' section for the latest additions."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400 mb-8">Find answers to common questions about CinemaxStream</p>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-secondary/20 rounded-lg px-6">
                <AccordionTrigger className="text-left hover:text-cinemax-500">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 p-6 bg-secondary/20 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-cinemax-500 hover:text-cinemax-400 font-medium"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
