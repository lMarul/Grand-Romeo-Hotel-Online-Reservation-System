import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { roomService, reservationService, paymentService } from '@/lib/database';
import { Room } from '@/types/hotel';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  BedDouble,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BookRoomPage() {
  const { roomNumber } = useParams<{ roomNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Booking form data
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [totalGuests, setTotalGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment form data
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Calculated values
  const [nights, setNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadRoom();
  }, [roomNumber]);

  useEffect(() => {
    calculateTotal();
  }, [checkInDate, checkOutDate, room]);

  const loadRoom = async () => {
    if (!roomNumber) {
      navigate('/rooms');
      return;
    }

    try {
      setLoading(true);
      const roomData = await roomService.getByNumber(roomNumber);
      
      if (!roomData) {
        toast({
          variant: 'destructive',
          title: 'Room Not Found',
          description: 'The requested room does not exist.',
        });
        navigate('/rooms');
        return;
      }

      if (roomData.status !== 'Available') {
        toast({
          variant: 'destructive',
          title: 'Room Unavailable',
          description: 'This room is not currently available for booking.',
        });
        navigate('/rooms');
        return;
      }

      setRoom(roomData);
    } catch (error) {
      console.error('Error loading room:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load room details.',
      });
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) {
      setNights(0);
      setTotalAmount(0);
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      setNights(diffDays);
      setTotalAmount(diffDays * room.daily_rate);
    } else {
      setNights(0);
      setTotalAmount(0);
    }
  };

  const validateBooking = (): string | null => {
    if (!checkInDate) return 'Please select a check-in date';
    if (!checkOutDate) return 'Please select a check-out date';

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) return 'Check-in date cannot be in the past';
    if (checkOut <= checkIn) return 'Check-out date must be after check-in date';
    if (nights < 1) return 'Minimum stay is 1 night';
    if (totalGuests < 1) return 'At least 1 guest is required';
    if (room && totalGuests > room.capacity) {
      return `This room can accommodate maximum ${room.capacity} guests`;
    }

    // Payment validation
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        return 'Please enter a valid 16-digit card number';
      }
      if (!cardName) return 'Please enter cardholder name';
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return 'Please enter expiry date in MM/YY format';
      }
      if (!cvv || cvv.length !== 3) return 'Please enter a valid 3-digit CVV';
    }

    return null;
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  };

  const handleBooking = async () => {
    const validationError = validateBooking();
    if (validationError) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: validationError,
      });
      return;
    }

    if (!user || !room) return;

    setBooking(true);

    try {
      // Create reservation
      const reservation = await reservationService.create({
        guest_id: user.guest_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_guests: totalGuests,
        special_requests: specialRequests || null,
        status: 'Pending Payment',
        is_walk_in: false,
        created_by_admin_id: null,
        created_by_front_desk_id: null,
      });

      // Link room to reservation
      await reservationService.addRoom(reservation.reservation_id, room.room_number);

      // Create payment record
      const transactionId = generateTransactionId();
      await paymentService.create({
        reservation_id: reservation.reservation_id,
        payment_date: new Date().toISOString().split('T')[0],
        amount_paid: totalAmount,
        payment_method: paymentMethod as any,
        transaction_id: transactionId,
        payment_status: 'Completed',
        refund_amount: 0,
        notes: `Booking for Room ${room.room_number}`,
      });

      // Update reservation status to Confirmed
      await reservationService.update(reservation.reservation_id, {
        status: 'Confirmed',
      });

      // Update room status to Reserved
      await roomService.update(room.room_number, {
        status: 'Reserved',
      });

      toast({
        title: 'Booking Confirmed!',
        description: `Your reservation for Room ${room.room_number} has been confirmed.`,
      });

      // Navigate to reservations page
      navigate('/my-reservations');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Failed to complete booking. Please try again.',
      });
    } finally {
      setBooking(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  if (loading) {
    return (
      <DashboardLayout title="Book Room">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <DashboardLayout
      title="Book Your Room"
      subtitle={`Complete your reservation for Room ${room.room_number}`}
    >
      <Button
        variant="ghost"
        onClick={() => navigate('/rooms')}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Rooms
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Booking Form - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {room.image_url && (
                  <img
                    src={room.image_url}
                    alt={room.room_type}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{room.room_type} Room</h3>
                    <Badge variant="outline">Room {room.room_number}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {room.description || `Comfortable ${room.room_type.toLowerCase()} room with ${room.bed_type.toLowerCase()} bed`}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4 text-muted-foreground" />
                      <span>{room.bed_type} Bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Up to {room.capacity} guests</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Booking Details
              </CardTitle>
              <CardDescription>Select your check-in and check-out dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-In Date *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-Out Date *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests *</Label>
                <Select
                  value={totalGuests.toString()}
                  onValueChange={(value) => setTotalGuests(parseInt(value))}
                >
                  <SelectTrigger id="guests">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Information
              </CardTitle>
              <CardDescription>Enter your payment details to confirm booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash (Pay at Hotel)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      placeholder="JOHN DOE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date *</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setExpiryDate(value);
                        }}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'Cash' && (
                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You will pay at the hotel reception upon check-in. Please bring the booking
                    confirmation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary - Right Side */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium">{room.room_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Number</span>
                  <span className="font-medium">#{room.room_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{totalGuests}</span>
                </div>
                {checkInDate && checkOutDate && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Check-In</span>
                      <span className="font-medium">
                        {new Date(checkInDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Check-Out</span>
                      <span className="font-medium">
                        {new Date(checkOutDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Number of Nights</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₱{Number(room.daily_rate).toLocaleString()} × {nights || 0} night{nights !== 1 ? 's' : ''}
                  </span>
                  <span className="font-medium">
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₱{totalAmount.toLocaleString()}
                </span>
              </div>

              <Button
                className="w-full h-12 bg-gradient-red hover:opacity-90 shadow-red"
                onClick={handleBooking}
                disabled={booking || nights < 1}
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By confirming, you agree to our booking terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
