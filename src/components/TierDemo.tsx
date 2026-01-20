import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TierDemo = () => {
  const { user, isPremium: authIsPremium } = useAuth();
  const { tier, benefits, isPro, isPremium, isLoading } = useUserTier(user?.id);

  if (isLoading) {
    return <div>Loading tier information...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Tier Information</CardTitle>
        <CardDescription>Current subscription benefits and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Tier</h3>
            <p className="text-muted-foreground">Your subscription level</p>
          </div>
          <Badge variant={tier === 'premium' ? 'default' : 'outline'} className="text-lg">
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold">Streaming</h4>
              <p className="text-2xl font-bold">{benefits.unlimited ? '∞' : benefits.maxStreams}</p>
              <p className="text-sm text-muted-foreground">streams/day</p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold">Downloads</h4>
              <p className="text-2xl font-bold">{benefits.unlimited ? '∞' : benefits.maxDownloads}</p>
              <p className="text-sm text-muted-foreground">downloads/day</p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold">Priority</h4>
              <p className="text-2xl font-bold">{benefits.priorityLevel}</p>
              <p className="text-sm text-muted-foreground">support level</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {benefits.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isPro ? "default" : "outline"} 
            disabled={!isPro}
            className={isPro ? "" : "opacity-50 cursor-not-allowed"}
          >
            Pro Features {isPro ? '✓' : '✗'}
          </Button>
          <Button 
            variant={isPremium ? "default" : "outline"} 
            disabled={!isPremium}
            className={isPremium ? "" : "opacity-50 cursor-not-allowed"}
          >
            Premium Features {isPremium ? '✓' : '✗'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Auth Context Premium: {authIsPremium ? 'Yes' : 'No'}</p>
          <p>User Tier Premium: {isPremium ? 'Yes' : 'No'}</p>
          <p>User Tier Pro: {isPro ? 'Yes' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierDemo;