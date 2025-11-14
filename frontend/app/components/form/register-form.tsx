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
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!day || !month || !year) {
      alert("Please select your complete date of birth");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const birthDate = `${year}-${month}-${day}`;
    const age = calculateAge(birthDate);

    if (age < 18) {
      alert("You must be at least 18 years old to register");
      return;
    }

    console.log({
      username,
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      address,
      city,
      postalCode,
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleBack = () => {
    window.history.back();
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
                className="text-yellow-200 hover:bg-red-600  bg-black border-2 border-red-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <span className="mt-1.5 pl-0.5">Register</span>
            </FieldLegend>
            <FieldDescription className="font-body text-white text-lg mt-2 pt-4">
              Register to the greatest retail system in the nests and in the
              city. Join today now!
            </FieldDescription>

            <FieldGroup className="animate-fade-in-delay-200">
              <Field>
                <FieldLabel className="text-white font-semibold">
                  Username
                </FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Set your username here"
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
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength={8}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Confirm Password
                </FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  First Name
                </FieldLabel>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Set your first name here"
                  required
                  className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                />
              </Field>

              <Field>
                <FieldLabel className="text-white font-semibold">
                  Last Name
                </FieldLabel>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Set your last name here"
                  required
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
                  required
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
                  required
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
                    required
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
                    required
                    className="bg-black/50 text-white border-2 border-teal-500 focus:border-yellow-200"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel className="text-white text-sm">Day</FieldLabel>
                  <Select value={day} onValueChange={setDay}>
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
                </Field>

                <Field>
                  <FieldLabel className="text-white text-sm">Month</FieldLabel>
                  <Select value={month} onValueChange={setMonth}>
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
                </Field>

                <Field>
                  <FieldLabel className="text-white text-sm">Year</FieldLabel>
                  <Input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="YYYY"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className={`bg-black/50 border-2 border-teal-500 focus:border-yellow-200 ${year ? "text-white" : "text-gray-400"}`}
                  />
                </Field>
              </div>

              <Field
                orientation="horizontal"
                className="gap-4 animate-fade-in-delay-400"
              >
                <Button
                  type="submit"
                  className="grow bg-yellow-200 text-black hover:bg-yellow-300 font-bold text-lg px-8 py-6"
                >
                  Submit
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
