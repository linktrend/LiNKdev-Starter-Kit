'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, DollarSign, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (method: 'card' | 'paypal' | 'crypto', data: any) => void;
}

type PaymentMethod = 'card' | 'paypal' | 'crypto';

export function AddPaymentMethodModal({ isOpen, onClose, onAdd }: AddPaymentMethodModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // PayPal form state
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // Crypto form state
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e75');
  const [transactionHash, setTransactionHash] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const handleSubmit = () => {
    let data = {};
    
    if (selectedMethod === 'card') {
      data = { cardNumber, cardholderName, expiry, cvv };
    } else if (selectedMethod === 'paypal') {
      data = { email: paypalEmail };
    } else if (selectedMethod === 'crypto') {
      data = { walletAddress, transactionHash, amountPaid };
    }
    
    onAdd(selectedMethod, data);
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg border shadow-2xl modal-bg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add Payment Method</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Payment Method</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <CreditCard className={`h-6 w-6 mx-auto mb-2 ${selectedMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${selectedMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Card
                </span>
              </button>
              
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'paypal'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <DollarSign className={`h-6 w-6 mx-auto mb-2 ${selectedMethod === 'paypal' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${selectedMethod === 'paypal' ? 'text-primary' : 'text-muted-foreground'}`}>
                  PayPal
                </span>
              </button>
              
              <button
                onClick={() => setSelectedMethod('crypto')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'crypto'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <span className={`text-2xl font-bold mx-auto block mb-2 ${selectedMethod === 'crypto' ? 'text-primary' : 'text-muted-foreground'}`}>
                  ₿
                </span>
                <span className={`text-sm font-medium ${selectedMethod === 'crypto' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Crypto
                </span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-medium">
                  Card Number *
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="cardholderName" className="text-sm font-medium">
                  Cardholder Name *
                </Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="text-sm font-medium">
                    Expiry *
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cvv" className="text-sm font-medium">
                    CVV *
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'paypal' && (
            <div>
              <Label htmlFor="paypalEmail" className="text-sm font-medium">
                PayPal Email *
              </Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="your.email@example.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {selectedMethod === 'crypto' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Company Wallet Address (USDT ERC20)
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={walletAddress}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopy}
                    className="px-4"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="transactionHash" className="text-sm font-medium">
                  Transaction Hash *
                </Label>
                <Input
                  id="transactionHash"
                  placeholder="0x..."
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="mt-2 font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="amountPaid" className="text-sm font-medium">
                  Amount Paid (USDT) *
                </Label>
                <Input
                  id="amountPaid"
                  type="number"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              Add Payment Method
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

