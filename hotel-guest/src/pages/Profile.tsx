import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Loader2,
  Save,
  Shield,
  Sparkles,
  Building2,
  Globe,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { guestService } from '@/lib/database';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    street: '',
    city: '',
    state_province: '',
    zip_code: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        street: user.street || '',
        city: user.city || '',
        state_province: user.state_province || '',
        zip_code: user.zip_code || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: 'Missing information',
        description: 'First name and last name are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await guestService.updateProfile(user.guest_id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        contact_number: formData.contact_number.trim() || null,
        street: formData.street.trim() || null,
        city: formData.city.trim() || null,
        state_province: formData.state_province.trim() || null,
        zip_code: formData.zip_code.trim() || null,
        country: formData.country.trim() || null,
      });
      setEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : '?';

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/90 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzEzIDAgNi0yLjY4NyA2LTZIMGY2IDAgNi0yLjY4NyA2LTZzLTIuNjg3LTYtNi02LTYgMi42ODctNiA2IDIuNjg3IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-red shadow-red flex items-center justify-center text-2xl font-display font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-xs font-medium uppercase tracking-wider">
                Guest Profile
              </span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-sidebar-foreground">
              {user?.first_name} {user?.last_name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sidebar-foreground/80 text-sm">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5 text-sidebar-foreground/80 text-sm">
                <Shield className="w-3.5 h-3.5" />
                @{user?.username}
              </span>
              {user?.created_at && (
                <span className="flex items-center gap-1.5 text-sidebar-foreground/80 text-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Member since{' '}
                  {format(new Date(user.created_at), 'MMM yyyy')}
                </span>
              )}
            </div>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              className="border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-foreground/10 shrink-0"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="border-red-500/50 text-red-500 shrink-0"
            >
              Editing
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">
                  Personal Information
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    disabled={!editing}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    disabled={!editing}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!editing}
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact"
                      value={formData.contact_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_number: e.target.value,
                        })
                      }
                      disabled={!editing}
                      placeholder="09123456789"
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">
                  Address
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="123 Main St."
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="Manila"
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateProvince">State / Province</Label>
                  <Input
                    id="stateProvince"
                    value={formData.state_province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state_province: e.target.value,
                      })
                    }
                    disabled={!editing}
                    placeholder="Metro Manila"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zip_code: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="1000"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="Philippines"
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Save / Cancel */}
              {editing && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      if (user) {
                        setFormData({
                          first_name: user.first_name || '',
                          last_name: user.last_name || '',
                          email: user.email || '',
                          contact_number: user.contact_number || '',
                          street: user.street || '',
                          city: user.city || '',
                          state_province: user.state_province || '',
                          zip_code: user.zip_code || '',
                          country: user.country || '',
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-red hover:opacity-90 text-primary-foreground shadow-red"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Account Details
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Guest ID
                  </span>
                  <Badge variant="secondary"># {user?.guest_id}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Username
                  </span>
                  <span className="text-sm font-medium">
                    @{user?.username}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Role
                  </span>
                  <Badge className="bg-gradient-red text-primary-foreground">
                    Guest
                  </Badge>
                </div>
                {user?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Joined
                    </span>
                    <span className="text-sm font-medium">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-3">
                Need Help?
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Our concierge team is available 24/7 to assist you with any
                questions about your stay.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>+63 (2) 8888-7777</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>concierge@grandromeo.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
