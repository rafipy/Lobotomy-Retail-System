"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EWalletFormProps {
  walletType: string;
  setWalletType: (value: string) => void;
  walletId: string;
  setWalletId: (value: string) => void;
}

export function EWalletForm({
  walletType,
  setWalletType,
  walletId,
  setWalletId,
}: EWalletFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-300">Select E-Wallet</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {["GCash", "PayMaya", "GrabPay"].map((wallet) => (
            <button
              key={wallet}
              onClick={() => setWalletType(wallet.toLowerCase())}
              className={`p-3 rounded-lg border-2 transition-all ${
                walletType === wallet.toLowerCase()
                  ? "border-teal-400 bg-teal-900/30 text-teal-200"
                  : "border-teal-600/50 bg-black/30 text-gray-400 hover:border-teal-500"
              }`}
            >
              {wallet}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Mobile Number *</Label>
        <Input
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          placeholder="+63 9XX XXX XXXX"
          className="bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400"
        />
      </div>
      <div className="bg-teal-900/20 border border-teal-600/30 rounded-lg p-3">
        <p className="text-xs text-teal-300">
          You will receive a payment request on your {walletType.charAt(0).toUpperCase() + walletType.slice(1)} app.
        </p>
      </div>
    </div>
  );
}
