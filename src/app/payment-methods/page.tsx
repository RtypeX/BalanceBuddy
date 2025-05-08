
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, PlusCircle, Trash2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expiry: string; // MM/YY
  isDefault: boolean;
}

// Dummy data for payment methods
const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm_1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
  { id: 'pm_2', type: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false },
];

const PaymentMethodsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding a new card (simplified)
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCVC, setNewCardCVC] = useState('');


  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
    toast({ title: "Default Payment Method Updated" });
  };

  const handleRemoveMethod = (id: string) => {
    if (paymentMethods.find(pm => pm.id === id)?.isDefault && paymentMethods.length > 1) {
        toast({ variant: "destructive", title: "Cannot Remove Default", description: "Please set another card as default before removing this one."});
        return;
    }
    if (paymentMethods.length === 1) {
        toast({ variant: "destructive", title: "Cannot Remove Last Card", description: "You must have at least one payment method."});
        return;
    }
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    toast({ title: "Payment Method Removed" });
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (in a real app, use Stripe Elements or similar for PCI compliance)
    if (!newCardNumber.match(/^\d{16}$/) || !newCardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/) || !newCardCVC.match(/^\d{3,4}$/)) {
        toast({ variant: "destructive", title: "Invalid Card Details", description: "Please check your card number, expiry (MM/YY), and CVC."});
        return;
    }
    const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'Visa', // Determine card type based on number in a real app
        last4: newCardNumber.slice(-4),
        expiry: newCardExpiry,
        isDefault: paymentMethods.length === 0 // Make default if it's the first card
    };
    setPaymentMethods(prev => [...prev, newMethod]);
    toast({ title: "New Payment Method Added"});
    setShowAddForm(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCVC('');
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
      <div className="flex items-center justify-between p-4 w-full max-w-2xl mb-4">
        <h1 className="text-2xl font-semibold">Manage Payment Methods</h1>
        <Button variant="secondary" onClick={() => router.push('/settings')}>Back to Settings</Button>
      </div>
      <Card className="w-full max-w-2xl shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Your Saved Payment Methods</CardTitle>
          <CardDescription>Add, remove, or set your default payment method.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethods.length === 0 && !showAddForm ? (
            <p className="text-center text-muted-foreground py-8">No payment methods saved. Add one below.</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <Card key={pm.id} className={`p-4 flex justify-between items-center ${pm.isDefault ? 'border-primary' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{pm.type} ending in {pm.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires: {pm.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pm.isDefault ? (
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Default</span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(pm.id)}>Set as Default</Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveMethod(pm.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove card</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showAddForm ? (
            <form onSubmit={handleAddNewCard} className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Add New Card</h3>
                 <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" type="text" value={newCardNumber} onChange={e => setNewCardNumber(e.target.value)} placeholder="•••• •••• •••• ••••" maxLength={16} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cardExpiry">Expiry Date (MM/YY)</Label>
                        <Input id="cardExpiry" type="text" value={newCardExpiry} onChange={e => setNewCardExpiry(e.target.value)} placeholder="MM/YY" />
                    </div>
                    <div>
                        <Label htmlFor="cardCVC">CVC</Label>
                        <Input id="cardCVC" type="text" value={newCardCVC} onChange={e => setNewCardCVC(e.target.value)} placeholder="•••" maxLength={4} />
                    </div>
                 </div>
                <div className="flex gap-2">
                    <Button type="submit">Save Card</Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
                 <p className="text-xs text-muted-foreground">Your payment information is securely handled. (This is a demo)</p>
            </form>
          ) : (
             <Button onClick={() => setShowAddForm(true)} className="w-full mt-6">
                <PlusCircle className="mr-2 h-4 w-4"/> Add New Payment Method
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsPage;
