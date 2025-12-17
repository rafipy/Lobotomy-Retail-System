"use client";

import { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
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
  changePassword,
  type UserProfile,
} from "@/lib/api/settings";

interface Message {
  type: "success" | "error";
  text: string;
}

interface PasswordFormState {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function EmployeeSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const currentUserId =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("user_id") || "0")
      : 0;

  useEffect(() => {
    if (currentUserId > 0) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getUserProfile(currentUserId);
      setProfile(data);
      setNewUsername(data.username);
    } catch (error) {
      console.error("Error loading profile:", error);
      showMessage("error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleUpdateUsername() {
    if (!profile) return;

    if (newUsername === profile.username) {
      showMessage("success", "No changes to save");
      setIsEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    try {
      await updateUsername(currentUserId, newUsername);
      localStorage.setItem("username", newUsername);
      setProfile({ ...profile, username: newUsername });
      showMessage("success", "Username updated successfully!");
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error updating username:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update username",
      );
    } finally {
      setSavingUsername(false);
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
      await changePassword(currentUserId, passwordForm);
      showMessage("success", "Password changed successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to change password",
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

  if (!profile) {
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
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-teal-200">
          Admin Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your account settings</p>
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

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-black/60 border-2 border-red-500 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-teal-200 mb-4">
            Account Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

        {/* Username Section */}
        <div className="bg-black/60 border-2 border-red-500 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-teal-200">
              Change Username
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Update your account username
            </p>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              {isEditingUsername ? (
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-black/50 border-red-600 text-white focus:border-red-400"
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
                  className="bg-red-600 hover:bg-red-700 text-white"
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
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-black/60 border-2 border-red-500 rounded-xl p-6">
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
                  className="bg-black/50 border-red-600 text-white pr-10 focus:border-red-400"
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
                className="bg-black/50 border-red-600 text-white focus:border-red-400"
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
                className="bg-black/50 border-red-600 text-white focus:border-red-400"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto"
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
  );
}
