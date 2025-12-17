"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getUserProfile,
  updateUsername,
  updateCustomerProfile,
  changePassword,
  type UserProfile,
  type UpdateCustomerProfileData,
} from "@/lib/api/settings";

interface ProfileFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
}

interface PasswordFormState {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export function CustomerSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const userId =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("user_id") || "0")
      : 0;

  useEffect(() => {
    console.log("[CustomerSettings] Component mounted, userId:", userId);
    console.log(
      "[CustomerSettings] localStorage user_id:",
      typeof window !== "undefined" ? localStorage.getItem("user_id") : "SSR",
    );

    if (userId > 0) {
      loadUserData();
    } else {
      console.log("[CustomerSettings] No valid userId, skipping data load");
      setError("Not logged in. Please log in to view your settings.");
      setLoading(false);
    }
  }, [userId]);

  async function loadUserData() {
    console.log("[CustomerSettings] loadUserData() called for userId:", userId);
    setLoading(true);
    setError(null);
    try {
      const profileData = await getUserProfile(userId);
      console.log("[CustomerSettings] Profile loaded:", profileData);

      setProfile(profileData);
      setNewUsername(profileData.username);
      setProfileForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        phone_number: profileData.phone_number || "",
        address: profileData.address || "",
        city: profileData.city || "",
        postal_code: profileData.postal_code || "",
      });
    } catch (err) {
      console.error("[CustomerSettings] Error loading user data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleUpdateUsername() {
    if (newUsername === profile?.username) {
      showMessage("success", "No changes to save");
      setIsEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    try {
      await updateUsername(userId, newUsername);
      localStorage.setItem("username", newUsername);
      await loadUserData();
      showMessage("success", "Username updated successfully!");
      setIsEditingUsername(false);
    } catch (err) {
      console.error("Error updating username:", err);
      showMessage(
        "error",
        err instanceof Error ? err.message : "Failed to update username",
      );
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const updates: UpdateCustomerProfileData = {};
      const formKeys = Object.keys(profileForm) as (keyof ProfileFormState)[];

      for (const key of formKeys) {
        const formValue = profileForm[key];
        const profileValue = profile?.[key as keyof UserProfile];
        if (formValue !== profileValue) {
          updates[key] = formValue || undefined;
        }
      }

      if (Object.keys(updates).length === 0) {
        showMessage("success", "No changes to save");
        setSavingProfile(false);
        return;
      }

      await updateCustomerProfile(userId, updates);
      await loadUserData();
      showMessage("success", "Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      showMessage(
        "error",
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      showMessage("error", "Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(userId, passwordForm);
      showMessage("success", "Password changed successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      showMessage(
        "error",
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-gray-400 mb-2">Failed to load profile</p>
          <p className="text-sm text-gray-500 mb-4">
            {error || "Unknown error"}
          </p>
          <p className="text-xs text-gray-600">
            Debug: user_id={userId}, localStorage=
            {typeof window !== "undefined"
              ? localStorage.getItem("user_id")
              : "SSR"}
          </p>
          <Button
            onClick={loadUserData}
            className="mt-4 bg-teal-600 hover:bg-teal-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-teal-200">
          Account Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-2 ${
            message.type === "success"
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
        {/* Left Column - Account Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-teal-200 mb-4">
              Account Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Username:</span>
                <p className="text-white font-semibold">{profile.username}</p>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <p className="text-white font-semibold capitalize">
                  {profile.role}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Member Since:</span>
                <p className="text-white">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Username Section */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-teal-200">Username</h3>
              <p className="text-sm text-gray-400 mt-1">
                Change your account username
              </p>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-gray-300">Username</Label>
                {isEditingUsername ? (
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-black/50 border-teal-600 text-white"
                    disabled={savingUsername}
                  />
                ) : (
                  <div className="mt-2 text-white font-semibold text-lg">
                    {profile.username}
                  </div>
                )}
              </div>

              {isEditingUsername ? (
                <>
                  <Button
                    onClick={handleUpdateUsername}
                    disabled={savingUsername}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {savingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(profile.username);
                    }}
                    variant="outline"
                    disabled={savingUsername}
                    className="text-gray-400 border-gray-600"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditingUsername(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-200">
                Personal Information
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Update your personal details
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    value={profileForm.first_name}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        first_name: e.target.value,
                      })
                    }
                    className="bg-black/50 border-teal-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    value={profileForm.last_name}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        last_name: e.target.value,
                      })
                    }
                    className="bg-black/50 border-teal-600 text-white"
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
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="bg-black/50 border-teal-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={profileForm.phone_number}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phone_number: e.target.value,
                    })
                  }
                  className="bg-black/50 border-teal-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="bg-black/50 border-teal-600 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">City</Label>
                  <Input
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    className="bg-black/50 border-teal-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Postal Code</Label>
                  <Input
                    value={profileForm.postal_code}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        postal_code: e.target.value,
                      })
                    }
                    className="bg-black/50 border-teal-600 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-teal-600 hover:bg-teal-700 text-white w-full md:w-auto"
              >
                {savingProfile ? (
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

          {/* Password Section */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-200">
                Change Password
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current_password: e.target.value,
                      })
                    }
                    className="bg-black/50 border-teal-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">New Password</Label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  className="bg-black/50 border-teal-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Confirm New Password</Label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password: e.target.value,
                    })
                  }
                  className="bg-black/50 border-teal-600 text-white"
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
