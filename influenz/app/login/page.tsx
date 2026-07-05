"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailIcon, LockIcon, ArrowLeftIcon, SparklesIcon } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-login check on mount
  useEffect(() => {
    const cachedRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");
    if (cachedRole && token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Try again.");
        setIsLoading(false);
        return;
      }

      // Cache session data in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      if (data.user.avatar) {
        localStorage.setItem("userAvatar", data.user.avatar);
      }
      if (data.user.username) {
        localStorage.setItem("userUsername", data.user.username);
      }

      // Redirect directly to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError("Network connection issue. Make sure the database and API are running.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 cursor-pointer" onClick={() => router.push("/")}>
            <span className="bg-zinc-900 text-zinc-50 px-2.5 py-1 rounded dark:bg-zinc-50 dark:text-zinc-900">In</span>
            <span>fluenz</span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sign in to your premium marketplace session</p>
        </div>

        <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Account Log In</CardTitle>
              <CardDescription>Enter your credential email and password to log in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-9" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-zinc-400 hover:text-zinc-900 cursor-pointer">Forgot password?</span>
                </div>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-9" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <div className="text-center text-xs text-zinc-500">
                Don't have an account?{" "}
                <span 
                  className="underline cursor-pointer hover:text-zinc-900 font-semibold" 
                  onClick={() => router.push("/register")}
                >
                  Register Now
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="flex justify-center mt-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-xs text-zinc-500 hover:text-zinc-900">
            <ArrowLeftIcon className="size-4 mr-2" /> Back to Landing Page
          </Button>
        </div>
      </div>
    </div>
  );
}
