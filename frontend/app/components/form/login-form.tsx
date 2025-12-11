"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.detail || "Login failed");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Expecting backend to return: access_token, role, username, user_id
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      if (data.user_id !== undefined && data.user_id !== null) {
        localStorage.setItem("user_id", data.user_id.toString());
      }

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "customer") {
        router.push("/customer/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet className="border-4 border-yellow-200 rounded-xl pb-8 pt-4 px-8 bg-black/30 backdrop-blur-sm">
            <FieldLegend className="font-heading text-yellow-200 text-4xl px-2 flex gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleBack}
                className="text-yellow-200 hover:bg-red-600  bg-black border-2 border-red-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <span className="mt-1.5 pl-0.5">Login</span>
            </FieldLegend>

            <FieldDescription className="font-body text-white text-lg">
              Welcome back to Lobotomy Retail, customer. Please enter your
              credentials to continue shopping.
            </FieldDescription>

            <FieldGroup className="animate-fade-in-delay-200 space-y-4">
              <Field>
                <FieldLabel className="text-white font-semibold">
                  Username
                </FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Password
                </FieldLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>
            </FieldGroup>
            <Field
              orientation="horizontal"
              className="mt-6 gap-4 animate-fade-in-delay-400"
            >
              <Button
                type="submit"
                className="bg-yellow-200 text-black hover:bg-yellow-300 font-bold text-lg px-8 py-6 w-full"
              >
                Login
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
