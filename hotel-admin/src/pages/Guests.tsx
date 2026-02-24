import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { guestService } from '@/lib/database';
import { Guest } from '@/types/hotel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Phone, MapPin, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WalkInGuestDialog } from '@/components/WalkInGuestDialog';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    contact_number: '',
    street: '',
    city: '',
    state_province: '',
    zip_code: '',
    country: '',
  });

  const loadGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (err) {
      console.error('Error loading guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGuests(); }, []);

  const filteredGuests = guests.filter(
    (guest) =>
      guest.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.contact_number || '').includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({ username: '', password: '', email: '', first_name: '', last_name: '', contact_number: '', street: '', city: '', state_province: '', zip_code: '', country: '' });
  };

  const handleAddGuest = async () => {
    if (!formData.username || !formData.password || !formData.email || !formData.first_name || !formData.last_name) {
      toast({ title: 'Error', description: 'Username, password, email, first and last name are required', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast({ title: 'Error', description: 'Password must contain uppercase, lowercase, number, and special character', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await guestService.create({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number || null,
        street: formData.street || null,
        city: formData.city || null,
        state_province: formData.state_province || null,
        zip_code: formData.zip_code || null,
        country: formData.country || null,
      } as any);
      toast({ title: 'Success', description: 'Guest added successfully' });
      setIsAddDialogOpen(false);
      resetForm();
      loadGuests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditGuest = async () => {
    if (!selectedGuest) return;
    setSaving(true);
    try {
      await guestService.update(selectedGuest.guest_id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number || null,
        street: formData.street || null,
        city: formData.city || null,
        state_province: formData.state_province || null,
        zip_code: formData.zip_code || null,
        country: formData.country || null,
      });
      toast({ title: 'Success', description: 'Guest updated successfully' });
      setIsEditDialogOpen(false);
      loadGuests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (id: number) => {
    try {
      await guestService.delete(id);
      toast({ title: 'Success', description: 'Guest deleted successfully' });
      loadGuests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      contact_number: guest.contact_number || '',
      street: guest.street || '',
      city: guest.city || '',
      state_province: guest.state_province || '',
      zip_code: guest.zip_code || '',
      country: guest.country || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout title="Guests" subtitle="Manage guest information and records">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <WalkInGuestDialog onGuestCreated={loadGuests} />
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-red hover:opacity-90 text-primary-foreground shadow-red">
                <Plus className="w-4 h-4 mr-2" />
                Add Online Guest
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Guest</DialogTitle>
              <DialogDescription>Enter the guest's personal information below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input id="username" placeholder="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="guest@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="Aa1!@example (uppercase, lowercase, number, special char)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Juan" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Dela Cruz" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input id="phone" placeholder="09123456789" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" placeholder="123 Main St." value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Manila" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Province/State</Label>
                  <Input id="state" placeholder="Metro Manila" value={formData.state_province} onChange={(e) => setFormData({ ...formData, state_province: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" placeholder="1000" value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Philippines" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-red hover:opacity-90 text-primary-foreground" onClick={handleAddGuest} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Guest'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>GuestID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => (
              <TableRow key={guest.guest_id} className="hover:bg-secondary/20">
                <TableCell className="font-mono text-sm">{guest.guest_id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-red flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {guest.first_name[0]}{guest.last_name[0]}
                    </div>
                    <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {guest.contact_number || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {[guest.city, guest.country].filter(Boolean).join(', ') || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedGuest(guest); setIsViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(guest)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteGuest(guest.guest_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>

      {/* View Guest Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Guest Details</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xl font-semibold">
                  {selectedGuest.first_name[0]}{selectedGuest.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold">{selectedGuest.first_name} {selectedGuest.last_name}</h3>
                  <p className="text-sm text-muted-foreground">GuestID: {selectedGuest.guest_id}</p>
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedGuest.contact_number || 'No contact number'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    {selectedGuest.street && <p>{selectedGuest.street}</p>}
                    <p>{[selectedGuest.city, selectedGuest.state_province].filter(Boolean).join(', ') || 'No address'}</p>
                    {(selectedGuest.zip_code || selectedGuest.country) && (
                      <p className="text-muted-foreground text-sm">{[selectedGuest.zip_code, selectedGuest.country].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Guest</DialogTitle>
            <DialogDescription>Update the guest's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Street</Label>
              <Input value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Province/State</Label>
                <Input value={formData.state_province} onChange={(e) => setFormData({ ...formData, state_province: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleEditGuest} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
