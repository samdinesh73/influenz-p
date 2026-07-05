"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  UserIcon, 
  Building2Icon, 
  MailIcon, 
  KeyIcon, 
  SmartphoneIcon, 
  LockIcon, 
  CheckCircle2Icon, 
  GlobeIcon, 
  SparklesIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon 
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon
} from "@/components/social-icons";

type Role = "brand" | "influencer" | null;
type Step = "choose_role" | "basic_info" | "email_verify" | "otp_verify" | "complete_profile" | "admin_approval";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose_role");
  const [role, setRole] = useState<Role>(null);
  
  // Basic info states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Verification states
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [apiError, setApiError] = useState("");
  
  // Influencer details states
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [insta, setInsta] = useState("");
  const [yt, setYt] = useState("");
  const [followers, setFollowers] = useState("");
  const [reach, setReach] = useState("");
  const [engagement, setEngagement] = useState("");
  const [contentType, setContentType] = useState<string[]>([]);
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [pricePost, setPricePost] = useState("1000");
  const [priceReel, setPriceReel] = useState("5000");
  const [priceStory, setPriceStory] = useState("2000");

  // Brand details states
  const [companyName, setCompanyName] = useState("");
  const [gst, setGst] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [preferredCats, setPreferredCats] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");

  const categoriesList = ["Fashion", "Food", "Travel", "Fitness", "Gaming", "Comedy", "Finance", "Education", "Tech", "Lifestyle", "Beauty", "Photography"];
  const languagesList = ["Tamil", "Hindi", "English", "Telugu", "Malayalam", "Kannada"];

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setApiError("");
    setStep("basic_info");
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!name || !email || !phone || !password) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Failed to register.");
        return;
      }
      setStep("email_verify");
    } catch (err: any) {
      setApiError("Network error. Please make sure your database is running and try again.");
    }
  };

  const sendEmailVerification = () => {
    setStep("otp_verify");
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setApiError("");
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Invalid OTP code.");
        return;
      }
      setStep("complete_profile");
    } catch (err: any) {
      setOtpError("Network error checking OTP. Try again.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const profileData = role === "influencer" ? {
      username,
      bio,
      country,
      state,
      district,
      city: "",
      categories: contentType,
      languages,
      followers: followers ? Number(followers) : 0,
      averageReach: reach ? Number(reach) : 0,
      engagementRate: engagement ? Number(engagement) : 0.00,
      contentType,
      instagramUsername: insta,
      youtubeChannelUrl: yt,
      pricePost: pricePost ? Number(pricePost) : 0.00,
      priceReel: priceReel ? Number(priceReel) : 0.00,
      priceStory: priceStory ? Number(priceStory) : 0.00,
      availabilityCalendar: {},
      gender: "",
      age: 25,
      portfolio: { images: [], videos: [], brandsWorked: [], achievements: [] }
    } : {
      companyName,
      logo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
      gst,
      website,
      industry,
      country,
      state,
      district,
      city: "",
      description: brandDesc,
      marketingBudget: budget ? Number(budget) : 0.00,
      preferredCategories: preferredCats,
      targetAudience,
      verificationDocuments: {}
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/complete-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, profileData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Failed to complete profile.");
        return;
      }

      // Save credentials to localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      setStep("admin_approval");
    } catch (err: any) {
      setApiError("Network error saving profile details. Try again.");
    }
  };

  const handleAdminApprove = () => {
    router.push("/dashboard");
  };

  const toggleCategory = (cat: string) => {
    if (role === "influencer") {
      setContentType(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    } else {
      setPreferredCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    }
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="bg-zinc-900 text-zinc-50 px-2.5 py-1 rounded dark:bg-zinc-50 dark:text-zinc-900">In</span>
            <span>fluenz</span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Join the premium influencer marketplace</p>
        </div>

        {/* STEP 1: CHOOSE ROLE */}
        {step === "choose_role" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold">Choose Your Account Type</CardTitle>
              <CardDescription>Select how you want to use the platform to get started.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div 
                onClick={() => handleRoleSelect("brand")}
                className="flex flex-col items-center p-6 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-100 transition-colors text-center bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <Building2Icon className="size-10 text-zinc-900 dark:text-zinc-100 mb-4" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">I am a Brand</h3>
                <p className="text-xs text-zinc-500 mt-2">Hire top creators, launch campaigns, and track metrics.</p>
              </div>
              <div 
                onClick={() => handleRoleSelect("influencer")}
                className="flex flex-col items-center p-6 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-100 transition-colors text-center bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <UserIcon className="size-10 text-zinc-900 dark:text-zinc-100 mb-4" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">I am an Influencer</h3>
                <p className="text-xs text-zinc-500 mt-2">Build your profile, showcase reach, and get brand deals.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-zinc-100 py-4 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Already have an account? <span className="underline cursor-pointer hover:text-zinc-900" onClick={() => router.push("/")}>Log In</span></p>
            </CardFooter>
          </Card>
        )}

        {/* STEP 2: BASIC INFO */}
        {step === "basic_info" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleBasicSubmit}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                    {role === "brand" ? "Brand" : "Influencer"}
                  </span>
                </div>
                <CardDescription>Provide your key contact credentials.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiError && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs">
                    {apiError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                    <Input 
                      id="name" 
                      placeholder="e.g. John Doe" 
                      className="pl-9" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="e.g. john@example.com" 
                      className="pl-9" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <SmartphoneIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210" 
                      className="pl-9" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
              <CardFooter className="flex justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setStep("choose_role")}>
                  <ArrowLeftIcon className="size-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Continue <ArrowRightIcon className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* STEP 3: EMAIL VERIFICATION */}
        {step === "email_verify" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="text-center">
              <MailIcon className="size-12 mx-auto text-zinc-900 dark:text-zinc-100 mb-2" />
              <CardTitle className="text-lg font-semibold">Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to <strong className="text-zinc-900 dark:text-zinc-100">{email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="text-sm text-zinc-500 mb-4">An OTP has been generated for your registration. Click below to enter the verification code.</p>
              <Button type="button" onClick={sendEmailVerification} className="w-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                Enter Verification Code
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="ghost" className="text-xs" onClick={() => setStep("basic_info")}>Change email address</Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: OTP VERIFICATION */}
        {step === "otp_verify" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleOtpVerify}>
              <CardHeader className="text-center">
                <MailIcon className="size-12 mx-auto text-zinc-900 dark:text-zinc-100 mb-2" />
                <CardTitle className="text-lg font-semibold">Verify Email OTP</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to your email {email}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiError && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs mb-2">
                    {apiError}
                  </div>
                )}
                <div className="space-y-2 text-center">
                  <Label htmlFor="otp" className="sr-only">OTP Code</Label>
                  <Input 
                    id="otp" 
                    placeholder="6-digit Code" 
                    className="text-center text-xl tracking-widest font-mono max-w-[200px] mx-auto" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    required 
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Hint: Check your terminal console/logs for the generated OTP code.</p>
                  {otpError && <p className="text-xs text-red-500 mt-1.5">{otpError}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setStep("email_verify")}>Resend Code</Button>
                <Button type="submit" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  Verify & Continue
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* STEP 5: COMPLETE PROFILE */}
        {step === "complete_profile" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Complete Your Profile</CardTitle>
                <CardDescription>Let the marketplace know about your capabilities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {apiError && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs">
                    {apiError}
                  </div>
                )}
                {role === "influencer" ? (
                  /* INFLUENCER PROFILE DETAILS */
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-zinc-400">@</span>
                        <Input 
                          id="username" 
                          placeholder="johndoe_creator" 
                          className="pl-7" 
                          value={username} 
                          onChange={e => setUsername(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        placeholder="Write a brief intro..." 
                        value={bio} 
                        onChange={e => setBio(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="followers">Followers Count</Label>
                        <Input 
                          id="followers" 
                          type="number" 
                          placeholder="e.g. 50000" 
                          value={followers} 
                          onChange={e => setFollowers(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engagement">Engagement Rate (%)</Label>
                        <Input 
                          id="engagement" 
                          placeholder="e.g. 4.5" 
                          value={engagement} 
                          onChange={e => setEngagement(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Country" value={country} readOnly />
                        <Input placeholder="State" value={state} onChange={e => setState(e.target.value)} required />
                        <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pricing (INR ₹)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-zinc-500">Post</span>
                          <Input value={pricePost} onChange={e => setPricePost(e.target.value)} placeholder="Post" />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500">Reel</span>
                          <Input value={priceReel} onChange={e => setPriceReel(e.target.value)} placeholder="Reel" />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500">Story</span>
                          <Input value={priceStory} onChange={e => setPriceStory(e.target.value)} placeholder="Story" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Social Handles</Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <InstagramIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                          <Input placeholder="Instagram @handle" className="pl-9" value={insta} onChange={e => setInsta(e.target.value)} />
                        </div>
                        <div className="relative">
                          <YoutubeIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                          <Input placeholder="YouTube channel URL" className="pl-9" value={yt} onChange={e => setYt(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Content Type / Categories</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {categoriesList.map(cat => (
                          <div key={cat} className="flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800 rounded p-1.5 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
                            <Checkbox 
                              id={`cat-${cat}`}
                              checked={contentType.includes(cat)} 
                              onCheckedChange={() => toggleCategory(cat)} 
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-xs cursor-pointer">{cat}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Languages</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {languagesList.map(lang => (
                          <div key={lang} className="flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800 rounded p-1.5 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
                            <Checkbox 
                              id={`lang-${lang}`}
                              checked={languages.includes(lang)} 
                              onCheckedChange={() => toggleLanguage(lang)} 
                            />
                            <Label htmlFor={`lang-${lang}`} className="text-xs cursor-pointer">{lang}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* BRAND PROFILE DETAILS */
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2Icon className="absolute left-3 top-3 size-4 text-zinc-400" />
                        <Input 
                          id="companyName" 
                          placeholder="e.g. Acme Tech Solutions" 
                          className="pl-9" 
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gst">GST Registration</Label>
                        <Input 
                          id="gst" 
                          placeholder="GSTIN (e.g. 29AAAAA1111A1Z1)" 
                          value={gst}
                          onChange={e => setGst(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website Link</Label>
                        <div className="relative">
                          <GlobeIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                          <Input 
                            id="website" 
                            placeholder="https://example.com" 
                            className="pl-9" 
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                          id="industry" 
                          placeholder="e.g. Consumer Electronics" 
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Quarterly Marketing Budget (INR ₹)</Label>
                        <Input 
                          id="budget" 
                          placeholder="e.g. 5,00,000" 
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Country" value={country} readOnly />
                        <Input placeholder="State" value={state} onChange={e => setState(e.target.value)} required />
                        <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandDesc">Company Description</Label>
                      <Input 
                        id="brandDesc" 
                        placeholder="Tell us what you sell or build..." 
                        value={brandDesc} 
                        onChange={e => setBrandDesc(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Influencer Categories</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {categoriesList.map(cat => (
                          <div key={cat} className="flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800 rounded p-1.5 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
                            <Checkbox 
                              id={`pref-${cat}`}
                              checked={preferredCats.includes(cat)} 
                              onCheckedChange={() => toggleCategory(cat)} 
                            />
                            <Label htmlFor={`pref-${cat}`} className="text-xs cursor-pointer">{cat}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience Profile</Label>
                      <Input 
                        id="targetAudience" 
                        placeholder="e.g. GenZ tech enthusiasts in Metro Cities" 
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docs">Verification Documents</Label>
                      <Input id="docs" type="file" className="cursor-pointer" required />
                      <p className="text-[10px] text-zinc-500">Upload business incorporation certificate or GST copy (PDF/Image).</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setStep("otp_verify")}>Back</Button>
                <Button type="submit" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  Complete Registration
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* STEP 6: ADMIN APPROVAL SIMULATOR */}
        {step === "admin_approval" && (
          <Card className="border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 text-center">
            <CardHeader>
              <ClockIcon className="size-12 mx-auto text-zinc-500 mb-2 animate-pulse" />
              <CardTitle className="text-lg font-semibold">Account Pending Verification</CardTitle>
              <CardDescription>
                Thank you for completing your profile! Your documents have been submitted to our moderation panel for check.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <div className="p-4 border border-zinc-200 rounded-lg text-left bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Next Steps:</h4>
                <ul className="text-xs text-zinc-500 space-y-1.5 list-disc list-inside">
                  <li>Master admin verifies GST & proof.</li>
                  <li>Account undergoes profile audit.</li>
                  <li>Approval is usually granted within 24 hours.</li>
                </ul>
              </div>
              <p className="text-xs text-zinc-400">For evaluation purposes, click the button below to mock approval and proceed directly to your new dashboard.</p>
            </CardContent>
            <CardFooter className="justify-center border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button type="button" onClick={handleAdminApprove} className="w-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                Admin Simulate Approve & Login
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
