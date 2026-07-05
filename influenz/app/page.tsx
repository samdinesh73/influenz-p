"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { mockInfluencers, mockCampaigns } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  SearchIcon, 
  FilterIcon, 
  UserCheckIcon, 
  MapPinIcon, 
  StarIcon, 
  UsersIcon, 
  ExternalLinkIcon, 
  BriefcaseIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
  PlusIcon,
  CheckCircle2Icon,
  TrendingUpIcon
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon
} from "@/components/social-icons";

export default function LandingPage() {
  const router = useRouter();
  
  // Choose mode: "brand" sees influencers, "influencer" sees campaigns
  const [viewMode, setViewMode] = useState<"brand" | "influencer">("brand");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Check login state on mount (but do not auto-redirect from homepage)
  React.useEffect(() => {
    const cachedRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");
    if (cachedRole && token) {
      setIsLoggedIn(true);
      setUserRole(cachedRole);
    }
  }, []);

  // Filters for Brand View (searching influencers)
  const [infKeyword, setInfKeyword] = useState("");
  const [infCategory, setInfCategory] = useState("all");
  const [infFollowerRange, setInfFollowerRange] = useState("all");
  const [infPlatform, setInfPlatform] = useState("all");
  const [infState, setInfState] = useState("all");
  const [infVerifiedOnly, setInfVerifiedOnly] = useState(false);

  // Filters for Influencer View (searching campaigns)
  const [campKeyword, setCampKeyword] = useState("");
  const [campCategory, setCampCategory] = useState("all");
  const [campPlatform, setCampPlatform] = useState("all");
  const [campMinBudget, setCampMinBudget] = useState("");

  // Categories list extracted from mock data
  const categories = ["Fashion", "Food", "Travel", "Fitness", "Gaming", "Comedy", "Finance", "Education", "Tech", "Lifestyle", "Beauty", "Photography"];
  const states = ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"];

  // Filter Influencers List
  const filteredInfluencers = useMemo(() => {
    return mockInfluencers.filter(inf => {
      // Keyword
      if (infKeyword && !inf.name.toLowerCase().includes(infKeyword.toLowerCase()) && !inf.username.toLowerCase().includes(infKeyword.toLowerCase()) && !inf.bio.toLowerCase().includes(infKeyword.toLowerCase())) {
        return false;
      }
      // Category
      if (infCategory !== "all" && !inf.categories.includes(infCategory)) {
        return false;
      }
      // Follower range
      if (infFollowerRange !== "all") {
        if (infFollowerRange === "1K-10K" && inf.followersRange !== "1K-10K") return false;
        if (infFollowerRange === "10K-50K" && inf.followersRange !== "10K-50K") return false;
        if (infFollowerRange === "50K-100K" && inf.followersRange !== "50K-100K") return false;
        if (infFollowerRange === "100K+" && inf.followersRange !== "100K+") return false;
      }
      // Platform
      if (infPlatform !== "all" && !inf.platforms.includes(infPlatform)) {
        return false;
      }
      // State
      if (infState !== "all" && inf.location.state !== infState) {
        return false;
      }
      // Verified
      if (infVerifiedOnly && !inf.verified) {
        return false;
      }
      return true;
    });
  }, [infKeyword, infCategory, infFollowerRange, infPlatform, infState, infVerifiedOnly]);

  // Filter Campaigns List
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(camp => {
      // Keyword
      if (campKeyword && !camp.title.toLowerCase().includes(campKeyword.toLowerCase()) && !camp.companyName.toLowerCase().includes(campKeyword.toLowerCase()) && !camp.description.toLowerCase().includes(campKeyword.toLowerCase())) {
        return false;
      }
      // Category
      if (campCategory !== "all" && camp.category !== campCategory) {
        return false;
      }
      // Platform
      if (campPlatform !== "all" && camp.platform !== campPlatform) {
        return false;
      }
      // Budget
      if (campMinBudget && camp.budget < Number(campMinBudget)) {
        return false;
      }
      return true;
    });
  }, [campKeyword, campCategory, campPlatform, campMinBudget]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return <InstagramIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
      case "youtube": return <YoutubeIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
      case "linkedin": return <LinkedinIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
      case "facebook": return <FacebookIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
      case "twitter": return <TwitterIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
      default: return <ExternalLinkIcon className="size-4 text-zinc-900 dark:text-zinc-100" />;
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(0) + "K";
    return count.toString();
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
              <span className="bg-zinc-900 text-zinc-50 px-2.5 py-0.5 rounded dark:bg-zinc-50 dark:text-zinc-900">In</span>
              <span>fluenz</span>
            </div>
            
            {/* View switcher */}
            <div className="hidden items-center gap-1 border border-zinc-200 rounded-md p-1 sm:flex dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <Button
                variant={viewMode === "brand" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("brand")}
                className={`text-xs h-7 rounded px-3 ${viewMode === "brand" ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800" : ""}`}
              >
                I am a Brand
              </Button>
              <Button
                variant={viewMode === "influencer" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("influencer")}
                className={`text-xs h-7 rounded px-3 ${viewMode === "influencer" ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800" : ""}`}
              >
                I am an Influencer
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="border-zinc-200 text-zinc-700 hover:text-zinc-900 font-medium">
                  Go to Dashboard
                </Button>
                <Button size="sm" onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userRole");
                  localStorage.removeItem("userName");
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("userAvatar");
                  localStorage.removeItem("userUsername");
                  setIsLoggedIn(false);
                  setUserRole("");
                  router.push("/login");
                }} className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                  Log In
                </Button>
                <Button size="sm" onClick={() => router.push("/register")} className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Register Now
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-white border-b border-zinc-200 py-16 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <Badge variant="outline" className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 rounded font-medium">
              Trusted by 5,000+ Brands & Creators
            </Badge>
            {viewMode === "brand" ? (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Discover Top Creators for Your Next Big Campaign
                </h1>
                <p className="text-lg text-zinc-500">
                  Filter verified influencers across India by state, follower tier, platform, and engagement rate. Manage invoices and escrow payments securely in one hub.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Connect with Premium Brands and Monetize Your Content
                </h1>
                <p className="text-lg text-zinc-500">
                  Browse open advertising proposals, pitch direct applications, collaborate securely via safe escrow wallets, and build a lasting portfolio.
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button size="lg" onClick={() => router.push("/register")} className="w-full sm:w-auto bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => setViewMode(viewMode === "brand" ? "influencer" : "brand")} className="w-full sm:w-auto">
                Switch to {viewMode === "brand" ? "Creator View" : "Brand View"}
              </Button>
            </div>
          </div>
          
          {/* Quick Stats or visual element */}
          <div className="grid grid-cols-2 gap-4 w-full md:max-w-sm bg-zinc-50 p-6 border border-zinc-200 rounded-lg dark:bg-zinc-950 dark:border-zinc-800">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active Influencers</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">12,450+</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Brand Collaborations</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">3,890+</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Escrowed Payout</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">₹8.4M+</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Campaign Success</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">99.2%</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Directory / Marketplace Showcase */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {viewMode === "brand" ? (
          /* BRAND VIEW: DIRECTORY OF INFLUENCERS */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* SEARCH FILTERS COLUMN */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <FilterIcon className="size-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Search Filters</h3>
              </div>

              {/* Keyword */}
              <div className="space-y-2">
                <Label htmlFor="search-keyword">Keyword Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                  <Input 
                    id="search-keyword" 
                    placeholder="Search name, bio..." 
                    className="pl-9" 
                    value={infKeyword}
                    onChange={e => setInfKeyword(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="filter-cat">Content Category</Label>
                <Select value={infCategory} onValueChange={(val) => setInfCategory(val || "all")}>
                  <SelectTrigger id="filter-cat">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Followers Tier */}
              <div className="space-y-2">
                <Label htmlFor="filter-followers">Follower Range</Label>
                <Select value={infFollowerRange} onValueChange={(val) => setInfFollowerRange(val || "all")}>
                  <SelectTrigger id="filter-followers">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="1K-10K">1K - 10K (Nano)</SelectItem>
                    <SelectItem value="10K-50K">10K - 50K (Micro)</SelectItem>
                    <SelectItem value="50K-100K">50K - 100K (Mid)</SelectItem>
                    <SelectItem value="100K+">100K+ (Macro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="filter-platform">Primary Platform</Label>
                <Select value={infPlatform} onValueChange={(val) => setInfPlatform(val || "all")}>
                  <SelectTrigger id="filter-platform">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Geographic Division - State */}
              <div className="space-y-2">
                <Label htmlFor="filter-state">State Location</Label>
                <Select value={infState} onValueChange={(val) => setInfState(val || "all")}>
                  <SelectTrigger id="filter-state">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(st => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="filter-verified" 
                  checked={infVerifiedOnly} 
                  onCheckedChange={checked => setInfVerifiedOnly(!!checked)}
                />
                <Label htmlFor="filter-verified" className="text-sm font-medium cursor-pointer">Verified Creators Only</Label>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => {
                  setInfKeyword("");
                  setInfCategory("all");
                  setInfFollowerRange("all");
                  setInfPlatform("all");
                  setInfState("all");
                  setInfVerifiedOnly(false);
                }}
              >
                Reset Filters
              </Button>
            </div>

            {/* INFLUENCERS DIRECTORY LIST */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Trending Creators</h2>
                  <p className="text-xs text-zinc-500">Showing {filteredInfluencers.length} influencers matching search criteria</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInfluencers.map(inf => (
                  <Card key={inf.id} className="bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-3">
                      <div className="relative size-14 shrink-0 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <img 
                          src={inf.profileImage} 
                          alt={inf.name} 
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-base leading-none text-zinc-900 dark:text-zinc-50">{inf.name}</h3>
                          {inf.verified && <ShieldCheckIcon className="size-4 text-zinc-900 fill-zinc-900 text-white dark:text-zinc-900 dark:fill-zinc-50" />}
                        </div>
                        <p className="text-xs text-zinc-500">@{inf.username}</p>
                        <div className="flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                          <MapPinIcon className="size-3" />
                          <span>{inf.location.city}, {inf.location.state}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="line-clamp-2 text-xs">{inf.bio}</p>
                      
                      {/* Categories tag */}
                      <div className="flex flex-wrap gap-1">
                        {inf.categories.map(cat => (
                          <span key={cat} className="text-[10px] font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>

                      <Separator className="my-2" />

                      {/* Influencer Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="border-r border-zinc-100 dark:border-zinc-800 pr-1">
                          <p className="text-zinc-400 text-[10px] uppercase font-medium">Followers</p>
                          <div className="flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                            <UsersIcon className="size-3.5" />
                            <span>{formatFollowers(inf.followers)}</span>
                          </div>
                        </div>
                        <div className="border-r border-zinc-100 dark:border-zinc-800 px-1">
                          <p className="text-zinc-400 text-[10px] uppercase font-medium">Engagement</p>
                          <div className="flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                            <TrendingUpIcon className="size-3.5" />
                            <span>{inf.engagementRate}%</span>
                          </div>
                        </div>
                        <div className="pl-1">
                          <p className="text-zinc-400 text-[10px] uppercase font-medium">Rating</p>
                          <div className="flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                            <StarIcon className="size-3.5 fill-current" />
                            <span>{inf.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4 text-xs">
                      <div>
                        <p className="text-[10px] text-zinc-400">Pricing starts from</p>
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">₹{inf.priceStory} / Story</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs"
                          onClick={() => router.push(`/dashboard?role=brand_owner&view=profile&infId=${inf.id}`)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                          onClick={() => router.push(`/dashboard?role=brand_owner&view=search&inviteId=${inf.id}`)}
                        >
                          Invite
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* INFLUENCER VIEW: BRAND CAMPAIGNS MARKETPLACE */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* SEARCH FILTERS COLUMN */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <FilterIcon className="size-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Search Filters</h3>
              </div>

              {/* Keyword */}
              <div className="space-y-2">
                <Label htmlFor="camp-keyword">Keyword Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                  <Input 
                    id="camp-keyword" 
                    placeholder="Search company, title..." 
                    className="pl-9" 
                    value={campKeyword}
                    onChange={e => setCampKeyword(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="camp-cat">Campaign Niche</Label>
                <Select value={campCategory} onValueChange={(val) => setCampCategory(val || "all")}>
                  <SelectTrigger id="camp-cat">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="camp-platform">Platform Target</Label>
                <Select value={campPlatform} onValueChange={(val) => setCampPlatform(val || "all")}>
                  <SelectTrigger id="camp-platform">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Budget */}
              <div className="space-y-2">
                <Label htmlFor="camp-budget">Minimum Budget (INR ₹)</Label>
                <Input 
                  id="camp-budget" 
                  type="number" 
                  placeholder="e.g. 20000" 
                  value={campMinBudget}
                  onChange={e => setCampMinBudget(e.target.value)}
                />
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => {
                  setCampKeyword("");
                  setCampCategory("all");
                  setCampPlatform("all");
                  setCampMinBudget("");
                }}
              >
                Reset Filters
              </Button>
            </div>

            {/* CAMPAIGNS LIST */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Active Campaign Proposals</h2>
                  <p className="text-xs text-zinc-500">Showing {filteredCampaigns.length} campaigns accepting proposals</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaigns.map(camp => (
                  <Card key={camp.id} className="bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 flex items-center justify-center">
                            <img src={camp.companyLogo} alt={camp.companyName} className="size-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm leading-none text-zinc-900 dark:text-zinc-50">{camp.companyName}</h3>
                            <p className="text-[10px] text-zinc-500 mt-1">{camp.industry}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] rounded shrink-0 flex items-center gap-1 bg-zinc-50 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {getPlatformIcon(camp.platform)}
                          <span>{camp.platform}</span>
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold mt-4 line-clamp-1">{camp.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <p className="line-clamp-3 leading-relaxed">{camp.description}</p>
                      
                      <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded dark:bg-zinc-950 dark:border-zinc-800 space-y-1">
                        <p className="font-semibold text-[10px] uppercase text-zinc-400">Requirements:</p>
                        <p className="line-clamp-2 text-[11px] leading-tight">{camp.requirements}</p>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4 text-xs">
                      <div>
                        <p className="text-[10px] text-zinc-400">Escrowed Budget</p>
                        <p className="font-bold text-base text-zinc-900 dark:text-zinc-100">₹{camp.budget.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs"
                          onClick={() => router.push(`/dashboard?role=influencer&view=campaigns&campId=${camp.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                          onClick={() => router.push(`/dashboard?role=influencer&view=campaigns&applyId=${camp.id}`)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-auto py-8 dark:bg-zinc-900 dark:border-zinc-800 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
            <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-[11px]">In</span>
            <span>fluenz Marketplace</span>
          </div>
          <p>© 2026 Influenz Platform. All rights reserved. Built with flat solid theme.</p>
          <div className="flex gap-4">
            <span className="underline cursor-pointer">Terms of Service</span>
            <span className="underline cursor-pointer">Privacy Policy</span>
            <span className="underline cursor-pointer" onClick={() => router.push("/dashboard?role=master_admin")}>Admin Console</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
