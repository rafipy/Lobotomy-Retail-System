import { ItemGallery } from "./item-gallery";

export function AdminDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-red-500 rounded-xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2">
            Inventory Management
          </h2>
          <p className="text-gray-400 font-body">
            Browse and manage all items in the retail system
          </p>
        </div>

        <ItemGallery />
      </div>
    </div>
  );
}
