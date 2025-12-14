"use client";

import { Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditCardFormProps {
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardHolder: string;
  setCardHolder: (value: string) => void;
  expiryDate: string;
  setExpiryDate: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
}

// Format card number with spaces
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(" ") : value;
};

// Format expiry date
const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4);
  }
  return v;
};

export function CreditCardForm({
  cardNumber,
  setCardNumber,
  cardHolder,
  setCardHolder,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
}: CreditCardFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-300">Card Number *</Label>
        <Input
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 font-mono"
        />
      </div>
      <div>
        <Label className="text-gray-300">Cardholder Name *</Label>
        <Input
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
          placeholder="JOHN DOE"
          className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Expiry Date *</Label>
          <Input
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 font-mono"
          />
        </div>
        <div>
          <Label className="text-gray-300">CVV *</Label>
          <Input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 font-mono"
          />
        </div>
      </div>
      <div className="bg-teal-900/20 border border-teal-600/30 rounded-lg p-3 flex items-start gap-2">
        <Shield className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-300">
          Your payment information is encrypted and secure. We never store your full card details.
        </p>
      </div>
    </div>
  );
}
