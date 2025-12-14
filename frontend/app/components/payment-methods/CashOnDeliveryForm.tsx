import { Banknote } from "lucide-react";

interface CashOnDeliveryFormProps {
  total: number;
}

export function CashOnDeliveryForm({ total }: CashOnDeliveryFormProps) {
  return (
    <div className="bg-teal-900/20 border border-teal-600/30 rounded-lg p-4">
      <h4 className="text-teal-400 font-semibold mb-2 flex items-center gap-2">
        <Banknote className="h-4 w-4" />
        Cash on Delivery
      </h4>
      <p className="text-teal-200/70 text-sm">
        Pay in cash when your order is delivered. Please prepare the exact amount of <span className="text-yellow-400 font-bold">${total.toFixed(2)}</span> for faster transaction.
      </p>
      <p className="text-gray-400 text-xs mt-2">
        Note: A verification call may be made before dispatch.
      </p>
    </div>
  );
}
