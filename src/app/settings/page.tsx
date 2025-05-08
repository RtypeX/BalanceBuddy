
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/ModeToggle";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { DollarSign, CreditCard, Shield, Bell, LogOut, UserCircle, History, FileText, Edit3 } from 'lucide-react'; // Added Edit3

const SUBSCRIPTION_STATUS_KEY = 'balanceBotSubscriptionStatus'; // Same key as BalanceBot page
const NOTIFICATION_PREFERENCES_KEY = 'balanceBotNotificationPreferences';

interface NotificationPreferences {
  workoutReminders: boolean;
  fastingReminders: boolean;
  newFeatures: boolean;
  promotionalOffers: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    workoutReminders: true,
    fastingReminders: true,
    newFeatures: true,
    promotionalOffers: false,
  });
  const [userEmail, setUserEmail] = useState<string>('loading...');


  useEffect(() => {
    const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS_KEY);
    setIsSubscribed(subscriptionStatus === 'true');
    setIsLoadingSubscription(false);

    const storedPrefs = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (storedPrefs) {
      try {
        setNotificationPreferences(JSON.parse(storedPrefs));
      } catch (e) {
        console.error("Failed to parse notification preferences", e);
      }
    }
    
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserEmail(parsedUser.email || 'demo@example.com');
            } catch (e) {
                 console.error("Failed to parse user from localStorage", e);
                 setUserEmail('demo@example.com');
            }
        } else {
            setUserEmail('demo@example.com'); // Fallback if no user in localStorage
        }
    }


  }, []);

  const handleSubscriptionToggle = () => {
    // In a real app, this would trigger a flow to manage subscription (e.g., redirect to Stripe, in-app purchase)
    if (isSubscribed) {
      // Simulate cancellation
      if (confirm("Are you sure you want to cancel your BalanceBot Premium subscription?")) {
        setIsSubscribed(false);
        localStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'false');
        toast({ title: "Subscription Cancelled", description: "Your BalanceBot Premium access has ended." });
      }
    } else {
      // Simulate subscribing - redirect to chat page's modal or implement similar modal here
      router.push('/balancebot#subscribe'); // Example: redirect or open modal
      toast({ title: "Manage Subscription", description: "Redirecting to subscription options..." });
    }
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    setNotificationPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
    toast({ title: "Notification Preferences Updated" });
  };

  const handleLogout = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('profileData');
    localStorage.removeItem(SUBSCRIPTION_STATUS_KEY);
    localStorage.removeItem(NOTIFICATION_PREFERENCES_KEY);
    // Add other keys used by features like fasting, workout logs etc.
    localStorage.removeItem('fastingLog');
    localStorage.removeItem('fastingStartTime');
    localStorage.removeItem('fastingGoalHours');
    localStorage.removeItem('workoutLogs');
    localStorage.removeItem('balanceBotRequestTimestamps_Gemini'); // Clear rate limit timestamps
    localStorage.removeItem('balanceBotSavedChats');

    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/'); // Redirect to the start page
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-2xl mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> Account</CardTitle>
            <CardDescription>Manage your account details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input type="email" value={userEmail} disabled />
              <p className="text-xs text-muted-foreground mt-1">Your email is used for login and account recovery.</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/profile')}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
             <Separator />
             <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="flex-grow">Dark Mode</Label>
                <ModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Billing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Subscription & Billing</CardTitle>
            <CardDescription>Manage your BalanceBot Premium subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSubscription ? (
              <p>Loading subscription status...</p>
            ) : isSubscribed ? (
              <div>
                <p className="text-green-600 font-semibold">BalanceBot Premium Active</p>
                <p className="text-sm text-muted-foreground">You have unlimited access to all features.</p>
                <Button onClick={handleSubscriptionToggle} variant="destructive" className="mt-2">Cancel Subscription</Button>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">You are currently on the free plan.</p>
                <Button onClick={handleSubscriptionToggle} className="mt-2">Upgrade to Premium</Button>
              </div>
            )}
            <Separator />
            <Button variant="outline" onClick={() => router.push('/billing-history')}>
                <History className="mr-2 h-4 w-4"/> View Billing History
            </Button>
             <Button variant="outline" onClick={() => router.push('/payment-methods')}>
                <DollarSign className="mr-2 h-4 w-4"/> Manage Payment Methods
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
            <CardDescription>Choose what updates you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="workoutReminders" className="flex-grow">Workout Reminders</Label>
              <Switch
                id="workoutReminders"
                checked={notificationPreferences.workoutReminders}
                onCheckedChange={(checked) => handleNotificationChange('workoutReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fastingReminders" className="flex-grow">Fasting Reminders</Label>
              <Switch
                id="fastingReminders"
                checked={notificationPreferences.fastingReminders}
                onCheckedChange={(checked) => handleNotificationChange('fastingReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newFeatures" className="flex-grow">New Feature Announcements</Label>
              <Switch
                id="newFeatures"
                checked={notificationPreferences.newFeatures}
                onCheckedChange={(checked) => handleNotificationChange('newFeatures', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="promotionalOffers" className="flex-grow">Promotional Offers</Label>
              <Switch
                id="promotionalOffers"
                checked={notificationPreferences.promotionalOffers}
                onCheckedChange={(checked) => handleNotificationChange('promotionalOffers', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security & Privacy</CardTitle>
            <CardDescription>Manage your account security and data privacy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" onClick={() => toast({ title: "Change Password", description: "Password change flow would start here."})}>Change Password</Button>
            <Button variant="outline" onClick={() => router.push('/privacy-policy')}>
                <FileText className="mr-2 h-4 w-4"/> View Privacy Policy
            </Button>
            <Button variant="outline" onClick={() => router.push('/terms-of-service')}>
                <FileText className="mr-2 h-4 w-4"/> View Terms of Service
            </Button>
            <Button variant="destructive" className="w-full mt-4" onClick={() => toast({title: "Delete Account", description: "Account deletion is a critical action. This is a placeholder.", variant: "destructive"})}>
                Delete Account
            </Button>
            <p className="text-xs text-destructive-foreground bg-destructive p-2 rounded-md mt-1">Warning: Deleting your account is permanent and cannot be undone.</p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4"/> Logout
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
