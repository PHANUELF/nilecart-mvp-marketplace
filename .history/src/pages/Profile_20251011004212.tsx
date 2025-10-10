import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Save, ArrowLeft, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    if (!authLoading && profile) {
      setFormData({
        full_name: profile.full_name || '',
        whatsapp_number: profile.whatsapp_number || '',
      });
    }
  }, [profile, authLoading]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          whatsapp_number: formData.whatsapp_number,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      whatsapp_number: profile?.whatsapp_number || '',
    });
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert>
              <AlertDescription>
                Please log in to view your profile.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your WhatsApp number"
                />
                <p className="text-xs text-muted-foreground">
                  This helps sellers contact you directly for orders
                </p>
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="px-3 py-2 bg-muted rounded-md">
                  <span className="capitalize font-medium">{profile.role}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                    {profile.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
