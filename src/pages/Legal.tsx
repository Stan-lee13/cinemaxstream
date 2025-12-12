import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Scale, FileText, Globe, Shield, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
              <Scale className="h-8 w-8 text-cinemax-500" />
              Legal Information
            </h1>
            <p className="text-gray-400 text-lg">
              Legal notices, disclaimers, and important information about CinemaxStream
            </p>
          </div>

          <div className="space-y-8">
            {/* Service Disclaimer */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                Service Disclaimer
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-200 font-medium mb-2">Important Notice</p>
                <p className="text-gray-300 text-sm">
                  CinemaxStream is a content aggregation platform that indexes and provides links to content 
                  available on the internet. We do not host, store, or distribute any copyrighted material 
                  on our servers.
                </p>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• All content is sourced from publicly available streaming services and APIs</li>
                <li>• We respect copyright laws and respond to valid DMCA takedown requests</li>
                <li>• Users are responsible for ensuring they have proper licensing for content access</li>
                <li>• The service is provided "as is" without warranties of any kind</li>
              </ul>
            </Card>

            {/* Company Information */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-cinemax-500" />
                Company Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Business Details</h3>
                  <div className="space-y-1 text-gray-300 text-sm">
                    <p><strong>Company Name:</strong> CinemaxStream LLC</p>
                    <p><strong>Registration:</strong> Delaware, USA</p>
                    <p><strong>Business ID:</strong> CMS-2024-001</p>
                    <p><strong>VAT ID:</strong> US123456789</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Contact Address</h3>
                  <div className="space-y-1 text-gray-300 text-sm">
                    <p>123 Streaming Avenue</p>
                    <p>Digital City, DC 12345</p>
                    <p>United States</p>
                    <p><strong>Email:</strong> legal@cinemaxstream.com</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Intellectual Property */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-cinemax-500" />
                Intellectual Property Rights
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Our Content</h3>
                  <p className="text-sm">
                    The CinemaxStream website design, logo, branding, and original content are protected by 
                    copyright and trademark laws. All rights reserved.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Third-Party Content</h3>
                  <p className="text-sm">
                    All movie posters, descriptions, ratings, and metadata are sourced from The Movie Database (TMDB) 
                    and other publicly available APIs. Content ownership remains with respective copyright holders.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">User-Generated Content</h3>
                  <p className="text-sm">
                    Users retain ownership of their reviews, ratings, and comments. By submitting content, 
                    you grant us a license to display and distribute it on our platform.
                  </p>
                </div>
              </div>
            </Card>

            {/* Jurisdiction */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-cinemax-500" />
                Jurisdiction & Governing Law
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Governing Law</h3>
                  <p className="text-sm">
                    These terms and any disputes arising from your use of CinemaxStream are governed by 
                    the laws of Delaware, United States, without regard to conflict of law principles.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Dispute Resolution</h3>
                  <p className="text-sm">
                    Any legal disputes will be resolved through binding arbitration in Delaware, USA. 
                    Class action lawsuits are waived by using our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">International Users</h3>
                  <p className="text-sm">
                    Users outside the United States access our service at their own risk and are responsible 
                    for compliance with local laws and regulations.
                  </p>
                </div>
              </div>
            </Card>

            {/* Compliance */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">GDPR Compliance</h3>
                  <p className="text-gray-300 text-sm">
                    For EU users, we comply with the General Data Protection Regulation (GDPR). 
                    You have rights regarding your personal data as outlined in our Privacy Policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">CCPA Compliance</h3>
                  <p className="text-gray-300 text-sm">
                    California residents have additional privacy rights under the California Consumer 
                    Privacy Act (CCPA) as detailed in our Privacy Policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">COPPA Compliance</h3>
                  <p className="text-gray-300 text-sm">
                    Our service is not intended for children under 13. We do not knowingly collect 
                    personal information from children under 13 years of age.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Accessibility</h3>
                  <p className="text-gray-300 text-sm">
                    We strive to comply with WCAG 2.1 guidelines to ensure our platform is accessible 
                    to users with disabilities.
                  </p>
                </div>
              </div>
            </Card>

            {/* Legal Documents */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Related Legal Documents</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = '/terms'}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Terms of Service</div>
                    <div className="text-sm text-gray-400">User agreement and service terms</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = '/privacy'}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Privacy Policy</div>
                    <div className="text-sm text-gray-400">How we handle your data</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = '/dmca'}
                >
                  <Scale className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">DMCA Policy</div>
                    <div className="text-sm text-gray-400">Copyright takedown procedures</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = '/cookies'}
                >
                  <Globe className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Cookie Policy</div>
                    <div className="text-sm text-gray-400">Cookie usage and preferences</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Contact Legal */}
            <Card className="p-6 bg-secondary/20 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-cinemax-500" />
                Legal Contact
              </h2>
              <p className="text-gray-300 mb-4">
                For legal inquiries, copyright concerns, or business matters, please contact our legal team:
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-gray-300 mb-1"><strong>Legal Department</strong></p>
                <p className="text-gray-300 mb-1">Email: legal@cinemaxstream.com</p>
                <p className="text-gray-300 mb-1">Response time: 2-3 business days</p>
              </div>
              <Button 
                className="bg-cinemax-500 hover:bg-cinemax-600"
                onClick={() => window.location.href = 'mailto:legal@cinemaxstream.com?subject=Legal Inquiry'}
              >
                Contact Legal Team
              </Button>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>This legal information is subject to change. Please review periodically for updates.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;