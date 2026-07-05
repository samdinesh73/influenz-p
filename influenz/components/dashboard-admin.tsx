"use client";

import * as React from "react";
import { useState } from "react";
import { Influencer, Brand, Campaign, WalletTransaction, RatingReview } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UsersIcon, 
  FolderIcon, 
  DatabaseIcon, 
  ShieldCheckIcon, 
  XOctagonIcon, 
  AlertTriangleIcon, 
  CheckCircle2Icon, 
  XCircleIcon,
  Trash2Icon,
  SearchIcon,
  FileTextIcon,
  PlusIcon
} from "lucide-react";

interface AdminProps {
  view: string;
  influencers: Influencer[];
  brands: Brand[];
  campaigns: Campaign[];
  payments: WalletTransaction[];
  setInfluencers: React.Dispatch<React.SetStateAction<Influencer[]>>;
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setPayments: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
}

export function DashboardAdmin({
  view,
  influencers,
  brands,
  campaigns,
  payments,
  setInfluencers,
  setBrands,
  setCampaigns,
  setPayments
}: AdminProps) {
  
  // Filter keyword
  const [searchTerm, setSearchTerm] = useState("");

  // Metadata editor states
  const [categories, setCategories] = useState(["Fashion", "Food", "Travel", "Fitness", "Gaming", "Comedy", "Finance", "Education", "Tech", "Lifestyle", "Beauty", "Photography"]);
  const [newCat, setNewCat] = useState("");
  const [states, setStates] = useState(["Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "Delhi"]);
  const [newState, setNewState] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // User moderation actions synced with MySQL
  const handleApproveUser = async (userId: string, isBrand: boolean) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isBrand })
      });
      if (res.ok) {
        if (isBrand) {
          setBrands(prev => prev.map(b => b.id === userId ? { ...b, verified: true } : b));
        } else {
          setInfluencers(prev => prev.map(i => i.id === userId ? { ...i, verified: true } : i));
        }
      }
    } catch (err) {
      console.error("Failed to verify user in database: ", err);
    }
  };

  const handleVerifyToggle = async (userId: string, isBrand: boolean) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isBrand })
      });
      if (res.ok) {
        const data = await res.json();
        if (isBrand) {
          setBrands(prev => prev.map(b => b.id === userId ? { ...b, verified: data.verified } : b));
        } else {
          setInfluencers(prev => prev.map(i => i.id === userId ? { ...i, verified: data.verified } : i));
        }
      }
    } catch (err) {
      console.error("Failed to toggle verify state: ", err);
    }
  };

  const handleSuspendUser = async (userId: string, isBrand: boolean) => {
    const token = localStorage.getItem("authToken");
    const confirm = window.confirm("Are you sure you want to suspend and permanently delete this user from the system?");
    if (!confirm) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/suspend-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        alert("User account has been successfully suspended and deleted.");
        if (isBrand) {
          setBrands(prev => prev.filter(b => b.id !== userId));
        } else {
          setInfluencers(prev => prev.filter(i => i.id !== userId));
        }
      }
    } catch (err) {
      console.error("Failed to suspend user: ", err);
    }
  };

  // Campaign moderation actions
  const handleCampaignStatus = async (campId: string, status: 'published' | 'closed' | 'in_progress') => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/campaign-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ campaignId: campId, status })
      });
      if (res.ok) {
        setCampaigns(prev => prev.map(c => c.id === campId ? { ...c, status } : c));
      }
    } catch (err) {
      console.error("Failed to update campaign status: ", err);
    }
  };

  const handleDeleteCampaign = async (campId: string) => {
    const token = localStorage.getItem("authToken");
    const confirm = window.confirm("Are you sure you want to permanently delete this campaign?");
    if (!confirm) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/campaign-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ campaignId: campId, action: "delete" })
      });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campId));
      }
    } catch (err) {
      console.error("Failed to delete campaign: ", err);
    }
  };

  // Metadata addition helpers
  const addCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewCat("");
    }
  };

  const addState = () => {
    if (newState.trim() && !states.includes(newState.trim())) {
      setStates([...states, newState.trim()]);
      setNewState("");
    }
  };

  // Dynamic calculations for Overview Metrics
  const totalInfluencers = influencers.length;
  const totalBrands = brands.length;
  const activeCampaigns = campaigns.filter(c => c.status === "published").length;
  const escrowSum = payments.reduce((acc, pay) => acc + pay.amount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950">
      
      {/* 1. OVERVIEW VIEW */}
      {view === "overview" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">System Diagnostics & KPI</h2>
          </div>

          {/* KPI grid with flat border design */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase">Total Creators</CardTitle>
                <UsersIcon className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInfluencers}</div>
                <p className="text-[10px] text-zinc-400 mt-1">Platform registered catalog</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase">Registered Brands</CardTitle>
                <UsersIcon className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBrands}</div>
                <p className="text-[10px] text-zinc-400 mt-1">Direct corporate advertisers</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase">Active Campaigns</CardTitle>
                <FolderIcon className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns}</div>
                <p className="text-[10px] text-zinc-400 mt-1">Currently open for pitches</p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase">Total Wallet Escrow</CardTitle>
                <DatabaseIcon className="size-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{escrowSum.toLocaleString()}</div>
                <p className="text-[10px] text-zinc-400 mt-1">Locked platform volume</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick List for moderation */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Recent Campaign Submissions</CardTitle>
                <CardDescription>Verify and approve newly launched ads before they go public.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {campaigns.map(camp => (
                  <div key={camp.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{camp.title}</p>
                      <p className="text-[10px] text-zinc-500">{camp.companyName} • Budget: ₹{camp.budget.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" variant="outline" className="text-[10px] h-6" onClick={() => handleCampaignStatus(camp.id, "published")}>Approve</Button>
                      <Button size="xs" variant="ghost" className="text-[10px] text-red-500 h-6" onClick={() => handleDeleteCampaign(camp.id)}>Reject</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Account Verification Submissions</CardTitle>
                <CardDescription>Review credentials submitted by users requesting blue check badge.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {influencers.filter(inf => !inf.verified).map(inf => (
                  <div key={inf.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <img src={inf.profileImage} className="size-8 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{inf.name}</p>
                        <p className="text-[10px] text-zinc-500">@{inf.username} • Followers: {inf.followers.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="xs" className="text-[10px] h-6 bg-zinc-900 text-zinc-50" onClick={() => handleVerifyToggle(inf.id, false)}>Approve Proof</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 2. USER MODERATION VIEW */}
      {view === "users" && (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">User Database & Moderation Controls</CardTitle>
                <CardDescription>Manage user roles, grant verified badges, or restrict users violating terms.</CardDescription>
              </div>
              <div className="relative max-w-xs w-full">
                <SearchIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                <Input 
                  placeholder="Filter users..." 
                  className="pl-9" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold">
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Details</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Influencers */}
                {influencers.filter(inf => inf.name.toLowerCase().includes(searchTerm.toLowerCase())).map(inf => (
                  <tr key={inf.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-[10px] rounded border-zinc-200">Influencer</Badge>
                    </td>
                    <td className="py-3 px-2 font-medium">
                      <div className="flex items-center gap-2">
                        <img src={inf.profileImage} className="size-6 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-zinc-950 dark:text-zinc-50">{inf.name}</span>
                            {inf.verified && <ShieldCheckIcon className="size-3.5 text-zinc-950 dark:text-zinc-50" />}
                          </div>
                          <span className="text-[10px] text-zinc-400">@{inf.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-zinc-500">
                      {inf.followers.toLocaleString()} followers • {inf.location.state}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={`text-[10px] rounded ${inf.verified ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}>
                        {inf.verified ? "Approved & Verified" : "Pending Verification"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1">
                      <Button size="xs" variant="outline" className="text-[10px] h-7" onClick={() => handleVerifyToggle(inf.id, false)}>
                        Toggle Badge
                      </Button>
                      <Button size="xs" variant="ghost" className="text-[10px] text-red-500 h-7" onClick={() => handleSuspendUser(inf.id, false)}>
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}

                {/* Brands */}
                {brands.filter(b => b.companyName.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-[10px] rounded border-zinc-200">Brand Owner</Badge>
                    </td>
                    <td className="py-3 px-2 font-medium">
                      <div className="flex items-center gap-2">
                        <img src={b.logo} className="size-6 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-zinc-950 dark:text-zinc-50">{b.companyName}</span>
                            {b.verified && <ShieldCheckIcon className="size-3.5 text-zinc-950 dark:text-zinc-50" />}
                          </div>
                          <span className="text-[10px] text-zinc-400">{b.website}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-zinc-500">
                      GSTIN: {b.gst} • {b.location.state}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={`text-[10px] rounded ${b.verified ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}>
                        {b.verified ? "Approved & Verified" : "Pending Verification"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1">
                      <Button size="xs" variant="outline" className="text-[10px] h-7" onClick={() => handleVerifyToggle(b.id, true)}>
                        Toggle Badge
                      </Button>
                      <Button size="xs" variant="ghost" className="text-[10px] text-red-500 h-7" onClick={() => handleSuspendUser(b.id, true)}>
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 3. CAMPAIGN APPROVALS */}
      {view === "campaigns" && (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-base font-bold">Campaign Postings Moderation</CardTitle>
            <CardDescription>Review campaigns before publication to prevent spam or non-payment risks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.map(camp => (
              <div key={camp.id} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{camp.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase rounded">{camp.platform}</Badge>
                    <Badge className={`text-[10px] rounded ${camp.status === "published" ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" : "bg-yellow-100 text-yellow-800"}`}>{camp.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500">Sponsored by: <strong className="text-zinc-700 dark:text-zinc-300">{camp.companyName}</strong> • Category: {camp.category} • Budget: ₹{camp.budget.toLocaleString()}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{camp.description}</p>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {camp.status !== "published" && (
                    <Button size="sm" className="h-8 text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => handleCampaignStatus(camp.id, "published")}>
                      Approve Campaign
                    </Button>
                  )}
                  {camp.status === "published" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-zinc-600" onClick={() => handleCampaignStatus(camp.id, "closed")}>
                      Close / Stop
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500 flex items-center justify-center gap-1.5" onClick={() => handleDeleteCampaign(camp.id)}>
                    <Trash2Icon className="size-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. ESCROW & WALLET PAYMENTS */}
      {view === "payments" && (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-base font-bold">Escrow Wallet Auditing</CardTitle>
            <CardDescription>Escrow funds are held securely by the platform until campaign content is approved.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold">
                  <th className="py-3 px-2">Transaction ID</th>
                  <th className="py-3 px-2">Campaign Details</th>
                  <th className="py-3 px-2">Amount Locked</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{pay.transactionId}</td>
                    <td className="py-3 px-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">FitFuel Protein Shake Launch</p>
                      <p className="text-[10px] text-zinc-400">Brand ID: {pay.brandId} → Creator ID: {pay.influencerId}</p>
                    </td>
                    <td className="py-3 px-2 font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{pay.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={`text-[10px] rounded ${
                        pay.status === "released" 
                          ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200" 
                          : pay.status === "refunded" 
                          ? "bg-red-100 text-red-800 border-red-200" 
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}>
                        {pay.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1">
                      {pay.status === "escrowed" && (
                        <>
                          <Button size="xs" className="text-[10px] h-7 bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => {
                            setPayments(prev => prev.map(p => p.id === pay.id ? { ...p, status: "released" } : p));
                          }}>
                            Force Release
                          </Button>
                          <Button size="xs" variant="outline" className="text-[10px] h-7 text-red-500 hover:text-red-600" onClick={() => {
                            setPayments(prev => prev.map(p => p.id === pay.id ? { ...p, status: "refunded" } : p));
                          }}>
                            Refund Brand
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 5. VERIFICATIONS SECTION */}
      {view === "verification" && (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-base font-bold">GST & Credentials Verifications</CardTitle>
            <CardDescription>Audit business registration files to ensure marketplace safety.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brands.filter(b => !b.verified).length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">No pending verification documents in queue.</div>
            ) : (
              brands.filter(b => !b.verified).map(b => (
                <div key={b.id} className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={b.logo} className="size-8 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-50">{b.companyName}</h4>
                        <p className="text-[10px] text-zinc-400">{b.industry} • {b.website}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-yellow-200 text-yellow-800 bg-yellow-50">Pending Review</Badge>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">GSTIN Certificate: <span className="font-mono">{b.gst}</span></p>
                      <p className="text-zinc-500">Location: {b.location.city}, {b.location.state}</p>
                      <div className="flex items-center gap-1.5 text-zinc-900 font-semibold cursor-pointer dark:text-zinc-50">
                        <FileTextIcon className="size-3.5" />
                        <span className="underline">View Submitted GST PDF.pdf</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button size="sm" className="h-8 text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={() => handleApproveUser(b.id, true)}>
                        Approve Company
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500" onClick={() => handleSuspendUser(b.id, true)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. METADATA SETTINGS PANEL */}
      {view === "metadata" && (
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Categories Manager */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Marketplace Campaign Categories</CardTitle>
              <CardDescription>Add or remove sectors that influencers specialize in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="New Category Name" 
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)} 
                />
                <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={addCategory}>
                  <PlusIcon className="size-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {categories.map(cat => (
                  <Badge key={cat} variant="outline" className="text-[10px] rounded border-zinc-200 flex items-center gap-1">
                    <span>{cat}</span>
                    <button className="text-zinc-400 hover:text-zinc-900" onClick={() => setCategories(prev => prev.filter(c => c !== cat))}>×</button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* States Manager */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Active Geographies (States)</CardTitle>
              <CardDescription>Limit local search selections to active divisions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="New State Name" 
                  value={newState} 
                  onChange={e => setNewState(e.target.value)} 
                />
                <Button size="sm" className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" onClick={addState}>
                  <PlusIcon className="size-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {states.map(st => (
                  <Badge key={st} variant="outline" className="text-[10px] rounded border-zinc-200 flex items-center gap-1">
                    <span>{st}</span>
                    <button className="text-zinc-400 hover:text-zinc-900" onClick={() => setStates(prev => prev.filter(s => s !== st))}>×</button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
