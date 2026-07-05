"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Influencer, Campaign, ApplicationState, InvitationState, ChatMessage, WalletTransaction, RatingReview, mockInfluencers } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2Icon, 
  SearchIcon, 
  PlusIcon, 
  MessageSquareIcon, 
  DatabaseIcon, 
  SendIcon, 
  MapPinIcon, 
  StarIcon, 
  PaperclipIcon, 
  UserCheckIcon, 
  FileTextIcon, 
  CheckCircle2Icon,
  ShieldCheckIcon,
  UsersIcon,
  ArrowRightIcon,
  DownloadIcon,
  EyeIcon,
  UserIcon,
  TrendingUpIcon
} from "lucide-react";

interface BrandProps {
  view: string;
  setView: (v: string) => void;
  influencers: Influencer[];
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  applications: ApplicationState[];
  setApplications: React.Dispatch<React.SetStateAction<ApplicationState[]>>;
  invitations: InvitationState[];
  setInvitations: React.Dispatch<React.SetStateAction<InvitationState[]>>;
  chats: ChatMessage[];
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  payments: WalletTransaction[];
  setPayments: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
  reviews: RatingReview[];
  setReviews: React.Dispatch<React.SetStateAction<RatingReview[]>>;
  initialInviteId?: string;
  initialInfId?: string;
  dbUser: any;
  setDbUser: React.Dispatch<React.SetStateAction<any>>;
}

export function DashboardBrand({
  view,
  setView,
  influencers,
  campaigns,
  setCampaigns,
  applications,
  setApplications,
  invitations,
  setInvitations,
  chats,
  setChats,
  payments,
  setPayments,
  reviews,
  setReviews,
  initialInviteId,
  initialInfId,
  dbUser,
  setDbUser
}: BrandProps) {
  
  // Wallet Balance (State)
  const [walletBalance, setWalletBalance] = useState(150000);
  const [fundAmount, setFundAmount] = useState("");

  // Campaign Form State
  const [campTitle, setCampTitle] = useState("");
  const [campCategory, setCampCategory] = useState("Fashion");
  const [campBudget, setCampBudget] = useState("");
  const [campPlatform, setCampPlatform] = useState("Instagram");
  const [campDeadline, setCampDeadline] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campReq, setCampReq] = useState("");

  // Search Filters
  const [infKeyword, setInfKeyword] = useState("");
  const [infCategory, setInfCategory] = useState("all");
  const [infFollowers, setInfFollowers] = useState("all");
  const [infPlatform, setInfPlatform] = useState("all");
  const [infState, setInfState] = useState("all");
  const [infVerified, setInfVerified] = useState(false);

  // Active Chats / Message Pane
  const [activeChatUser, setActiveChatUser] = useState<string>("inf-4"); // Kabir Dev by default
  const [messageText, setMessageText] = useState("");

  // Selected Creator Profile Modal Simulation
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null);

  // Handle direct navigation triggers from deep-links
  useEffect(() => {
    if (initialInfId) {
      const found = influencers.find(i => i.id === initialInfId);
      if (found) setSelectedInf(found);
    }
  }, [initialInfId, influencers]);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Campaign Submission connected to MySQL
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campBudget || !campDeadline) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: campTitle,
          description: campDesc,
          budget: campBudget,
          category: campCategory,
          platform: campPlatform,
          deadline: new Date(campDeadline).toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create campaign.");
        return;
      }

      const dbCamp = data.campaign;
      const newCamp: Campaign = {
        id: dbCamp.id,
        brandId: dbCamp.brandId,
        companyName: dbUser?.brand?.companyName || localStorage.getItem("userName") || "Brand Partner",
        companyLogo: dbUser?.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
        industry: dbUser?.brand?.industry || "Fitness & Nutrition",
        title: dbCamp.title,
        budget: Number(dbCamp.budget),
        duration: "1 Month",
        platform: dbCamp.platform,
        deadline: dbCamp.deadline,
        category: dbCamp.category,
        description: dbCamp.description,
        requirements: campReq,
        status: dbCamp.status,
        applicantsCount: 0
      };

      setCampaigns(prev => [newCamp, ...prev]);
      alert("Campaign proposal created and published successfully!");
      
      // Clear form
      setCampTitle("");
      setCampBudget("");
      setCampDeadline("");
      setCampDesc("");
      setCampReq("");
      setView("overview");
    } catch (err) {
      console.error(err);
      alert("Connection issue saving campaign to database.");
    }
  };

  // Fund Wallet
  const handleFundWallet = () => {
    if (fundAmount && !isNaN(Number(fundAmount))) {
      setWalletBalance(prev => prev + Number(fundAmount));
      setFundAmount("");
      alert(`Successfully funded wallet with ₹${Number(fundAmount).toLocaleString()}`);
    }
  };

  // Escrow Payment Creator connected to MySQL
  const handleEscrowPayment = async (application: ApplicationState, amount: number) => {
    if (walletBalance < amount) {
      alert("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/applications/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId: application.id, status: "hired" })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update hire status in database.");
        return;
      }

      // Deduct wallet balance
      setWalletBalance(prev => prev - amount);

      // Add to payment ledger
      const newPayment: WalletTransaction = {
        id: `pay-${Date.now()}`,
        campaignId: application.campaignId,
        brandId: "brand-1",
        influencerId: application.influencerId,
        amount: amount,
        status: "escrowed",
        transactionId: `TXN_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        createdAt: new Date().toISOString()
      };

      setPayments(prev => [newPayment, ...prev]);

      // Update application status to hired
      setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: "hired" } : a));

      alert("Escrow created! ₹" + amount.toLocaleString() + " locked securely for creator in database.");
    } catch (err) {
      console.error(err);
      alert("Connection issue updating application hire status.");
    }
  };

  // Shortlist application status update in MySQL
  const handleUpdateApplicationStatus = async (applicationId: string, status: "shortlisted" | "hired") => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/applications/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, status })
      });

      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
        alert(`Application status updated to ${status} in database!`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update application status.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection issue updating application status.");
    }
  };

  // Release Escrow
  const handleReleasePayment = (payId: string) => {
    setPayments(prev => prev.map(p => p.id === payId ? { ...p, status: "released" } : p));
    alert("Escrow funds released! Creator has been paid.");
  };

  // Send Message connected to MySQL
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChatUser) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeChatUser,
          message: messageText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const m = data.message;
        const newMsg: ChatMessage = {
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          message: m.message,
          isRead: m.isRead || false,
          createdAt: m.createdAt || new Date().toISOString()
        };
        setChats(prev => [...prev, newMsg]);
        setMessageText("");
      } else {
        alert(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection issue sending message to database.");
    }
  };

  // Send Direct Invitation connected to MySQL
  const handleSendInvite = async (infId: string, campaignId: string) => {
    const isExist = invitations.some(inv => inv.influencerId === infId && inv.campaignId === campaignId);
    if (isExist) {
      alert("Invitation already exists for this creator!");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          influencerId: infId,
          campaignId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send invitation.");
        return;
      }

      const campaign = campaigns.find(c => c.id === campaignId);
      const influencer = influencers.find(i => i.id === infId);

      const newInvite: InvitationState = {
        id: data.invitation.id,
        brandId: data.invitation.brandId,
        influencerId: infId,
        campaignId: campaignId,
        status: "sent",
        createdAt: data.invitation.createdAt || new Date().toISOString(),
        campaignTitle: campaign?.title || "Campaign Proposal",
        companyName: dbUser?.brand?.companyName || localStorage.getItem("userName") || "Brand Partner",
        companyLogo: dbUser?.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
        campaignBudget: campaign?.budget || 0,
        campaignPlatform: campaign?.platform || "Instagram",
        industry: dbUser?.brand?.industry || "Sports nutrition",
        influencerName: influencer?.username || "Creator"
      };

      setInvitations(prev => [newInvite, ...prev]);
      alert("Collaboration invite sent successfully and saved to MySQL!");
    } catch (err) {
      console.error(err);
      alert("Connection issue sending invite to database.");
    }
  };

  // Filter influencers
  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      if (infKeyword && !inf.name.toLowerCase().includes(infKeyword.toLowerCase()) && !inf.username.toLowerCase().includes(infKeyword.toLowerCase())) {
        return false;
      }
      if (infCategory !== "all" && !inf.categories.includes(infCategory)) {
        return false;
      }
      if (infFollowers !== "all" && inf.followersRange !== infFollowers) {
        return false;
      }
      if (infPlatform !== "all" && !inf.platforms.includes(infPlatform)) {
        return false;
      }
      if (infState !== "all" && inf.location.state !== infState) {
        return false;
      }
      if (infVerified && !inf.verified) {
        return false;
      }
      return true;
    });
  }, [influencers, infKeyword, infCategory, infFollowers, infPlatform, infState, infVerified]);

  // Chat message selector
  const activeChatMessages = useMemo(() => {
    const myId = dbUser?.id || "brand-1";
    return chats.filter(
      c => (c.senderId === myId && c.receiverId === activeChatUser) ||
           (c.senderId === activeChatUser && c.receiverId === myId)
    );
  }, [chats, activeChatUser, dbUser]);

  const activeChatUserInfo = useMemo(() => {
    return influencers.find(i => i.id === activeChatUser);
  }, [influencers, activeChatUser]);

  // Overview Counts
  const activeCollaboratorsCount = 
    applications.filter(a => a.status === "hired").length + 
    invitations.filter(i => i.status === "accepted").length;

  const pendingInvitesCount = invitations.filter(i => i.status === "sent").length;
  const activeCampaigns = campaigns.filter(c => c.brandId === (dbUser?.id || "brand-1"));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      {/* 1. OVERVIEW VIEW */}
      {view === "overview" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">FitFuel Brand Overview</h2>
              <p className="text-xs text-zinc-500">Track spending, active hires, and campaign conversion.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-zinc-200">
                Wallet Balance: <strong className="ml-1 text-zinc-900">₹{walletBalance.toLocaleString()}</strong>
              </Badge>
              <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => setView("payments")}>
                Fund Wallet
              </Button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card 
              onClick={() => setView("collaborators")} 
              className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-55 hover:border-zinc-300 dark:hover:bg-zinc-850 dark:hover:border-zinc-700 transition-all duration-150"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Active Collaborators</CardDescription>
                <CardTitle className="text-2xl font-bold">{activeCollaboratorsCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Creators currently publishing content</p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setView("invitations")} 
              className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-55 hover:border-zinc-300 dark:hover:bg-zinc-850 dark:hover:border-zinc-700 transition-all duration-150"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Pending Invites</CardDescription>
                <CardTitle className="text-2xl font-bold">{pendingInvitesCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Sent collaboration requests awaiting review</p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setView("payments")} 
              className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-55 hover:border-zinc-300 dark:hover:bg-zinc-850 dark:hover:border-zinc-700 transition-all duration-150"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Wallet Escrow Locked</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  ₹{payments.filter(p => p.status === "escrowed").reduce((a, c) => a + c.amount, 0).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Secured funds waiting for content approvals</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns & Reviews */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-bold">My Active Campaigns</CardTitle>
                  <CardDescription>Manage open budget distributions.</CardDescription>
                </div>
                <Button size="xs" onClick={() => setView("create_campaign")} className="h-7 bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  <PlusIcon className="size-3.5 mr-1" /> New
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activeCampaigns.map(camp => (
                  <div key={camp.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{camp.title}</p>
                      <p className="text-[10px] text-zinc-500">Platform: {camp.platform} • Budget: ₹{camp.budget.toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded">{camp.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Creator Reviews & Feedback</CardTitle>
                <CardDescription>Average platform response from hired creators.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center py-6 text-xs text-zinc-400">No content reviews logged yet.</p>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} className="p-3 border border-zinc-200 rounded-lg dark:border-zinc-800 bg-zinc-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{rev.reviewerName}</span>
                        <div className="flex items-center text-xs text-yellow-500">
                          <StarIcon className="size-3 fill-current" />
                          <span className="ml-1 text-zinc-900 dark:text-zinc-100">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 mb-2">Campaign: {rev.campaignTitle}</p>
                      <p className="text-xs text-zinc-600 italic leading-snug">"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 2. COMPANY PROFILE */}
      {view === "company" && (
        <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="flex-row items-center gap-4 space-y-0 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div className="relative size-16 shrink-0 border border-zinc-200 rounded overflow-hidden bg-zinc-50 flex items-center justify-center">
              <img src={dbUser?.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100"} className="size-full object-cover grayscale" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-lg font-bold">{dbUser?.brand?.companyName || localStorage.getItem("userName") || "Brand Partner"}</CardTitle>
                <ShieldCheckIcon className="size-4 text-zinc-900 fill-zinc-900 text-white dark:text-zinc-50 dark:fill-zinc-900" />
              </div>
              <CardDescription>{dbUser?.brand?.industry || "Commercial Brand Partner"} • {dbUser?.email || ""}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 font-medium">Corporate GSTIN</span>
                <p className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{dbUser?.brand?.gst || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 font-medium">Website URL</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 underline">
                  {dbUser?.brand?.website || "No site linked"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 font-medium">Industry Classification</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{dbUser?.brand?.industry || "Not classified"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 font-medium">Campaign Budget</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">₹{dbUser?.brand?.marketingBudget ? Number(dbUser.brand.marketingBudget).toLocaleString() : "0"}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200">About Company</h4>
              <p className="text-zinc-500 leading-relaxed">
                {dbUser?.brand?.description || "No description provided yet. Complete your profile details during registration."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. SEARCH INFLUENCERS VIEW */}
      {view === "search" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters panel */}
          <div className="space-y-6 lg:col-span-1 bg-white border border-zinc-200 rounded-lg p-5 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <SearchIcon className="size-4" />
              <h3 className="font-bold uppercase tracking-wider">Search Filters</h3>
            </div>
            
            <div className="space-y-1.5">
              <Label>Keyword Search</Label>
              <Input placeholder="Search username, name..." value={infKeyword} onChange={e => setInfKeyword(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={infPlatform} onValueChange={(val) => setInfPlatform(val || "all")}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={infCategory} onValueChange={(val) => setInfCategory(val || "all")}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Followers Range</Label>
              <Select value={infFollowers} onValueChange={(val) => setInfFollowers(val || "all")}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1K-10K">1K - 10K</SelectItem>
                  <SelectItem value="10K-50K">10K - 50K</SelectItem>
                  <SelectItem value="50K-100K">50K - 100K</SelectItem>
                  <SelectItem value="100K+">100K+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>State Geography</Label>
              <Select value={infState} onValueChange={(val) => setInfState(val || "all")}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Kerala">Kerala</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="brand-filt-ver" checked={infVerified} onCheckedChange={checked => setInfVerified(!!checked)} />
              <Label htmlFor="brand-filt-ver" className="cursor-pointer">Verified Badged Only</Label>
            </div>
          </div>

          {/* Catalog grid */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Platform Creator Catalog ({filteredInfluencers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInfluencers.map(inf => (
                <Card key={inf.id} className="bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                  <CardHeader className="flex-row items-center gap-4 space-y-0 pb-3">
                    <img src={inf.profileImage} className="size-12 rounded-full object-cover shrink-0 border border-zinc-200" />
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold text-sm leading-none text-zinc-950 dark:text-zinc-50">{inf.name}</h4>
                        {inf.verified && <ShieldCheckIcon className="size-3.5 text-zinc-950 dark:text-zinc-50" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">@{inf.username}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-0.5 mt-0.5"><MapPinIcon className="size-2.5" />{inf.location.city}, {inf.location.state}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 py-2 text-xs text-zinc-500">
                    <p className="line-clamp-2">{inf.bio}</p>
                    
                    <div className="grid grid-cols-3 gap-1.5 text-center bg-zinc-50 p-2 rounded dark:bg-zinc-950 border border-zinc-150">
                      <div>
                        <span className="text-[8px] uppercase text-zinc-400">Followers</span>
                        <p className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100">{inf.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-zinc-400">Engagement</span>
                        <p className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100">{inf.engagementRate}%</p>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-zinc-400">Rating</span>
                        <p className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100">{inf.rating}</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">₹{inf.priceStory} / Story</p>
                    <div className="flex gap-2">
                      <Button size="xs" variant="outline" className="h-7 text-[10px]" onClick={() => setSelectedInf(inf)}>Profile Details</Button>
                      
                      {/* Quick Invite Form Dropdown Simulator */}
                      <Select onValueChange={(val) => handleSendInvite(inf.id, val as string)}>
                        <SelectTrigger className="h-7 text-[10px] px-2 bg-zinc-900 text-zinc-50 border-0 dark:bg-zinc-50 dark:text-zinc-900"><SelectValue placeholder="Invite to..." /></SelectTrigger>
                        <SelectContent>
                          {activeCampaigns.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CREATOR PROFILE DIALOG SIMULATOR */}
      {selectedInf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto relative shadow-2xl rounded-xl">
            {/* Close Button Absolute Top Right */}
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-100/50 hover:bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 z-10" 
              onClick={() => setSelectedInf(null)}
            >
              <span className="font-bold text-xs">✕</span>
            </Button>

            {/* Profile Hero Header Banner */}
            <div className="h-28 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-850 w-full relative">
              <div className="absolute -bottom-8 left-6">
                <img 
                  src={selectedInf.profileImage} 
                  className="size-20 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-md bg-white" 
                />
              </div>
            </div>

            {/* Header Identity Meta */}
            <div className="pt-10 px-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">{selectedInf.name}</h3>
                {selectedInf.verified && <ShieldCheckIcon className="size-4.5 text-zinc-900 dark:text-zinc-50" />}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">@{selectedInf.username}</p>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1"><MapPinIcon className="size-3.5 text-zinc-400" />{selectedInf.location.city}, {selectedInf.location.state}</p>
            </div>

            <CardContent className="space-y-6 pt-5 px-6 text-xs text-zinc-600 dark:text-zinc-400">
              {/* Bio block */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wider">Bio</h4>
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-350">{selectedInf.bio || "No biography provided by the creator."}</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-zinc-150 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30 text-center flex flex-col justify-between">
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold flex items-center justify-center gap-1"><UserIcon className="size-2.5" /> Followers</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedInf.followers.toLocaleString()}</p>
                </div>
                <div className="p-3 border border-zinc-150 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30 text-center flex flex-col justify-between">
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold flex items-center justify-center gap-1"><EyeIcon className="size-2.5" /> Avg Reach</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedInf.averageReach.toLocaleString()}</p>
                </div>
                <div className="p-3 border border-zinc-150 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30 text-center flex flex-col justify-between">
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold flex items-center justify-center gap-1"><TrendingUpIcon className="size-2.5" /> Engagement</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedInf.engagementRate}%</p>
                </div>
                <div className="p-3 border border-zinc-150 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30 text-center flex flex-col justify-between">
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold flex items-center justify-center gap-1"><CheckCircle2Icon className="size-2.5" /> Rating</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedInf.rating} / 5.0</p>
                </div>
              </div>

              {/* Specialization Categories */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wider">Content Specializations</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInf.categories.map(cat => (
                    <Badge key={cat} variant="outline" className="rounded-full px-2.5 py-0.5 bg-zinc-50 border-zinc-200 font-medium text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350">{cat}</Badge>
                  ))}
                </div>
              </div>

              {/* Pricing Cards Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wider">Pricing Matrix (INR ₹)</h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 border border-zinc-200 bg-white dark:bg-zinc-900 rounded-lg text-center dark:border-zinc-800 shadow-2xs hover:scale-[1.02] transition-transform duration-200">
                    <span className="text-zinc-400 block text-[9px] font-medium uppercase">Post Quote</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450 mt-1">₹{selectedInf.pricePost.toLocaleString()}</p>
                  </div>
                  <div className="p-3 border border-zinc-200 bg-white dark:bg-zinc-900 rounded-lg text-center dark:border-zinc-800 shadow-2xs hover:scale-[1.02] transition-transform duration-200">
                    <span className="text-zinc-400 block text-[9px] font-medium uppercase">Reel Quote</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450 mt-1">₹{selectedInf.priceReel.toLocaleString()}</p>
                  </div>
                  <div className="p-3 border border-zinc-200 bg-white dark:bg-zinc-900 rounded-lg text-center dark:border-zinc-800 shadow-2xs hover:scale-[1.02] transition-transform duration-200">
                    <span className="text-zinc-400 block text-[9px] font-medium uppercase">Story Quote</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450 mt-1">₹{selectedInf.priceStory.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Portfolio Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wider">Portfolio Integrations</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  {selectedInf.portfolio.images.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-zinc-150 shadow-2xs relative aspect-video bg-zinc-50 group">
                      <img 
                        src={img} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-[9px] uppercase text-zinc-400 tracking-wide block mb-1.5">Worked with brands:</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedInf.portfolio.brandsWorked || ["FitFuel Nutrition", "Sandbox Retail", "Wanderlust India"]).map((brandName, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] rounded bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 font-normal">{brandName}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-zinc-150 pt-4 pb-5 px-6 dark:border-zinc-800 justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-b-xl">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 text-xs font-semibold"
                onClick={() => {
                  setActiveChatUser(selectedInf.id);
                  setSelectedInf(null);
                  setView("messages");
                }}
              >
                <MessageSquareIcon className="size-3.5 mr-1.5" /> Start Chat
              </Button>
              <Select onValueChange={(val) => {
                handleSendInvite(selectedInf.id, val as string);
                setSelectedInf(null);
              }}>
                <SelectTrigger className="w-44 h-9 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 border-0 text-xs font-semibold">
                  <SelectValue placeholder="Send Invite to..." />
                </SelectTrigger>
                <SelectContent>
                  {activeCampaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 4. CREATE CAMPAIGN VIEW */}
      {view === "create_campaign" && (
        <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 max-w-xl mx-auto">
          <form onSubmit={handleCreateCampaign}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Launch a Campaign Proposal</CardTitle>
              <CardDescription>Setup details to allow matching influencers to submit proposals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <Label htmlFor="camp-title">Campaign Name / Headline</Label>
                <Input id="camp-title" placeholder="e.g. FitFuel Summer Shake Challenge" value={campTitle} onChange={e => setCampTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="camp-budget">Escrow Budget (INR ₹)</Label>
                  <Input id="camp-budget" type="number" placeholder="e.g. 35000" value={campBudget} onChange={e => setCampBudget(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="camp-plat">Target Social Platform</Label>
                  <Select value={campPlatform} onValueChange={(val) => setCampPlatform(val || "Instagram")}>
                    <SelectTrigger id="camp-plat"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="camp-cat">Campaign Niche</Label>
                  <Select value={campCategory} onValueChange={(val) => setCampCategory(val || "Fitness")}>
                    <SelectTrigger id="camp-cat"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Tech">Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="camp-deadline">Submission Deadline</Label>
                  <Input id="camp-deadline" type="date" value={campDeadline} onChange={e => setCampDeadline(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-desc">Campaign Core Description</Label>
                <Input id="camp-desc" placeholder="Explain the theme and goals..." value={campDesc} onChange={e => setCampDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-req">Creator Eligibility Requirements</Label>
                <Input id="camp-req" placeholder="Followers count, engagement rate minimums..." value={campReq} onChange={e => setCampReq(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-100 pt-4 dark:border-zinc-800 justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setView("overview")}>Cancel</Button>
              <Button type="submit" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">Publish Campaign</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* 5. HIRES & INVITATIONS VIEW */}
      {view === "invitations" && (
        <div className="space-y-6">
          {/* Applications list */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Proposals from Applicants</CardTitle>
              <CardDescription>Review applications submitted for your open campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No active applications currently.</div>
              ) : (
                applications.map(app => {
                  const applicant = influencers.find(i => i.id === app.influencerId);
                  const camp = campaigns.find(c => c.id === app.campaignId);
                  
                  const name = applicant?.name || app.influencerName || "Creator";
                  const username = applicant?.username || app.influencerName || "creator";
                  const avatar = applicant?.profileImage || app.influencerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                  const title = camp?.title || app.campaignTitle || "Campaign Proposal";
                  const pricePost = applicant?.pricePost || "1600";
                  const budget = camp?.budget || app.campaignBudget || 0;

                  return (
                    <div key={app.id} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img src={avatar} className="size-8 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-50">{name} <span className="font-mono text-[10px] text-zinc-400">(@{username})</span></p>
                            <p className="text-[10px] text-zinc-500">Applied for: <strong>{title}</strong> • Price Post: ₹{Number(pricePost).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white border rounded dark:bg-zinc-900 dark:border-zinc-800 text-zinc-600 leading-snug">
                          <strong>Proposal Pitch:</strong> "{app.proposal}"
                        </div>
                      </div>
                      <div className="flex gap-2 items-center shrink-0">
                        {app.status === "applied" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateApplicationStatus(app.id, "shortlisted")}>Shortlist</Button>
                            <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => handleEscrowPayment(app, budget)}>Hire & Escrow</Button>
                          </>
                        )}
                        {app.status === "shortlisted" && (
                          <>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 font-bold px-2 py-0.5 rounded">Shortlisted</Badge>
                            <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => handleEscrowPayment(app, budget)}>Hire & Escrow</Button>
                          </>
                        )}
                        {app.status === "hired" && (
                          <Badge className="bg-green-50 text-green-800 border-green-200 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2Icon className="size-3.5" /> Hired
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Invitations Sent tracker */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Invitations Status</CardTitle>
              <CardDescription>Track offers sent directly to creators.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {invitations.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No invitations sent yet.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                      <th className="py-2">Influencer</th>
                      <th className="py-2">Campaign</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {invitations.map(inv => {
                      const creator = influencers.find(i => i.id === inv.influencerId);
                      const camp = campaigns.find(c => c.id === inv.campaignId);
                      if (!creator || !camp) return null;
                      return (
                        <tr key={inv.id}>
                          <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-50">{creator.name}</td>
                          <td className="py-3 text-zinc-500">{camp.title}</td>
                          <td className="py-3">
                            <Badge variant="outline" className={`text-[10px] rounded ${inv.status === "accepted" ? "border-green-300 text-green-800" : "border-zinc-200 text-zinc-500"}`}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button size="xs" variant="outline" onClick={() => {
                              setActiveChatUser(creator.id);
                              setView("messages");
                            }}>Chat</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5.5. ACTIVE COLLABORATORS VIEW */}
      {view === "collaborators" && (
        <div className="space-y-6">
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Active Collaborators</CardTitle>
              <CardDescription>
                Review creators you are currently collaborating with on open contracts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const hiredApps = applications.filter(a => a.status === "hired").map(app => {
                  const applicant = influencers.find(i => i.id === app.influencerId);
                  const camp = campaigns.find(c => c.id === app.campaignId);
                  return {
                    id: app.id,
                    type: "Hired Pitch",
                    campaignTitle: camp?.title || app.campaignTitle || "Campaign Collaboration",
                    budget: camp?.budget || app.campaignBudget || 0,
                    influencerName: applicant?.name || app.influencerName || "Creator",
                    influencerUsername: applicant?.username || app.influencerName || "creator",
                    influencerAvatar: applicant?.profileImage || app.influencerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                    influencerId: app.influencerId
                  };
                });

                const acceptedInvites = invitations.filter(i => i.status === "accepted").map(inv => {
                  const applicant = influencers.find(i => i.id === inv.influencerId);
                  const camp = campaigns.find(c => c.id === inv.campaignId);
                  return {
                    id: inv.id,
                    type: "Invitation Accepted",
                    campaignTitle: camp?.title || inv.campaignTitle || "Campaign Collaboration",
                    budget: camp?.budget || inv.campaignBudget || 0,
                    influencerName: applicant?.name || inv.influencerName || "Creator",
                    influencerUsername: applicant?.username || inv.influencerName || "creator",
                    influencerAvatar: applicant?.profileImage || inv.companyLogo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                    influencerId: inv.influencerId
                  };
                });

                const totalCollaborators = [...hiredApps, ...acceptedInvites];

                if (totalCollaborators.length === 0) {
                  return <p className="text-center py-8 text-xs text-zinc-400">No active collaborators found.</p>;
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {totalCollaborators.map((c, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={c.influencerAvatar} className="size-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-850" />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-50">{c.influencerName}</p>
                            <p className="text-[10px] text-zinc-400">@{c.influencerUsername}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Campaign: <strong>{c.campaignTitle}</strong> • Budget: ₹{Number(c.budget).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-emerald-55 text-emerald-850 border-emerald-200 text-[10px] rounded px-1.5 py-0.5">
                            {c.type}
                          </Badge>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="text-[10px]"
                            onClick={() => {
                              setActiveChatUser(c.influencerId);
                              setView("messages");
                            }}
                          >
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. LIVE MESSAGING / CHAT */}
      {view === "messages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-zinc-200 rounded-lg overflow-hidden bg-white dark:border-zinc-800 dark:bg-zinc-900 h-[650px] text-xs">
          {/* User selector list */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-100 font-bold bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-sm">Active Inboxes</div>
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {influencers.slice(0, 4).map(inf => {
                const isSelected = activeChatUser === inf.id;
                return (
                  <div 
                    key={inf.id} 
                    onClick={() => setActiveChatUser(inf.id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 ${isSelected ? "bg-zinc-100/70 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : ""}`}
                  >
                    <img src={inf.profileImage} className="size-8 rounded-full object-cover" />
                    <div>
                      <p className="text-zinc-900 dark:text-zinc-100">{inf.name}</p>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">@{inf.username}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat box */}
          <div className="lg:col-span-2 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/20">
            {activeChatUserInfo ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={activeChatUserInfo.profileImage} className="size-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{activeChatUserInfo.name}</h4>
                      <p className="text-[10px] text-zinc-400">Response time: {activeChatUserInfo.responseTime}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded">Chat Connection Online</Badge>
                </div>

                {/* Messages log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {activeChatMessages.map(msg => {
                    const isBrand = msg.senderId === (dbUser?.id || "brand-1");
                    return (
                      <div key={msg.id} className={`flex ${isBrand ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-lg max-w-[70%] leading-relaxed ${
                          isBrand 
                            ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 rounded-br-none" 
                            : "bg-white border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 rounded-bl-none"
                        }`}>
                          <p>{msg.message}</p>
                          <span className="text-[8px] text-zinc-400 block mt-1.5 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input box */}
                <div className="p-4 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="text-zinc-400" onClick={() => alert("Simulation attachment: Please select a PDF Contract or Image.")}>
                    <PaperclipIcon className="size-4" />
                  </Button>
                  <Input 
                    placeholder="Type message to creator..." 
                    value={messageText} 
                    onChange={e => setMessageText(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button size="icon" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={handleSendMessage}>
                    <SendIcon className="size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <MessageSquareIcon className="size-12 text-zinc-300 mb-2" />
                Select an active creator inbox to begin collaborating.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. WALLET & PAYMENTS VIEW */}
      {view === "payments" && (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Fund Wallet Card */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Fund Brand Wallet</CardTitle>
              <CardDescription>Refill your escrow account balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-zinc-200 rounded text-center bg-zinc-50/50">
                <span className="text-[10px] text-zinc-400 uppercase">Available Funds</span>
                <p className="text-2xl font-extrabold text-zinc-900 mt-1">₹{walletBalance.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fund-amount">Amount (INR ₹)</Label>
                <Input id="fund-amount" type="number" placeholder="e.g. 50000" value={fundAmount} onChange={e => setFundAmount(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={handleFundWallet}>Add Funds</Button>
            </CardFooter>
          </Card>

          {/* Escrow ledger list */}
          <Card className="md:col-span-2 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Escrow Ledger Transactions</CardTitle>
              <CardDescription>Secured payouts associated with campaign deliverables.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {payments.length === 0 ? (
                <div className="text-center py-6 text-zinc-400">No transactions recorded.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                      <th className="py-2">Transaction Details</th>
                      <th className="py-2">Amount Locked</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {payments.map(pay => {
                      const creator = influencers.find(i => i.id === pay.influencerId);
                      return (
                        <tr key={pay.id}>
                          <td className="py-3">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-50">Protein Shake Launch</p>
                            <p className="text-[10px] text-zinc-400">Paid to: {creator ? creator.name : pay.influencerId}</p>
                          </td>
                          <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                            ₹{pay.amount.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className={`text-[10px] rounded ${pay.status === "released" ? "border-green-300 text-green-800" : "border-zinc-200 text-zinc-500"}`}>
                              {pay.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right space-x-1">
                            {pay.status === "escrowed" && (
                              <Button size="xs" className="text-[10px] h-7 bg-zinc-900 text-zinc-50" onClick={() => handleReleasePayment(pay.id)}>
                                Release Funds
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => alert("Downloading mock PDF Invoice invoice-" + pay.id + ".pdf")}>
                              <DownloadIcon className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
