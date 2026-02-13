import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  Shield, 
  UserCog, 
  User,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import type { AccountProfile, UserRole } from '@/types/hotel';

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Administrator', icon: Shield, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  staff: { label: 'Staff', icon: UserCog, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  user: { label: 'Guest', icon: User, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export default function Accounts() {
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AccountProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleEditRole = (profile: AccountProfile) => {
    setSelectedProfile(profile);
    setNewRole(profile.role);
    setEditDialog(true);
  };

  const handleSaveRole = async () => {
    if (!selectedProfile) return;
    
    // Prevent admin from demoting themselves
    if (selectedProfile.username === user?.username && newRole !== 'admin') {
      toast({
        title: 'Cannot demote yourself',
        description: 'You cannot change your own admin role',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await profileService.updateRole(selectedProfile.id, newRole);
      setProfiles(profiles.map(p => 
        p.id === selectedProfile.id ? { ...p, role: newRole } : p
      ));
      toast({
        title: 'Role updated',
        description: `${selectedProfile.full_name || 'User'} is now ${roleConfig[newRole].label}`,
      });
      setEditDialog(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(query) ||
      profile.role.toLowerCase().includes(query)
    );
  });

  const roleCounts = {
    admin: profiles.filter(p => p.role === 'admin').length,
    staff: profiles.filter(p => p.role === 'staff').length,
    user: profiles.filter(p => p.role === 'user').length,
  };

  return (
    <DashboardLayout title="User Accounts" subtitle="Manage system access and roles">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">User Accounts</h1>
            <p className="text-muted-foreground mt-1">
              Manage system access and roles
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchProfiles}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Role Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.admin][]).map(([role, config]) => (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}s</CardTitle>
                <config.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleCounts[role]}</div>
                <p className="text-xs text-muted-foreground">
                  {role === 'admin' && 'Full system access'}
                  {role === 'staff' && 'Front desk operations'}
                  {role === 'user' && 'Guest booking access'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading accounts...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No accounts found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => {
                  const config = roleConfig[profile.role];
                  const isCurrentUser = profile.username === user?.username;
                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <config.icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {profile.full_name || 'Unnamed User'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {profile.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(profile)}
                          disabled={isCurrentUser}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">How to add new staff or admin accounts:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Have the person register at the login page (they'll get a "Guest" role by default)</li>
              <li>Find their account in the list above</li>
              <li>Click "Change Role" and promote them to Staff or Administrator</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the access level for {selectedProfile?.full_name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(val) => setNewRole(val as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Guest - Can view rooms and make reservations
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4" />
                    Staff - Manage guests, rooms, reservations, payments
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Administrator - Full system access
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
