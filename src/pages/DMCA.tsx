import React from 'react';
import { DMCA_CONTACT } from '@/data/dmcaData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Mail, FileText, AlertTriangle } from 'lucide-react';

export default function DMCA() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-cinemax-500" />
              DMCA Policy
            </h1>
            <p className="text-gray-400 text-lg">
              Digital Millennium Copyright Act compliance and takedown procedures
            </p>
          </div>

          <div className="space-y-8">
            {/* Overview */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-cinemax-500" />
                Overview
              </h2>
              <p className="text-gray-300 mb-4">
                CinemaxStream respects the intellectual property rights of others and expects our users to do the same. 
                In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to valid takedown notices 
                and remove infringing content when properly notified.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-medium">Important Notice</p>
                    <p className="text-gray-300 text-sm mt-1">
                      CinemaxStream is a streaming aggregator that indexes content from various sources. 
                      We do not host any copyrighted material on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filing a DMCA Notice */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Filing a DMCA Takedown Notice</h2>
              <p className="text-gray-300 mb-4">
                If you believe that content on our platform infringes your copyright, please provide the following information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
                <li>Your name, address, phone number, and email address</li>
                <li>Description of the copyrighted work that you claim has been infringed</li>
                <li>URL or specific location of the infringing material on our platform</li>
                <li>Statement that you have a good-faith belief that the use is not authorized</li>
                <li>Statement that the information in your notice is accurate</li>
                <li>Your physical or electronic signature</li>
              </ul>
              <p className="text-gray-400 text-sm">
                Please note that under Section 512(f) of the DMCA, any person who knowingly materially 
                misrepresents that material is infringing may be subject to liability.
              </p>
            </Card>

            {/* Contact Information */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-cinemax-500" />
                DMCA Contact Information
              </h2>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-gray-300 mb-2"><strong>DMCA Agent:</strong> {DMCA_CONTACT.agent}</p>
                <p className="text-gray-300 mb-2"><strong>Email:</strong> {DMCA_CONTACT.email}</p>
                <p className="text-gray-300 mb-2"><strong>Address:</strong> {DMCA_CONTACT.address}</p>
                <p className="text-gray-300"><strong>Phone:</strong> {DMCA_CONTACT.phone}</p>
              </div>
              <Button 
                className="bg-cinemax-500 hover:bg-cinemax-600"
                onClick={() => window.location.href = 'mailto:dmca@cinemaxstream.com?subject=DMCA Takedown Notice'}
              >
                Send DMCA Notice
              </Button>
            </Card>

            {/* Response Time */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Response Time & Process</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Response Time</h3>
                  <p className="text-gray-300 text-sm">
                    We aim to respond to valid DMCA notices within 24-48 hours of receipt.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Content Removal</h3>
                  <p className="text-gray-300 text-sm">
                    Infringing content will be removed or access disabled promptly after verification.
                  </p>
                </div>
              </div>
            </Card>

            {/* Counter-Notice */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Counter-Notice Procedure</h2>
              <p className="text-gray-300 mb-4">
                If you believe your content was removed in error, you may file a counter-notice containing:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                <li>Your name, address, and phone number</li>
                <li>Identification of the removed material and its former location</li>
                <li>Statement under penalty of perjury that removal was a mistake</li>
                <li>Consent to jurisdiction of federal court</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>This policy is subject to change without prior notice.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}