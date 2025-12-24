import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQ_DATA } from '@/data/faqData';
import { HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const faqs = FAQ_DATA;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[30%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="faq-header text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about CinemaxStream. Can't find the answer? We're here to help.
            </p>
          </div>

          <div className="space-y-4 mb-16">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="faq-item border-none bg-[#111] hover:bg-[#161616] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 shadow-xl shadow-black/20"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-left text-lg font-medium text-gray-200 hover:text-white data-[state=open]:text-emerald-400 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-gray-400 text-base leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="support-card bg-gradient-to-br from-[#111] to-[#0d0d0d] rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <h3 className="text-2xl font-bold mb-4 text-white relative z-10">Still have questions?</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">
              Can't find what you're looking for? Our dedicated support team is available 24/7 to assist you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button
                onClick={() => navigate('/contact-support')}
                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-gray-200 font-bold shadow-lg shadow-white/10 transition-all hover:scale-105"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
