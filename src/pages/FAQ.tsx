import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BackButton from "@/components/BackButton";
import { FAQ_DATA } from '@/data/faqData';

export default function FAQ() {
  const faqs = FAQ_DATA;

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
}
