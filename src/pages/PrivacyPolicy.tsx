
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <div className="text-sm text-gray-400 mb-8">Last updated: April 10, 2024</div>
          
          <div className="prose prose-invert max-w-none">
            <p>
              This Privacy Policy describes how CinemaxStream ("we", "us", or "our") collects, uses, and shares your personal information when you use our website and services (collectively, the "Services").
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Information We Collect</h2>
            <p>We collect information about you in various ways when you use our Services:</p>
            
            <h3 className="text-lg font-bold mt-6 mb-3">Information You Provide to Us</h3>
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account Information: When you create an account, we collect your name, email address, and password.</li>
              <li>Profile Information: Information you add to your profile, such as a profile picture, preferences, and biographical information.</li>
              <li>Subscription Information: If you purchase a premium subscription, we collect billing details and payment information.</li>
              <li>Communications: Information you provide when you contact us, participate in surveys, or respond to notifications.</li>
            </ul>
            
            <h3 className="text-lg font-bold mt-6 mb-3">Information We Collect Automatically</h3>
            <p>When you use our Services, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usage Information: Details about how you use our platform, including content you view, search queries, and interactions with features.</li>
              <li>Device Information: Information about the device you use to access our Services, including device type, operating system, browser type, and IP address.</li>
              <li>Log Information: Information recorded when you use our Services, including access times, pages viewed, and system activity.</li>
              <li>Location Information: General location information inferred from your IP address.</li>
            </ul>
            
            <h3 className="text-lg font-bold mt-6 mb-3">Cookies and Similar Technologies</h3>
            <p>
              We use cookies, web beacons, and similar technologies to collect information about your interactions with our Services. These technologies help us personalize your experience, remember your preferences, and improve our Services. You can manage your cookie preferences through your browser settings.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our Services</li>
              <li>Personalize your experience and deliver content relevant to your interests</li>
              <li>Process transactions and manage your account</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers who perform services on our behalf</li>
              <li>When you direct us to share your information with third parties</li>
              <li>To comply with law, legal process, or governmental request</li>
              <li>To protect the rights, property, and safety of our users and others</li>
              <li>In connection with a business transaction such as a merger, acquisition, or sale of assets</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Your Choices</h2>
            <p>You have several choices regarding the information we collect and how it's used:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account Information: You can update your account information through your account settings.</li>
              <li>Marketing Communications: You can opt out of receiving marketing communications from us by following the unsubscribe instructions in those communications.</li>
              <li>Cookies: Most web browsers are set to accept cookies by default. You can choose to set your browser to remove or reject cookies.</li>
              <li>Do Not Track: Some browsers offer a "Do Not Track" feature. We do not currently respond to Do Not Track signals.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no data transmission over the Internet or stored on a server can be guaranteed to be 100% secure.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">International Data Transfers</h2>
            <p>
              We are based in the United States and the information we collect is governed by U.S. law. If you are accessing our Services from outside the United States, please be aware that information collected through our Services may be transferred to, processed, and stored in the United States and other countries.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our Services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information as quickly as possible.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the change becoming effective.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3">
              <p>Email: privacy@cinemaxstream.com</p>
              <p>Address: 123 Streaming Avenue, Suite 200, Los Angeles, CA 90001</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
