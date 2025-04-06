
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle, 
  MessageSquareText,
  Send
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  category: z.string(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categories for the contact form
  const contactCategories = [
    { value: "technical", label: "Technical Support", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { value: "account", label: "Account Issues", icon: <Mail className="mr-2 h-4 w-4" /> },
    { value: "billing", label: "Billing Questions", icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
    { value: "content", label: "Content Request", icon: <MessageSquareText className="mr-2 h-4 w-4" /> },
    { value: "feedback", label: "Feedback", icon: <MessageSquare className="mr-2 h-4 w-4" /> },
    { value: "other", label: "Other", icon: null }
  ];
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      category: "technical",
      message: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Form values:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Your message has been sent successfully! Our team will get back to you soon.");
      form.reset();
    } catch (error) {
      toast.error("There was an error sending your message. Please try again.");
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-gray-800/40 border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
                  <p className="text-gray-300 mb-6">
                    Have questions or feedback? Our team is here to help. Choose the best way to reach us.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-cinemax-500/20 p-2 rounded-lg mr-3">
                        <Mail className="h-5 w-5 text-cinemax-500" />
                      </div>
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-gray-400">support@cinemaxstream.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-cinemax-500/20 p-2 rounded-lg mr-3">
                        <MessageSquare className="h-5 w-5 text-cinemax-500" />
                      </div>
                      <div>
                        <div className="font-medium">Live Chat</div>
                        <div className="text-sm text-gray-400">Available 24/7 for premium users</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-cinemax-500/20 p-2 rounded-lg mr-3">
                        <HelpCircle className="h-5 w-5 text-cinemax-500" />
                      </div>
                      <div>
                        <div className="font-medium">Help Center</div>
                        <div className="text-sm text-gray-400">Find answers to common questions</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="font-medium mb-2">Response Times</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Premium Users: Within 4 hours</li>
                      <li>• Standard Users: 24-48 hours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/40 border-gray-700 overflow-hidden">
                <div className="p-6 pb-0">
                  <h3 className="font-bold">Frequently Asked</h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-700">
                    {[
                      "How do I reset my password?",
                      "Why is content not playing?",
                      "How to change streaming quality?",
                      "Billing information"
                    ].map((item, index) => (
                      <div key={index} className="p-4 hover:bg-gray-700 cursor-pointer">
                        <div className="flex items-center">
                          <span className="mr-2 text-xs text-cinemax-500">Q:</span>
                          <span className="text-sm">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Form */}
            <Card className="md:col-span-2 bg-gray-800/40 border-gray-700">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Send Us a Message</h2>
                  <p className="text-gray-300 text-sm mt-1">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Contact Reasons</SelectLabel>
                                {contactCategories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    <div className="flex items-center">
                                      {category.icon}
                                      {category.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the category that best describes your inquiry
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your issue or question in detail..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
