import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { staffService } from '@/lib/database';
import { Staff, StaffRole } from '@/types/hotel';
import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Phone, Pencil, Trash2, Eye, UserCog, Users, Briefcase, Wrench, ConciergeBell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const roleStyles: Record<StaffRole, string> = {
  'Manager': 'bg-primary/10 text-primary border-primary/30',
  'Receptionist': 'bg-info/10 text-info border-info/30',
  'Concierge': 'bg-gold/20 text-gold-dark border-gold/30',
  'Housekeeping': 'bg-success/10 text-success border-success/30',
  'Maintenance': 'bg-warning/10 text-warning border-warning/30',
};

const roleIcons: Record<StaffRole, typeof UserCog> = {
  'Manager': UserCog,
  'Receptionist': Users,
  'Concierge': ConciergeBell,
  'Housekeeping': Briefcase,
  'Maintenance': Wrench,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'Receptionist' as StaffRole,
    contact_number: '',
  });

  const loadStaff = async () => {
    try {
      const data = await staffService.getAll();
      setStaff(data);
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      (member.contact_number || '').includes(searchQuery);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast({ title: 'Error', description: 'First and last name are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await staffService.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        contact_number: formData.contact_number || null,
      });
      toast({ title: 'Success', description: 'Staff member added' });
      setIsAddDialogOpen(false);
      setFormData({ first_name: '', last_name: '', role: 'Receptionist', contact_number: '' });
      loadStaff();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      await staffService.update(selectedStaff.staff_id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        contact_number: formData.contact_number || null,
      });
      toast({ title: 'Success', description: 'Staff member updated' });
      setIsEditDialogOpen(false);
      loadStaff();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await staffService.delete(id);
      toast({ title: 'Success', description: 'Staff member deleted' });
      loadStaff();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEdit = (member: Staff) => {
    setSelectedStaff(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      contact_number: member.contact_number || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout title="Staff" subtitle="Manage hotel staff and roles">
      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {(['Manager', 'Receptionist', 'Concierge', 'Housekeeping', 'Maintenance'] as StaffRole[]).map((role) => {
          const count = staff.filter(s => s.role === role).length;
          const Icon = roleIcons[role];
          return (
            <div key={role} className="bg-card rounded-lg border border-border p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", roleStyles[role].split(' ')[0])}>
                <Icon className={cn("w-4 h-4", roleStyles[role].split(' ')[1])} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter by role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Receptionist">Receptionist</SelectItem>
              <SelectItem value="Concierge">Concierge</SelectItem>
              <SelectItem value="Housekeeping">Housekeeping</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Plus className="w-4 h-4 mr-2" />Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add Staff Member</DialogTitle>
              <DialogDescription>Enter the staff member's information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="Juan" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Dela Cruz" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input placeholder="09123456789" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val as StaffRole })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Concierge">Concierge</SelectItem>
                      <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleCreate} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Staff'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Staff ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => {
              const Icon = roleIcons[member.role];
              return (
                <TableRow key={member.staff_id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono text-sm">{member.staff_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-cream text-sm font-medium">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border flex items-center gap-1 w-fit", roleStyles[member.role])}>
                      <Icon className="w-3 h-3" />
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {member.contact_number || '-'}
                    </div>
                  </TableCell>
                  {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStaff(member); setIsViewDialogOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(member.staff_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      )}

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-cream text-xl font-semibold">
                  {selectedStaff.first_name[0]}{selectedStaff.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold">
                    {selectedStaff.first_name} {selectedStaff.last_name}
                  </h3>
                  <Badge variant="outline" className={cn("border mt-1", roleStyles[selectedStaff.role])}>
                    {selectedStaff.role}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedStaff.contact_number || 'No contact number'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>Staff ID: {selectedStaff.staff_id}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Staff Member</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val as StaffRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                    <SelectItem value="Concierge">Concierge</SelectItem>
                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleEdit} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
