"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// Card components - using div instead since Card UI component isn't available

/**
 * WHY THIS COMPONENT EXISTS:
 * Users need a centralized place to: 
 * 1. View their account information
 * 2. Edit personal details
 * 3. Change password
 * 4. See account statistics
 * 
 * WHAT IT DOES:
 * - Fetches user data from backend
 * - Displays editable form fields
 * - Saves changes to database
 * - Shows real-time feedback (loading, success, errors)
 */

interface UserProfile {
  user_id: number;
  username: string;
  role: string;
  created_at: string;
  customer_id?:  number;
  first_name?:  string;
  last_name?:  string;
  email?:  string;
  phone_number?: string;
  address?:  string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

interface UserStats {
  total_orders: number;
  total_spent: number;
  completed_orders: number;
}

export default function SettingsPage() {
  const router = useRouter();
  
  // State for user profile data
  // WHY: React needs state to re-render when data changes
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  
  // State for form fields (editable values)
  // WHY SEPARATE: We need original data (profile) and edited data (formData)
  // This allows "Cancel" button to revert to original
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Get current user ID from localStorage
  // WHY: We need to know which user's data to fetch
  const userId = parseInt(localStorage.getItem("user_id") || "0");
  const userRole = localStorage.getItem("role") || "customer";
  
  // Determine color scheme based on role
  const isAdmin = userRole === "admin";
  const borderColor = isAdmin ? "border-red-500" : "border-teal-500";
  const textAccent = isAdmin ? "text-red-200" : "text-teal-200";
  const buttonBg = isAdmin ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700";
  const inputBorder = isAdmin ? "border-red-600" : "border-teal-600";
  
  /**
   * Fetch user profile on component mount
   * WHY useEffect:  Runs after component renders, perfect for data fetching
   * WHY empty dependency []: Only run once when component first loads
   */
  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);
  
  /**
   * Fetch user profile from API
   * WHAT IT DOES: 
   * 1. Calls GET /api/users/{userId}/profile
   * 2. Stores data in 'profile' state
   * 3. Populates form fields with current data
   */
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/profile`);
      
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      
      const data:  UserProfile = await response.json();
      setProfile(data);
      
      // Populate form with current data
      // WHY: Form should show current values for editing
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        city: data.city || "",
        postal_code: data. postal_code || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch user statistics
   * WHY:  Shows user their order history summary
   */
  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/statistics`);
      if (response.ok) {
        const data:  UserStats = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  
  /**
   * Handle form field changes
   * WHY: React controlled components - form fields must update state
   * WHAT IT DOES:  When user types, updates formData state with new value
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  /**
   * Save profile changes to database
   * WHAT IT DOES:
   * 1. Sends PUT request with updated data
   * 2. Only sends fields that were actually changed (efficient!)
   * 3. Updates local state with new data
   * 4. Shows success/error message
   */
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Build object with only changed fields
      // WHY: More efficient, doesn't update unchanged fields
      const updates:  any = {};
      Object.keys(formData).forEach((key) => {
        const formValue = formData[key as keyof typeof formData];
        const profileValue = profile?.[key as keyof UserProfile];
        
        // Only include if value changed
        if (formValue !== profileValue) {
          updates[key] = formValue || null; // null for empty strings
        }
      });
      
      if (Object.keys(updates).length === 0) {
        setMessage({ type: "success", text:  "No changes to save" });
        setSaving(false);
        return;
      }
      
      console.log("Sending updates:", updates);
      
      const response = await fetch(`http://localhost:8000/api/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update profile");
      }
      
      // Refresh profile data to show saved changes
      await fetchUserProfile();
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Change password
   * WHAT IT DOES:
   * 1. Validates passwords match
   * 2. Sends PUT request with password data
   * 3. Clears password fields on success
   */
  const handleChangePassword = async () => {
    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setMessage({ type:  "error", text: "Password must be at least 8 characters" });
      return;
    }
    
    setChangingPassword(true);
    setMessage(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to change password");
      }
      
      setMessage({ type: "success", text: "Password changed successfully!" });
      
      // Clear password fields
      setPasswordData({
        current_password: "",
        new_password:  "",
        confirm_password: "",
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type:  "error",
        text: error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={`h-8 w-8 animate-spin ${isAdmin ? 'text-red-400' : 'text-teal-400'}`} />
      </div>
    );
  }
  
  if (! profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-gray-400">Failed to load profile</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-heading font-bold ${textAccent}`}>
          Account Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account information and preferences
        </p>
      </div>
      
      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-2 ${
            message. type === "success"
              ? "bg-green-900/20 border-green-500 text-green-400"
              : "bg-red-900/20 border-red-500 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Info Card */}
          <div className={`bg-black/60 border-2 ${borderColor} rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textAccent} mb-4`}>Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Username:</span>
                <p className="text-white font-semibold">{profile.username}</p>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <p className="text-white font-semibold capitalize">{profile.role}</p>
              </div>
              <div>
                <span className="text-gray-400">Member Since:</span>
                <p className="text-white">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Statistics Card (for customers) */}
          {userRole === "customer" && stats && (
            <div className={`bg-black/60 border-2 ${borderColor} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${textAccent} mb-4`}>Your Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-900/30 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
                    <p className="text-xs text-gray-400">Total Orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.completed_orders}</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ${stats.total_spent.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className={`bg-black/60 border-2 ${borderColor} rounded-xl p-6`}>
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textAccent}`}>Personal Information</h3>
              <p className="text-sm text-gray-400 mt-1">Update your personal details</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target. value)}
                    className={`bg-black/50 ${inputBorder} text-white`}
                  />
                </div>
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    value={formData. last_name}
                    onChange={(e) => handleInputChange("last_name", e.target. value)}
                    className={`bg-black/50 ${inputBorder} text-white`}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-black/50 ${inputBorder} text-white`}
                />
              </div>
              
              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className={`bg-black/50 ${inputBorder} text-white`}
                />
              </div>
              
              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`bg-black/50 ${inputBorder} text-white`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={`bg-black/50 ${inputBorder} text-white`}
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    className={`bg-black/50 ${inputBorder} text-white`}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className={`${buttonBg} text-white w-full md:w-auto`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Change Password */}
          <div className={`bg-black/60 border-2 ${borderColor} rounded-xl p-6`}>
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textAccent}`}>Change Password</h3>
              <p className="text-sm text-gray-400 mt-1">Update your password to keep your account secure</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    className={`bg-black/50 ${inputBorder} text-white pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover: text-white"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> :  <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">New Password</Label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={passwordData. new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  className={`bg-black/50 ${inputBorder} text-white`}
                />
              </div>
              
              <div>
                <Label className="text-gray-300">Confirm New Password</Label>
                <Input
                  type={showPasswords ? "text" :  "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e. target.value })
                  }
                  className={`bg-black/50 ${inputBorder} text-white`}
                />
              </div>
              
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full md:w-auto"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing... 
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}