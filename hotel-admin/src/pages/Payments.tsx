import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { paymentService, reservationService } from '@/lib/database';
import { Payment, PaymentMethod, Reservation } from '@/types/hotel';
import { format } from 'date-fns';
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
import { Plus, Search, CreditCard, Banknote, Building, Wallet, Loader2, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const paymentMethodIcons: Record<PaymentMethod, typeof CreditCard> = {
  'Cash': Banknote,
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Bank Transfer': Building,
  'Digital Wallet': Wallet,
};

const paymentMethodStyles: Record<PaymentMethod, string> = {
  'Cash': 'bg-success/10 text-success border-success/30',
  'Credit Card': 'bg-info/10 text-info border-info/30',
  'Debit Card': 'bg-info/10 text-info border-info/30',
  'Bank Transfer': 'bg-primary/10 text-primary border-primary/30',
  'Digital Wallet': 'bg-warning/10 text-warning border-warning/30',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isStaff } = useAuth();

  const [formData, setFormData] = useState({
    reservation_id: '',
    amount_paid: 0,
    payment_method: 'Cash' as PaymentMethod,
    transaction_id: '',
  });

  const [editFormData, setEditFormData] = useState({
    amount_paid: 0,
    payment_method: 'Cash' as PaymentMethod,
    payment_date: '',
    transaction_id: '',
  });

  const loadData = async () => {
    try {
      const [payData, resData] = await Promise.all([
        paymentService.getAll(),
        reservationService.getAll(),
      ]);
      setPayments(payData);
      setReservations(resData);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(payment.reservation_id).includes(searchQuery);
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const handleCreate = async () => {
    if (!formData.reservation_id || !formData.amount_paid) {
      toast({ title: 'Error', description: 'Reservation and amount are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await paymentService.create({
        reservation_id: parseInt(formData.reservation_id),
        amount_paid: formData.amount_paid,
        payment_method: formData.payment_method,
        payment_date: new Date().toISOString().split('T')[0],
        transaction_id: formData.transaction_id || null,
      });
      toast({ title: 'Success', description: 'Payment recorded' });
      setIsAddDialogOpen(false);
      setFormData({ reservation_id: '', amount_paid: 0, payment_method: 'Cash', transaction_id: '' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await paymentService.delete(id);
      toast({ title: 'Success', description: 'Payment deleted' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleEditClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditFormData({
      amount_paid: payment.amount_paid,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      transaction_id: payment.transaction_id || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedPayment || !editFormData.amount_paid) {
      toast({ title: 'Error', description: 'Amount is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await paymentService.update(selectedPayment.payment_id, {
        amount_paid: editFormData.amount_paid,
        payment_method: editFormData.payment_method,
        payment_date: editFormData.payment_date,
        transaction_id: editFormData.transaction_id || null,
      });
      toast({ title: 'Success', description: 'Payment updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Payments" subtitle="Track and manage payment transactions">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            ₱{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            {payments.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Average Transaction</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            ₱{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by transaction or reservation ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Payment method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Debit Card">Debit Card</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(isAdmin || isStaff) && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Plus className="w-4 h-4 mr-2" />Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Record Payment</DialogTitle>
              <DialogDescription>Add a new payment transaction.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Reservation</Label>
                <Select value={formData.reservation_id} onValueChange={(val) => setFormData({ ...formData, reservation_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Select reservation" /></SelectTrigger>
                  <SelectContent>
                    {reservations.map((res) => (
                      <SelectItem key={res.reservation_id} value={String(res.reservation_id)}>
                        #{res.reservation_id} - {res.guest?.first_name} {res.guest?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₱)</Label>
                  <Input type="number" min="0" value={formData.amount_paid || ''} onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val as PaymentMethod })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Transaction ID (optional)</Label>
                <Input placeholder="TXN123456" value={formData.transaction_id} onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleCreate} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording...</> : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Payment ID</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Reservation</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => {
              const guest = payment.reservation?.guest;
              const Icon = paymentMethodIcons[payment.payment_method];
              return (
                <TableRow key={payment.payment_id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono text-sm">{payment.payment_id}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.transaction_id || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      #{payment.reservation_id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-medium">
                          {guest.first_name[0]}{guest.last_name[0]}
                        </div>
                        <span className="text-sm">{guest.first_name} {guest.last_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border flex items-center gap-1 w-fit", paymentMethodStyles[payment.payment_method])}>
                      <Icon className="w-3 h-3" />
                      {payment.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-display text-lg font-semibold text-foreground">
                    ₱{Number(payment.amount_paid).toLocaleString()}
                  </TableCell>
                  {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleEditClick(payment)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(payment.payment_id)}>
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

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Payment</DialogTitle>
            <DialogDescription>Update payment details</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reservation</p>
                <p className="font-semibold">
                  #{selectedPayment.reservation_id} - {selectedPayment.reservation?.guest?.first_name} {selectedPayment.reservation?.guest?.last_name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₱)</Label>
                  <Input type="number" min="0" value={editFormData.amount_paid || ''} onChange={(e) => setEditFormData({ ...editFormData, amount_paid: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={editFormData.payment_method} onValueChange={(val) => setEditFormData({ ...editFormData, payment_method: val as PaymentMethod })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={editFormData.payment_date} onChange={(e) => setEditFormData({ ...editFormData, payment_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Transaction ID (optional)</Label>
                <Input placeholder="TXN123456" value={editFormData.transaction_id} onChange={(e) => setEditFormData({ ...editFormData, transaction_id: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleEditSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
