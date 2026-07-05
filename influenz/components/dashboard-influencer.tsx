"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Influencer, Campaign, ApplicationState, InvitationState, ChatMessage, WalletTransaction, RatingReview } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserIcon, 
  SearchIcon, 
  MessageSquareIcon, 
  DatabaseIcon, 
  SendIcon, 
  MapPinIcon, 
  PaperclipIcon, 
  FileTextIcon, 
  CheckCircle2Icon,
  ShieldCheckIcon,
  TrendingUpIcon,
  EyeIcon,
  UploadIcon,
  RefreshCwIcon
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon
} from "@/components/social-icons";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface InfluencerProps {
  view: string;
  setView: (v: string) => void;
  campaigns: Campaign[];
  applications: ApplicationState[];
  setApplications: React.Dispatch<React.SetStateAction<ApplicationState[]>>;
  invitations: InvitationState[];
  setInvitations: React.Dispatch<React.SetStateAction<InvitationState[]>>;
  chats: ChatMessage[];
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  payments: WalletTransaction[];
  setPayments: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
  initialCampId?: string;
  initialApplyId?: string;
  dbUser: any;
  setDbUser: React.Dispatch<React.SetStateAction<any>>;
}

export function DashboardInfluencer({
  view,
  setView,
  campaigns,
  applications,
  setApplications,
  invitations,
  setInvitations,
  chats,
  setChats,
  payments,
  setPayments,
  initialCampId,
  initialApplyId,
  dbUser,
  setDbUser
}: InfluencerProps) {
  
  // Influencer profile settings (Simulated state synced with database)
  const [profileBio, setProfileBio] = useState("");
  const [postPrice, setPostPrice] = useState("0");
  const [reelPrice, setReelPrice] = useState("0");
  const [storyPrice, setStoryPrice] = useState("0");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync inputs with loaded DB user values
  useEffect(() => {
    if (dbUser && dbUser.influencer) {
      setProfileBio(dbUser.influencer.bio || "");
      setPostPrice(dbUser.influencer.pricePost?.toString() || "0");
      setReelPrice(dbUser.influencer.priceReel?.toString() || "0");
      setStoryPrice(dbUser.influencer.priceStory?.toString() || "0");
    }
  }, [dbUser]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSaveError("Session expired. Please log in again.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: profileBio,
          pricePost: postPrice,
          priceReel: reelPrice,
          priceStory: storyPrice,
          instagramUsername: dbUser?.influencer?.instagramUsername || "",
          youtubeChannelUrl: dbUser?.influencer?.youtubeChannelUrl || ""
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to update profile.");
      } else {
        setSaveSuccess(true);
        // Refresh local memory state
        setDbUser((prev: any) => ({
          ...prev,
          influencer: {
            ...prev.influencer,
            bio: profileBio,
            pricePost: Number(postPrice),
            priceReel: Number(reelPrice),
            priceStory: Number(storyPrice)
          }
        }));
      }
    } catch (err) {
      setSaveError("Connection error saving details.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Active Pitch state
  const [proposalPitch, setProposalPitch] = useState("");
  const [selectedCampForPitch, setSelectedCampForPitch] = useState<Campaign | null>(null);

  // Selected Campaign Details Modal
  const [selectedCamp, setSelectedCamp] = useState<Campaign | null>(null);

  // Chat parameters
  const [activeChatBrand, setActiveChatBrand] = useState<string>("brand-1"); // FitFuel Nutrition by default
  const [messageText, setMessageText] = useState("");

  // Invoice uploader simulation
  const [invoiceFile, setInvoiceFile] = useState("");
  const [payoutBank, setPayoutBank] = useState("");

  // Handle URL deep links
  useEffect(() => {
    if (initialCampId) {
      const found = campaigns.find(c => c.id === initialCampId);
      if (found) setSelectedCamp(found);
    }
    if (initialApplyId) {
      const found = campaigns.find(c => c.id === initialApplyId);
      if (found) setSelectedCampForPitch(found);
    }
  }, [initialCampId, initialApplyId, campaigns]);

  // Submit application pitch connected to MySQL
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampForPitch || !proposalPitch.trim()) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          campaignId: selectedCampForPitch.id,
          proposal: proposalPitch
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit proposal.");
        return;
      }

      const dbApp = data.application;
      const newApp: ApplicationState = {
        id: dbApp.id,
        campaignId: dbApp.campaignId,
        influencerId: dbApp.influencerId,
        status: dbApp.status || "applied",
        proposal: dbApp.proposal,
        createdAt: dbApp.createdAt || new Date().toISOString(),
        campaignTitle: selectedCampForPitch.title,
        campaignBudget: selectedCampForPitch.budget,
        influencerName: dbUser?.username || localStorage.getItem("userName") || "Creator",
        influencerAvatar: dbUser?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        influencerRating: Number(dbUser?.rating) || 4.8
      };

      setApplications(prev => [newApp, ...prev]);
      alert("Application submitted! Brand will review your proposal shortly.");
      
      setProposalPitch("");
      setSelectedCampForPitch(null);
      setView("applications");
    } catch (err) {
      console.error(err);
      alert("Connection issue sending pitch proposal to database.");
    }
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Accept direct invitation in MySQL
  const handleAcceptInvite = async (inviteId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/invitations/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ inviteId, status: "accepted" })
      });

      if (res.ok) {
        setInvitations(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status: "accepted" } : inv));
        alert("Invitation accepted! Brand partner has been notified.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update invitation.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error responding to invitation.");
    }
  };

  // Decline invitation in MySQL
  const handleDeclineInvite = async (inviteId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/invitations/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ inviteId, status: "rejected" })
      });

      if (res.ok) {
        setInvitations(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status: "rejected" } : inv));
        alert("Invitation declined.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update invitation.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error responding to invitation.");
    }
  };

  // Send message to brand connected to MySQL
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChatBrand) return;

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
          receiverId: activeChatBrand,
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

  // Upload Invoice Simulation
  const handleUploadInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceFile || !payoutBank) return;
    alert("Invoice submitted! Admin will audit and release escrow payments shortly.");
    setInvoiceFile("");
    setPayoutBank("");
  };

  // Collaborators derive from active database records
  const collaborators = useMemo(() => {
    const hiredApps = applications.filter(a => a.status === "hired").map(app => {
      const camp = campaigns.find(c => c.id === app.campaignId);
      return {
        brandId: camp?.brandId || "brand-1",
        companyName: camp?.companyName || "Brand Partner",
        companyLogo: camp?.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
        campaignTitle: camp?.title || app.campaignTitle || "Campaign"
      };
    });

    const acceptedInvites = invitations.filter(i => i.status === "accepted").map(inv => {
      const camp = campaigns.find(c => c.id === inv.campaignId);
      return {
        brandId: inv.brandId,
        companyName: camp?.companyName || inv.companyName || "Brand Partner",
        companyLogo: camp?.companyLogo || inv.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
        campaignTitle: camp?.title || inv.campaignTitle || "Campaign"
      };
    });

    // Deduplicate by brandId
    const uniqueBrandsMap = new Map<string, any>();
    [...hiredApps, ...acceptedInvites].forEach(b => {
      uniqueBrandsMap.set(b.brandId, b);
    });
    return Array.from(uniqueBrandsMap.values());
  }, [applications, invitations, campaigns]);

  const activeChatBrandInfo = useMemo(() => {
    return collaborators.find(c => c.brandId === activeChatBrand);
  }, [collaborators, activeChatBrand]);

  // Active Chats Selector
  const activeChatMessages = useMemo(() => {
    const myId = dbUser?.id || dbUser?.influencer?.userId || "inf-3";
    return chats.filter(
      c => (c.senderId === myId && c.receiverId === activeChatBrand) ||
           (c.senderId === activeChatBrand && c.receiverId === myId)
    );
  }, [chats, activeChatBrand, dbUser]);

  // Analytics counts
  const myIdForStats = dbUser?.id || dbUser?.influencer?.userId || "inf-3";
  const totalEarnings = payments.filter(p => p.influencerId === myIdForStats).reduce((a, c) => a + c.amount, 0);
  const activeEscrows = payments.filter(p => p.influencerId === myIdForStats && p.status === "escrowed").reduce((a, c) => a + c.amount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      {/* 1. OVERVIEW VIEW */}
      {view === "overview" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ananya Hegde's Creator Portal</h2>
              <p className="text-xs text-zinc-500">Track reach analytics, pending invoice payments, and direct invites.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-zinc-200">
                Wallet Escrow: <strong className="ml-1 text-zinc-900">₹{activeEscrows.toLocaleString()}</strong>
              </Badge>
              <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => setView("payments")}>
                Upload Invoice
              </Button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Total Platform Earnings</CardDescription>
                <CardTitle className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Total payouts processed via escrow</p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setView("collaborators")}
              className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all duration-150"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Active Collaborations</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {applications.filter(a => a.status === "hired").length + invitations.filter(i => i.status === "accepted").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Campaign agreements currently in progress</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Active Applications</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {applications.filter(a => a.status === "applied" || a.status === "shortlisted").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-zinc-400">Pitches currently reviewed by brands</p>
              </CardContent>
            </Card>
          </div>

          {/* Direct Invites & Open Briefs */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Direct Invites */}
            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Direct Collaboration Invites</CardTitle>
                <CardDescription>Review direct sponsorship contracts sent by brands.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invitations.filter(i => i.status === "sent").length === 0 ? (
                  <p className="text-center py-6 text-xs text-zinc-400">No invitations awaiting review.</p>
                ) : (
                  invitations.filter(i => i.status === "sent").map(inv => {
                    const camp = campaigns.find(c => c.id === inv.campaignId);
                    if (!camp) return null;
                    return (
                      <div key={inv.id} className="p-3 border border-zinc-200 rounded-lg dark:border-zinc-800 bg-zinc-50/50 flex items-center justify-between text-xs gap-4">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-50">{camp.companyName}</p>
                          <p className="text-[10px] text-zinc-500">Campaign: {camp.title} • Budget: ₹{camp.budget.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline" onClick={() => handleDeclineInvite(inv.id)}>Decline</Button>
                          <Button size="xs" className="bg-zinc-900 text-zinc-50" onClick={() => handleAcceptInvite(inv.id)}>Accept</Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Platform Analytics Card */}
            <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Geographic Reach Index</CardTitle>
                <CardDescription>Breakdown of followers location segments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Karnataka (Bengaluru)</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-850 rounded overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Maharashtra (Mumbai)</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-850 rounded overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: "25%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Tamil Nadu (Chennai)</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-850 rounded overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: "20%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 2. PROFILE & PORTFOLIO */}
      {view === "profile" && (
        <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="flex-row items-center gap-4 space-y-0 border-b pb-4 border-zinc-100 dark:border-zinc-800">
            <img src={dbUser?.influencer?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} className="size-16 rounded-full object-cover border grayscale" />
            <div>
              <div className="flex items-center gap-1">
                <CardTitle className="text-base font-bold">{localStorage.getItem("userName") || dbUser?.influencer?.username || "Creator"}</CardTitle>
                <ShieldCheckIcon className="size-4 text-zinc-900 fill-zinc-900 text-white dark:text-zinc-50 dark:fill-zinc-900" />
              </div>
              <CardDescription>@{dbUser?.influencer?.username || "creator"} • {dbUser?.email || ""}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="space-y-2">
              <Label htmlFor="prof-bio">Bio intro</Label>
              <Input id="prof-bio" value={profileBio} onChange={e => setProfileBio(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Post Quote (INR ₹)</Label>
                <Input value={postPrice} onChange={e => setPostPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Reel Quote (INR ₹)</Label>
                <Input value={reelPrice} onChange={e => setReelPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Story Quote (INR ₹)</Label>
                <Input value={storyPrice} onChange={e => setStoryPrice(e.target.value)} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200">Social Handles Linked</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border rounded flex items-center gap-2 dark:border-zinc-800">
                  <InstagramIcon className="size-4 text-zinc-500" />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Instagram</p>
                    <p className="text-[10px] text-zinc-400">
                      {dbUser?.influencer?.instagramUsername ? `@${dbUser.influencer.instagramUsername}` : "Not linked"}
                    </p>
                  </div>
                </div>
                <div className="p-3 border rounded flex items-center gap-2 dark:border-zinc-800">
                  <YoutubeIcon className="size-4 text-zinc-500" />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">YouTube Channel</p>
                    <p className="text-[10px] text-zinc-400">
                      {dbUser?.influencer?.youtubeChannelUrl ? dbUser.influencer.youtubeChannelUrl : "Not linked"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="space-y-1">
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              {saveSuccess && <p className="text-xs text-green-600 font-semibold">Changes synced successfully!</p>}
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 3. EXPLORE CAMPAIGNS BRIEF VIEW */}
      {view === "search_campaigns" && (
        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Marketplace Campaign Briefs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map(camp => (
              <Card key={camp.id} className="bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <img src={camp.companyLogo} className="size-9 rounded border shrink-0 object-cover" />
                    <div>
                      <h4 className="font-semibold text-xs leading-none text-zinc-900 dark:text-zinc-50">{camp.companyName}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">{camp.industry}</p>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold mt-3 line-clamp-1">{camp.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-3">
                  <p className="text-zinc-500 line-clamp-3">{camp.description}</p>
                  <div className="p-2 border rounded bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-850">
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Platform Required:</span>
                    <p className="font-semibold text-[10px] mt-0.5 text-zinc-800 dark:text-zinc-200">{camp.platform} ({camp.category})</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4 justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-400">Brief Escrow Budget</span>
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">₹{camp.budget.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="xs" variant="outline" onClick={() => setSelectedCamp(camp)}>Read Brief</Button>
                    <Button size="xs" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => setSelectedCampForPitch(camp)}>Pitch Proposal</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED BRIEF VIEW DIALOG SIMULATOR */}
      {selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-xs">
          <Card className="max-w-xl w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="flex-row items-start justify-between border-b pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <img src={selectedCamp.companyLogo} className="size-10 rounded border object-cover" />
                <div>
                  <CardTitle className="text-sm font-bold">{selectedCamp.title}</CardTitle>
                  <p className="text-xs text-zinc-400">{selectedCamp.companyName} • {selectedCamp.industry}</p>
                </div>
              </div>
              <Button size="xs" variant="ghost" className="text-zinc-500 h-6" onClick={() => setSelectedCamp(null)}>Close [x]</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-zinc-600 dark:text-zinc-400">
              <div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Brief Description</h4>
                <p className="leading-relaxed">{selectedCamp.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Deliverables & Guidelines</h4>
                <p className="leading-relaxed">{selectedCamp.requirements}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-zinc-50 border rounded p-3 dark:bg-zinc-950">
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold">Budget Offer</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">₹{selectedCamp.budget.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold">Platform Target</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedCamp.platform}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 font-semibold">Deadline</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedCamp.deadline}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-100 pt-3 dark:border-zinc-800 justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCamp(null)}>Cancel</Button>
              <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => {
                setSelectedCampForPitch(selectedCamp);
                setSelectedCamp(null);
              }}>Apply With Pitch</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* PITCH PROPOSAL DIALOG SIMULATOR */}
      {selectedCampForPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-xs">
          <Card className="max-w-md w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleSubmitProposal}>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Pitch Proposal: {selectedCampForPitch.title}</CardTitle>
                <CardDescription>Provide details about how you plan to curate this sponsorship.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pitch-text">Your Proposal Pitch</Label>
                  <Input 
                    id="pitch-text" 
                    placeholder="Describe your creative content approach..." 
                    value={proposalPitch} 
                    onChange={e => setProposalPitch(e.target.value)} 
                    required 
                  />
                  <p className="text-[9px] text-zinc-400">Mention delivery schedules, location details, or metrics.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 dark:border-zinc-800 justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedCampForPitch(null)}>Cancel</Button>
                <Button type="submit" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">Send Pitch</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* 4. APPLICATIONS & DIRECT INVITES */}
      {view === "applications" && (
        <div className="space-y-6 text-xs">
          {/* Applications list */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-sm font-bold">My Submitted Proposals</CardTitle>
              <CardDescription>Track the review progress of campaign applications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-6 text-zinc-500">No applications launched. Explore brief guidelines first.</div>
              ) : (
                applications.map(app => {
                  const camp = campaigns.find(c => c.id === app.campaignId);
                  if (!camp) return null;
                  return (
                    <div key={app.id} className="p-3 border rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">{camp.title}</p>
                        <p className="text-[10px] text-zinc-400">Brand: {camp.companyName} • Budget: ₹{camp.budget.toLocaleString()}</p>
                      </div>
                      <Badge className={`rounded text-[10px] font-bold ${
                        app.status === "hired" 
                          ? "bg-green-50 text-green-800 border-green-200" 
                          : app.status === "shortlisted" 
                          ? "bg-yellow-50 text-yellow-800 border-yellow-255" 
                          : "bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}>
                        {app.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>


          {/* Invitations Tracker */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-bold">Direct Collaboration Proposals</CardTitle>
                <CardDescription>Brands can invite you directly through searching your profile stats.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="size-7" 
                onClick={async () => {
                  const token = localStorage.getItem("authToken");
                  if (!token) return;
                  try {
                    const res = await fetch(`${BACKEND_URL}/api/auth/invitations`, {
                      method: "GET",
                      headers: { "Authorization": `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success && data.invitations) {
                      const mappedInvites = data.invitations.map((inv: any) => ({
                        id: inv.id,
                        brandId: inv.brandId,
                        influencerId: inv.influencerId,
                        campaignId: inv.campaignId,
                        status: inv.status || "sent",
                        campaignTitle: inv.campaignTitle || "Campaign Proposal",
                        companyName: inv.companyName || "Brand Partner",
                        companyLogo: inv.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                        campaignBudget: Number(inv.campaignBudget) || 0,
                        campaignPlatform: inv.campaignPlatform || "Instagram",
                        industry: "Sports & Nutrition",
                        influencerName: "Creator"
                      }));
                      setInvitations(mappedInvites);
                    }
                  } catch (err) {
                    console.error("Refresh error: ", err);
                  }
                }}
              >
                <RefreshCwIcon className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-center py-6 text-xs text-zinc-400">No invitations received yet.</p>
              ) : (
                invitations.map(inv => {
                  const camp = campaigns.find(c => c.id === inv.campaignId);
                  const title = camp?.title || inv.campaignTitle || "Campaign Collaboration";
                  const company = camp?.companyName || inv.companyName || "Brand Partner";
                  const budget = camp?.budget || inv.campaignBudget || 0;
                  return (
                    <div key={inv.id} className="p-3 border rounded-lg bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">{title}</p>
                        <p className="text-[10px] text-zinc-400">Brand Partner: {company} • Budget Offered: ₹{Number(budget).toLocaleString()}</p>
                      </div>
                      {inv.status === "sent" ? (
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline" onClick={() => handleDeclineInvite(inv.id)}>Decline</Button>
                          <Button size="xs" className="bg-zinc-900 text-zinc-50" onClick={() => handleAcceptInvite(inv.id)}>Accept Offer</Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className={`text-[10px] rounded border-zinc-200 ${
                          inv.status === "accepted" ? "bg-green-50 text-green-800" : "bg-zinc-100/50 text-zinc-500"
                        }`}>
                          {inv.status}
                        </Badge>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4.5. ACTIVE COLLABORATORS VIEW */}
      {view === "collaborators" && (
        <div className="space-y-6">
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Active Collaborations</CardTitle>
              <CardDescription>
                Review campaigns where your pitches were hired, or invitations accepted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const hiredApps = applications.filter(a => a.status === "hired").map(app => {
                  const camp = campaigns.find(c => c.id === app.campaignId);
                  return {
                    id: app.id,
                    type: "Pitch Hired",
                    campaignTitle: camp?.title || app.campaignTitle || "Campaign Collaboration",
                    budget: camp?.budget || app.campaignBudget || 0,
                    companyName: camp?.companyName || "Brand Partner",
                    companyLogo: camp?.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                    brandId: camp?.brandId || "brand-1"
                  };
                });

                const acceptedInvites = invitations.filter(i => i.status === "accepted").map(inv => {
                  const camp = campaigns.find(c => c.id === inv.campaignId);
                  return {
                    id: inv.id,
                    type: "Invitation Accepted",
                    campaignTitle: camp?.title || inv.campaignTitle || "Campaign Collaboration",
                    budget: camp?.budget || inv.campaignBudget || 0,
                    companyName: camp?.companyName || inv.companyName || "Brand Partner",
                    companyLogo: camp?.companyLogo || inv.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                    brandId: inv.brandId
                  };
                });

                const totalCollaborations = [...hiredApps, ...acceptedInvites];

                if (totalCollaborations.length === 0) {
                  return <p className="text-center py-8 text-xs text-zinc-400">No active collaborations found.</p>;
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {totalCollaborations.map((c, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={c.companyLogo} className="size-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-850" />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-50">{c.companyName}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Campaign: <strong>{c.campaignTitle}</strong> • Budget: ₹{Number(c.budget).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-emerald-55 text-emerald-855 border-emerald-200 text-[10px] rounded px-1.5 py-0.5">
                            {c.type}
                          </Badge>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="text-[10px]"
                            onClick={() => {
                              setActiveChatBrand(c.brandId);
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

      {/* 5. BRAND CHATS CONSOLE */}
      {view === "messages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-zinc-200 rounded-lg overflow-hidden bg-white dark:border-zinc-800 dark:bg-zinc-900 h-[600px] text-xs">
          {/* Active Contacts */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-100 font-bold bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-sm">Corporate Contacts</div>
            <div className="flex-1 overflow-y-auto">
              {collaborators.length === 0 ? (
                <div 
                  onClick={() => setActiveChatBrand("brand-1")}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 ${activeChatBrand === "brand-1" ? "bg-zinc-100/70 font-semibold" : ""}`}
                >
                  <div className="size-8 rounded bg-zinc-50 border overflow-hidden flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100" className="size-full object-cover" />
                  </div>
                  <div>
                    <p className="text-zinc-900 dark:text-zinc-100">FitFuel Nutrition</p>
                    <p className="text-[10px] text-zinc-400">Premium Partner (Demo)</p>
                  </div>
                </div>
              ) : (
                collaborators.map((col, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveChatBrand(col.brandId)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 ${activeChatBrand === col.brandId ? "bg-zinc-100/70 font-semibold" : ""}`}
                  >
                    <div className="size-8 rounded bg-zinc-50 border overflow-hidden flex items-center justify-center">
                      <img src={col.companyLogo} className="size-full object-cover" />
                    </div>
                    <div>
                      <p className="text-zinc-900 dark:text-zinc-100">{col.companyName}</p>
                      <p className="text-[10px] text-zinc-400">Campaign Partner • {col.campaignTitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat box */}
          <div className="lg:col-span-2 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/20">
            {activeChatBrand ? (
              <>
                <div className="p-4 border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-zinc-50 border overflow-hidden">
                      <img src={activeChatBrandInfo?.companyLogo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100"} className="size-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{activeChatBrandInfo?.companyName || "FitFuel Nutrition"}</h4>
                      <p className="text-[10px] text-zinc-400">{activeChatBrandInfo?.campaignTitle ? `Campaign: ${activeChatBrandInfo.campaignTitle}` : "Active Campaign Manager"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded">Chat Connected</Badge>
                </div>

                {/* Messages log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {activeChatMessages.map(msg => {
                    const myId = dbUser?.id || dbUser?.influencer?.userId || "inf-3";
                    const isBrand = msg.senderId !== myId;
                    return (
                      <div key={msg.id} className={`flex ${isBrand ? "justify-start" : "justify-end"}`}>
                        <div className={`p-3 rounded-lg max-w-[70%] leading-relaxed ${
                          isBrand 
                            ? "bg-white border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-100 rounded-bl-none" 
                            : "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 rounded-br-none"
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

                {/* Chat input */}
                <div className="p-4 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="text-zinc-400" onClick={() => alert("Simulation attachment: Please upload post drafts or contracts.")}>
                    <PaperclipIcon className="size-4" />
                  </Button>
                  <Input 
                    placeholder="Type message to brand partner..." 
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
                Select a corporate contact to start messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. WALLET & INVOICES VIEW */}
      {view === "payments" && (
        <div className="grid gap-6 md:grid-cols-3 text-xs">
          
          {/* Invoice uploader form */}
          <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleUploadInvoice}>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Submit Invoice & Payout</CardTitle>
                <CardDescription>File invoice for completed contract to request payment release from escrow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-details">Payout Bank Name & Account</Label>
                  <Input id="bank-details" placeholder="e.g. HDFC Bank - 50100983423..." value={payoutBank} onChange={e => setPayoutBank(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-file">Upload PDF Invoice</Label>
                  <Input id="inv-file" type="file" className="cursor-pointer" value={invoiceFile} onChange={e => setInvoiceFile(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">File Invoice</Button>
              </CardFooter>
            </form>
          </Card>

          {/* Payment ledger list */}
          <Card className="md:col-span-2 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Escrow Ledger Payments</CardTitle>
              <CardDescription>Payout timeline audits processed securely by system escrows.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                    <th className="py-2">Deliverable Name</th>
                    <th className="py-2">Transaction Amount</th>
                    <th className="py-2">Timeline Status</th>
                    <th className="py-2 text-right">PDF receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {payments.map(pay => (
                    <tr key={pay.id}>
                      <td className="py-3">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">Protein Shake Launch</p>
                        <p className="text-[10px] text-zinc-400">Ref: {pay.transactionId}</p>
                      </td>
                      <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{pay.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className={`text-[10px] rounded ${pay.status === "released" ? "border-green-300 text-green-800" : "border-zinc-200 text-zinc-500"}`}>
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => alert("Downloading PDF Invoice receipt...")}>
                          <FileTextIcon className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
