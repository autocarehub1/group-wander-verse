import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Shield, Palette, Globe, CreditCard, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    emailInvites: true,
    pushNotifications: true,
    expenseReminders: true,
    chatMessages: false,
    tripUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareLocation: false,
    allowFriendRequests: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion not available",
      description: "Please contact support to delete your account.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-sky py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-invites">Trip Invitations</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone invites you to a trip</p>
                    </div>
                    <Switch
                      id="email-invites"
                      checked={notifications.emailInvites}
                      onCheckedChange={(checked) => handleNotificationChange('emailInvites', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="expense-reminders">Expense Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about unpaid expenses</p>
                    </div>
                    <Switch
                      id="expense-reminders"
                      checked={notifications.expenseReminders}
                      onCheckedChange={(checked) => handleNotificationChange('expenseReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chat-messages">Chat Messages</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new group chat messages</p>
                    </div>
                    <Switch
                      id="chat-messages"
                      checked={notifications.chatMessages}
                      onCheckedChange={(checked) => handleNotificationChange('chatMessages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="trip-updates">Trip Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about itinerary and activity changes</p>
                    </div>
                    <Switch
                      id="trip-updates"
                      checked={notifications.tripUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('tripUpdates', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and how it's used
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visible">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
                    </div>
                    <Switch
                      id="profile-visible"
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-location">Share Location</Label>
                      <p className="text-sm text-muted-foreground">Allow sharing your location with trip members</p>
                    </div>
                    <Switch
                      id="share-location"
                      checked={privacy.shareLocation}
                      onCheckedChange={(checked) => handlePrivacyChange('shareLocation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="friend-requests">Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">Allow people to send you friend requests</p>
                    </div>
                    <Switch
                      id="friend-requests"
                      checked={privacy.allowFriendRequests}
                      onCheckedChange={(checked) => handlePrivacyChange('allowFriendRequests', checked)}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Data & Privacy</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your travel data is securely stored and never shared without your permission.
                    </p>
                    <Button variant="outline" size="sm">
                      Download My Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance & Display
                  </CardTitle>
                  <CardDescription>
                    Customize how WanderTogether looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
                    <div className="grid grid-cols-3 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded mb-2"></div>
                        Light
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <div className="w-4 h-4 bg-gray-800 rounded mb-2"></div>
                        Dark
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-base font-medium">Language</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose your preferred language</p>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-base font-medium">Default Currency</Label>
                    <p className="text-sm text-muted-foreground mb-4">Currency for expenses and budgets</p>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Manage your account details and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current-email">Email Address</Label>
                      <Input 
                        id="current-email" 
                        value={user?.email || ""} 
                        disabled 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          type="password" 
                          value="••••••••" 
                          disabled 
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        Update Account Information
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        WanderTogether is currently free to use during our beta period.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No subscription or payment method required.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Trash2 className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. This will permanently delete your profile, trips, and all associated data.
                        </p>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;