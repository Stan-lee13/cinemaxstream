
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Phone, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || 'CinemaxStream Support Request');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:stanleyvic13@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-400 mb-12">Get in touch with our support team</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <Card className="p-6 bg-secondary/20 border-gray-800">
                  <div className="flex items-center mb-4">
                    <Mail className="w-6 h-6 text-cinemax-500 mr-3" />
                    <h3 className="text-lg font-semibold">Email Support</h3>
                  </div>
                  <p className="text-gray-400 mb-2">Send us an email and we'll respond within 24 hours</p>
                  <a 
                    href="mailto:stanleyvic13@gmail.com" 
                    className="text-cinemax-500 hover:text-cinemax-400 font-medium"
                  >
                    stanleyvic13@gmail.com
                  </a>
                </Card>
                
                <Card className="p-6 bg-secondary/20 border-gray-800">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-cinemax-500 mr-3" />
                    <h3 className="text-lg font-semibold">Live Chat</h3>
                  </div>
                  <p className="text-gray-400 mb-2">Chat with our support team in real-time</p>
                  <p className="text-sm text-gray-500">Available Monday - Friday, 9 AM - 6 PM</p>
                </Card>
                
                <Card className="p-6 bg-secondary/20 border-gray-800">
                  <div className="flex items-center mb-4">
                    <Clock className="w-6 h-6 text-cinemax-500 mr-3" />
                    <h3 className="text-lg font-semibold">Response Time</h3>
                  </div>
                  <p className="text-gray-400">We typically respond to all inquiries within 24 hours during business days.</p>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <Card className="p-6 bg-secondary/20 border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cinemax-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cinemax-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cinemax-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cinemax-500 resize-vertical"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-cinemax-500 hover:bg-cinemax-600 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
          
          {/* FAQ Reference */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">Before contacting us</h3>
            <p className="text-gray-400 mb-6">
              You might find your answer in our frequently asked questions
            </p>
            <a 
              href="/faq" 
              className="inline-flex items-center text-cinemax-500 hover:text-cinemax-400 font-medium"
            >
              Check our FAQ →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
