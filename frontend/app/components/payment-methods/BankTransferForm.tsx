"use client";

import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankTransferFormProps {
  bankName: string;
  setBankName: (value: string) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
}

export function BankTransferForm({
  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
}: BankTransferFormProps) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Bank Transfer Instructions
        </h4>
        <p className="text-yellow-200/70 text-sm">
          Transfer the total amount to the following account. Your order will be processed once payment is confirmed.
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-gray-300">Bank: <span className="text-white font-mono">L. Corp Federal Bank</span></p>
          <p className="text-gray-300">Account: <span className="text-white font-mono">1234-5678-9012</span></p>
          <p className="text-gray-300">Swift: <span className="text-white font-mono">LCORPUS33</span></p>
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Your Bank Name</Label>
        <Input
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Enter your bank name"
          className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400"
        />
      </div>
      <div>
        <Label className="text-gray-300">Your Account Number</Label>
        <Input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter your account number"
          className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 font-mono"
        />
      </div>
    </div>
  );
}
