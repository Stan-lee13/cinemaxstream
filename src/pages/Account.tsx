import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuthState';
import { User, Settings, CreditCard, Download, Bell, Shield } from 'lucide-react';
import BackButton from "@/components/BackButton";

const Account = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Account</h1>
            <p className="text-gray-400 mb-8">Please sign in to access your account settings</p>
            <a 
              href="/auth" 
              className="bg-cinemax-500 hover:bg-cinemax-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const accountSections = [
    {
      icon: <User className="w-6 h-6 text-cinemax-500" />,
      title: "Profile Information",
      description: "Manage your personal information and preferences",
      action: "Edit Profile"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-cinemax-500" />,
      title: "Subscription & Billing",
      description: "View your subscription plan and billing information",
      action: "Manage Billing"
    },
    {
      icon: <Download className="w-6 h-6 text-cinemax-500" />,
      title: "Downloads",
      description: "Manage your downloaded content for offline viewing",
      action: "View Downloads"
    },
    {
      icon: <Bell className="w-6 h-6 text-cinemax-500" />,
      title: "Notifications",
      description: "Control your email and app notification preferences",
      action: "Notification Settings"
    },
    {
      icon: <Shield className="w-6 h-6 text-cinemax-500" />,
      title: "Privacy & Security",
      description: "Manage your privacy settings and account security",
      action: "Security Settings"
    },
    {
      icon: <Settings className="w-6 h-6 text-cinemax-500" />,
      title: "App Preferences",
      description: "Customize your viewing experience and app behavior",
      action: "App Settings"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400 mb-8">Manage your CinemaxStream account</p>
          
          {/* User Info */}
          <Card className="p-6 bg-secondary/20 border-gray-800 mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-cinemax-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user.email}</h2>
                <p className="text-gray-400">Premium Member</p>
              </div>
            </div>
          </Card>
          
          {/* Account Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountSections.map((section, index) => (
              <Card key={index} className="p-6 bg-secondary/20 border-gray-800 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {section.icon}
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{section.description}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {section.action}
                </Button>
              </Card>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                Export My Data
              </Button>
              <Button variant="outline">
                Delete Account
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
