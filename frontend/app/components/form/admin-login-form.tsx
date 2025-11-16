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

export function AdminLoginForm() {
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
        const error = await response.json();
        alert(error.detail || "Login failed");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.role !== "admin") {
        alert("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet className="border-4 border-red-500 rounded-xl pt-2 px-8 pb-10 bg-black/40 backdrop-blur-sm">
            <FieldLegend className="font-heading text-teal-200 text-4xl px-2 flex gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleBack}
                className="text-teal-200 hover:bg-red-600  bg-black border-2 border-red-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <span className="mt-1.5 pl-0.5">L. CORP Employee Login</span>
            </FieldLegend>

            <FieldDescription className="font-body text-white text-lg mb-2">
              Administrator and Official Employee access{" "}
              <b>
                <i>only.</i>
              </b>{" "}
              Please enter your credentials.
            </FieldDescription>

            <FieldGroup className="animate-fade-in-delay-200 space-y-4 ">
              <Field>
                <FieldLabel className="text-white font-semibold">
                  Username
                </FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  disabled={loading}
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
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>
              <FieldDescription className="text-center font-body text-red-700 text-shadow-red text-shadow-red-900 text-shadow-xs text-[0.5vw] font-extralight">
                EMPLOYEE REMINDER: She is not there. Do <b>not</b> listen to the
                voices. Do <b>not</b> listen to her.
              </FieldDescription>
            </FieldGroup>
          </FieldSet>

          <Field
            orientation="horizontal"
            className="mt-6 gap-4 animate-fade-in-delay-400"
          >
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-700 text-white hover:bg-red-900 font-bold text-lg px-8 py-6 w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
