import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ThemeSwitcher from '@/components/ThemeSwitcher'; // Import the ThemeSwitcher
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { Label } from '@/components/ui/label';   // Import Label component
import { toast } from 'sonner'; // For placeholder actions

const SettingsPage: React.FC = () => {
  const [allNotificationsEnabled, setAllNotificationsEnabled] = useState(true);

  const handleNotificationToggle = (isEnabled: boolean) => {
    setAllNotificationsEnabled(isEnabled);
    toast.info(`All notifications ${isEnabled ? 'enabled' : 'disabled'}. (Placeholder)`);
  };

  // Helper component for settings items
  const SettingsItem: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="py-4 border-b border-gray-800 last:border-b-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  // Helper component for section titles
  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl font-semibold text-cinemax-500 mt-8 mb-4 pb-2 border-b border-gray-700">{title}</h2>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Settings</h1>

        <div className="max-w-2xl mx-auto">
          {/* Account Section */}
          <SectionTitle title="Account" />
          <SettingsItem title="Profile Settings" description="Manage your public profile and account details.">
            <Button variant="outline" asChild>
              <Link to="/profile">Go to Profile</Link>
            </Button>
          </SettingsItem>
          <SettingsItem title="Subscription" description="View or manage your current subscription plan.">
            <Button variant="outline" asChild>
              <Link to="/subscription">View Subscription</Link>
            </Button>
          </SettingsItem>

          {/* Appearance Section */}
          <SectionTitle title="Appearance" />
          <SettingsItem title="Theme" description="Customize the look and feel of the application.">
            <ThemeSwitcher />
          </SettingsItem>
          <SettingsItem title="Language" description="Select your preferred language. (Placeholder)">
            <Button variant="outline" onClick={() => toast.info("Language settings coming soon!")}>
              English (US)
            </Button>
          </SettingsItem>

          {/* Notifications Section */}
          <SectionTitle title="Notifications" />
          <SettingsItem title="Notification Preferences" description="Choose what notifications you receive.">
            <div className="flex items-center space-x-2">
              <Switch
                id="all-notifications"
                checked={allNotificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                aria-label="Toggle all notifications"
              />
              <Label htmlFor="all-notifications" className="text-sm text-gray-300 cursor-pointer">
                {allNotificationsEnabled ? 'All Enabled' : 'All Disabled'}
              </Label>
            </div>
          </SettingsItem>
           <SettingsItem title="Email Notifications" description="Receive updates via email. (Placeholder)">
            <Switch defaultChecked={false} onCheckedChange={(checked) => toast.info(`Email notifications ${checked ? 'on' : 'off'}`)} />
          </SettingsItem>


          {/* Playback Section */}
          <SectionTitle title="Playback" />
          <SettingsItem title="Default Streaming Quality" description="Set your preferred video quality. (Placeholder)">
             <Button variant="outline" onClick={() => toast.info("Streaming quality settings coming soon!")}>
              Auto
            </Button>
          </SettingsItem>
          <SettingsItem title="Autoplay Next Episode" description="Automatically play the next episode. (Placeholder)">
            <Switch defaultChecked={true} onCheckedChange={(checked) => toast.info(`Autoplay ${checked ? 'on' : 'off'}`)} />
          </SettingsItem>

          {/* About Section */}
          <SectionTitle title="About" />
           <SettingsItem title="Version" description="Current application version.">
            <span className="text-sm text-gray-400">1.0.0 (Dev)</span>
          </SettingsItem>
          <SettingsItem title="Privacy Policy" description="Read our privacy policy.">
            <Button variant="link" className="p-0 h-auto text-cinemax-400 hover:text-cinemax-300" onClick={() => toast.info("Privacy Policy link clicked.")}>
              View Policy
            </Button>
          </SettingsItem>
           <SettingsItem title="Terms of Service" description="Read our terms of service.">
             <Button variant="link" className="p-0 h-auto text-cinemax-400 hover:text-cinemax-300" onClick={() => toast.info("Terms of Service link clicked.")}>
              View Terms
            </Button>
          </SettingsItem>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
