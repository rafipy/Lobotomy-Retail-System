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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone_number: phoneNumber || undefined,
        address: address || undefined,
        city: city || undefined,
        postal_code: postalCode || undefined,
      });

      // Registration successful - redirect to login
      alert("Registration successful! Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet className="min-w-[60vh] border-4 border-yellow-200 rounded-xl px-8 pb-8 bg-black/30 backdrop-blur-sm">
            <FieldLegend className="font-heading text-yellow-200 text-4xl px-2 flex gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="text-yellow-200 hover:bg-red-600 bg-black border-2 border-red-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <span className="mt-1.5 pl-0.5">Register</span>
            </FieldLegend>
            <FieldDescription className="font-body text-white text-lg mt-2 pt-4">
              Register to the greatest retail system in the nests and in the
              city. Join today now!
            </FieldDescription>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm mt-4">
                {error}
              </div>
            )}

            <FieldGroup className="animate-fade-in-delay-200">
              <Field>
                <FieldLabel className="text-white font-semibold">
                  Username <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Set your username here"
                  required
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Password <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength={8}
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Confirm Password <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  First Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Set your first name here"
                  required
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Last Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Set your last name here"
                  required
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Email
                </FieldLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Phone Number
                </FieldLabel>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0812 345 6789"
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
                <FieldDescription className="text-gray-300">
                  Enter your phone number without the country code.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Address
                </FieldLabel>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  disabled={loading}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-white font-semibold">
                    City
                  </FieldLabel>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    disabled={loading}
                    className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-white font-semibold">
                    Postal Code
                  </FieldLabel>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                    disabled={loading}
                    className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Date of Birth <span className="text-red-500">*</span>
                </FieldLabel>
                <div className="flex flex-row gap-2 ">
                  <Select value={day} onValueChange={setDay} disabled={loading}>
                    <SelectTrigger
                      className={`bg-black/50 border-2 border-teal-500 ${day ? "text-white" : "text-gray-400"}`}
                    >
                      <SelectValue placeholder="DD" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => {
                        const value = String(i + 1).padStart(2, "0");
                        return (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={month}
                    onValueChange={setMonth}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={`bg-black/50 border-2 border-teal-500 ${month ? "text-white" : "text-gray-400"}`}
                    >
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const value = String(i + 1).padStart(2, "0");
                        return (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="YYYY"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    disabled={loading}
                    className={`bg-black/50 border-2 border-teal-500 focus:border-yellow-200 ${year ? "text-white" : "text-gray-400"}`}
                  />
                </div>
              </Field>

              <Field
                orientation="horizontal"
                className="gap-4 animate-fade-in-delay-400 pt-4"
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="grow bg-yellow-200 text-black hover:bg-yellow-300 font-bold text-lg px-8 py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
