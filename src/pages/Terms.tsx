
import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
                <p className="text-gray-300">
                  By accessing and using CinemaxStream, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to these terms, you should not 
                  use this service.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Use License</h2>
                <p className="text-gray-300">
                  Permission is granted to temporarily access CinemaxStream for personal, non-commercial 
                  transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>
                <p className="text-gray-300 mt-4">Under this license you may not:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mt-2">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
                <p className="text-gray-300">
                  You are responsible for safeguarding the password and for maintaining the confidentiality 
                  of your account. You agree to accept responsibility for all activities that occur under 
                  your account.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Subscription and Payment</h2>
                <p className="text-gray-300">
                  Subscription fees are charged in advance on a monthly or annual basis. All fees are 
                  non-refundable. You may cancel your subscription at any time through your account settings.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Content and Intellectual Property</h2>
                <p className="text-gray-300">
                  All content available on CinemaxStream is protected by copyright and other intellectual 
                  property laws. You may not distribute, modify, transmit, reuse, download, or use said 
                  content for any purpose other than personal, non-commercial use.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
                <p className="text-gray-300">You may not use our service:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mt-2">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p className="text-gray-300">
                  In no case shall CinemaxStream, nor its directors, employees, partners, agents, suppliers, 
                  or affiliates, be liable for any indirect, incidental, punitive, consequential, or similar 
                  damages arising out of your access of or use of, or inability to access or use the service.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="text-gray-300">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:stanleyvic13@gmail.com" className="text-cinemax-500 hover:text-cinemax-400">
                    stanleyvic13@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
