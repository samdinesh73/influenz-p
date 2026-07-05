"use client";

import * as React from "react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Import dashboards
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardBrand } from "@/components/dashboard-brand";
import { DashboardInfluencer } from "@/components/dashboard-influencer";

// Import mock data to seed local storage
import { 
  mockInfluencers, 
  mockCampaigns, 
  mockBrands, 
  initialApplications, 
  initialInvitations, 
  initialChats, 
  initialPayments, 
  initialReviews,
  Influencer,
  Campaign,
  Brand,
  ApplicationState,
  InvitationState,
  ChatMessage,
  WalletTransaction,
  RatingReview
} from "@/lib/mockData";

type RoleType = "master_admin" | "brand_owner" | "influencer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);

  // Read URL query parameters
  const urlRole = searchParams.get("role") as RoleType | null;
  const urlView = searchParams.get("view") || "overview";
  const urlInfId = searchParams.get("infId") || undefined;
  const urlInviteId = searchParams.get("inviteId") || undefined;
  const urlCampId = searchParams.get("campId") || undefined;
  const urlApplyId = searchParams.get("applyId") || undefined;

  // Active Role and Active View within the dashboard
  const [role, setRole] = useState<RoleType>("master_admin");
  const [activeView, setActiveView] = useState("overview");

  // Databases initialized in local storage for interactive sandbox
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<ApplicationState[]>([]);
  const [invitations, setInvitations] = useState<InvitationState[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [payments, setPayments] = useState<WalletTransaction[]>([]);
  const [reviews, setReviews] = useState<RatingReview[]>([]);

  // 1. Initial State Seeding on Mount


  useEffect(() => {
    const token = localStorage.getItem("authToken");
    // Query MySQL database for registered influencers
    fetch(`${BACKEND_URL}/api/auth/influencers`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.influencers && data.influencers.length > 0) {
          const mappedInfs = data.influencers.map((i: any) => ({
            id: i.userId,
            name: i.username || i.user?.email?.split("@")[0] || "Creator",
            username: i.username || "creator",
            avatar: i.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            profileImage: i.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            bio: i.bio || "",
            followers: i.followers || 0,
            averageReach: i.averageReach || 0,
            engagementRate: Number(i.engagementRate) || 4.2,
            platforms: ["Instagram", "YouTube"],
            location: {
              state: i.state || "Karnataka",
              city: i.city || "Bengaluru"
            },
            verified: i.verified,
            rating: Number(i.rating) || 4.8,
            priceStory: Number(i.priceStory) || 0,
            pricePost: Number(i.pricePost) || 0,
            priceReel: Number(i.priceReel) || 0,
            categories: Array.isArray(i.categories) ? i.categories : ["Fashion", "Lifestyle"],
            portfolio: i.portfolio && typeof i.portfolio === "object" && !Array.isArray(i.portfolio) && (i.portfolio as any).images 
              ? i.portfolio 
              : { 
                  images: [
                    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=200",
                    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200"
                  ],
                  videoUrl: "",
                  description: ""
                }
          }));
          setInfluencers(mappedInfs);
          localStorage.setItem("db_influencers", JSON.stringify(mappedInfs));
        } else {
          // Fallback to local storage or mocks
          const savedInfs = localStorage.getItem("db_influencers");
          if (savedInfs) {
            setInfluencers(JSON.parse(savedInfs));
          } else {
            localStorage.setItem("db_influencers", JSON.stringify(mockInfluencers));
            setInfluencers(mockInfluencers);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching creator catalog: ", err);
        // Fallback on network issue
        const savedInfs = localStorage.getItem("db_influencers");
        if (savedInfs) {
          setInfluencers(JSON.parse(savedInfs));
        } else {
          localStorage.setItem("db_influencers", JSON.stringify(mockInfluencers));
          setInfluencers(mockInfluencers);
        }
      });

    // Seed brands
    const savedBrands = localStorage.getItem("db_brands");
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    } else {
      localStorage.setItem("db_brands", JSON.stringify(mockBrands));
      setBrands(mockBrands);
    }



    // Query MySQL database for campaigns
    fetch(`${BACKEND_URL}/api/auth/campaigns`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.campaigns && data.campaigns.length > 0) {
          const mappedCamps = data.campaigns.map((c: any) => ({
            id: c.id,
            brandId: c.brandId,
            title: c.title,
            description: c.description,
            budget: Number(c.budget) || 0,
            category: c.category || "All",
            platform: c.platform || "Instagram",
            deadline: c.deadline || "2026-12-31",
            status: c.status || "published",
            companyName: c.brand?.companyName || "Brand Partner",
            companyLogo: c.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
            industry: c.brand?.industry || "Sports nutrition"
          }));
          setCampaigns(mappedCamps);
          localStorage.setItem("db_campaigns", JSON.stringify(mappedCamps));
        } else {
          // Fallback to local storage or mocks
          const savedCamps = localStorage.getItem("db_campaigns");
          if (savedCamps) {
            setCampaigns(JSON.parse(savedCamps));
          } else {
            localStorage.setItem("db_campaigns", JSON.stringify(mockCampaigns));
            setCampaigns(mockCampaigns);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching campaigns catalog: ", err);
        // Fallback on network issue
        const savedCamps = localStorage.getItem("db_campaigns");
        if (savedCamps) {
          setCampaigns(JSON.parse(savedCamps));
        } else {
          localStorage.setItem("db_campaigns", JSON.stringify(mockCampaigns));
          setCampaigns(mockCampaigns);
        }
      });





    // Query MySQL database for applications
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/applications`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.applications) {
          const mappedApps = data.applications.map((app: any) => ({
            id: app.id,
            campaignId: app.campaignId,
            influencerId: app.influencerId,
            status: app.status || "applied",
            proposal: app.proposal || "",
            createdAt: app.createdAt || new Date().toISOString(),
            campaignTitle: app.campaignTitle || "Campaign Proposal",
            campaignBudget: Number(app.campaignBudget) || 0,
            influencerName: app.influencerName || "Creator",
            influencerAvatar: app.influencerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            influencerRating: Number(app.influencerRating) || 4.8
          }));
          setApplications(mappedApps);
          localStorage.setItem("db_applications", JSON.stringify(mappedApps));
        } else {
          // Fallback to local storage or mocks
          const savedApps = localStorage.getItem("db_applications");
          if (savedApps) {
            setApplications(JSON.parse(savedApps));
          } else {
            localStorage.setItem("db_applications", JSON.stringify(initialApplications));
            setApplications(initialApplications);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching applications: ", err);
        // Fallback on network issue
        const savedApps = localStorage.getItem("db_applications");
        if (savedApps) {
          setApplications(JSON.parse(savedApps));
        } else {
          localStorage.setItem("db_applications", JSON.stringify(initialApplications));
          setApplications(initialApplications);
        }
      });
    }

    // Query MySQL database for invitations
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/invitations`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
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
          localStorage.setItem("db_invitations", JSON.stringify(mappedInvites));
        } else {
          // Fallback to local storage or mocks
          const savedInvites = localStorage.getItem("db_invitations");
          if (savedInvites) {
            setInvitations(JSON.parse(savedInvites));
          } else {
            localStorage.setItem("db_invitations", JSON.stringify(initialInvitations));
            setInvitations(initialInvitations);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching invitations: ", err);
        // Fallback on network issue
        const savedInvites = localStorage.getItem("db_invitations");
        if (savedInvites) {
          setInvitations(JSON.parse(savedInvites));
        } else {
          localStorage.setItem("db_invitations", JSON.stringify(initialInvitations));
          setInvitations(initialInvitations);
        }
      });
    }

    // Query MySQL database for chat messages history
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/messages`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          const mappedChats = data.messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            receiverId: m.receiverId,
            message: m.message,
            isRead: m.isRead || false,
            createdAt: m.createdAt || new Date().toISOString()
          }));
          setChats(mappedChats);
          localStorage.setItem("db_chats", JSON.stringify(mappedChats));
        } else {
          // Fallback to local storage or mocks
          const savedChats = localStorage.getItem("db_chats");
          if (savedChats) {
            setChats(JSON.parse(savedChats));
          } else {
            localStorage.setItem("db_chats", JSON.stringify(initialChats));
            setChats(initialChats);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching chats history: ", err);
        // Fallback on network issue
        const savedChats = localStorage.getItem("db_chats");
        if (savedChats) {
          setChats(JSON.parse(savedChats));
        } else {
          localStorage.setItem("db_chats", JSON.stringify(initialChats));
          setChats(initialChats);
        }
      });
    }

    // Seed payments
    const savedPayments = localStorage.getItem("db_payments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      localStorage.setItem("db_payments", JSON.stringify(initialPayments));
      setPayments(initialPayments);
    }

    // Seed reviews
    const savedReviews = localStorage.getItem("db_reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      localStorage.setItem("db_reviews", JSON.stringify(initialReviews));
      setReviews(initialReviews);
    }

    // Load role strictly from authenticated cached role.
    const cachedRole = localStorage.getItem("userRole") as RoleType | null;
    if (cachedRole) {
      setRole(cachedRole);
    } else {
      // Redirect unauthorized users to login page
      router.push("/");
      return;
    }

    // Fetch profile from database
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbUser(data.user);
        }
      })
      .catch(err => console.error("Error fetching database profile: ", err));

      // Fetch complete system audit data if master_admin
      if (cachedRole === "master_admin") {
        fetch(`${BACKEND_URL}/api/auth/admin/data`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {

            if (data.influencers) {
              const mappedInfs = data.influencers.map((i: any) => ({
                id: i.userId,
                name: i.username || i.user?.email?.split("@")[0] || "Creator",
                username: i.username || "creator",
                avatar: i.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                profileImage: i.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                bio: i.bio || "",
                followers: i.followers || 0,
                averageReach: i.averageReach || 0,
                engagementRate: Number(i.engagementRate) || 4.2,
                platforms: ["Instagram", "YouTube"],
                location: {
                  state: i.state || "Karnataka",
                  city: i.city || "Bengaluru"
                },
                verified: i.verified,
                rating: Number(i.rating) || 4.8,
                priceStory: Number(i.priceStory) || 0,
                pricePost: Number(i.pricePost) || 0,
                priceReel: Number(i.priceReel) || 0,
                categories: Array.isArray(i.categories) ? i.categories : ["Fashion", "Lifestyle"],
                portfolio: i.portfolio && typeof i.portfolio === "object" && !Array.isArray(i.portfolio) && (i.portfolio as any).images 
                  ? i.portfolio 
                  : { 
                      images: [
                        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=200",
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200"
                      ],
                      videoUrl: "",
                      description: ""
                    }
              }));
              setInfluencers(mappedInfs);
            }


            if (data.brands) {
              const mappedBrands = data.brands.map((b: any) => ({
                id: b.userId,
                name: b.companyName || "Brand Partner",
                companyName: b.companyName || "Brand Partner",
                logo: b.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                gst: b.gst || "",
                website: b.website || "",
                industry: b.industry || "General Industry",
                budget: b.marketingBudget ? Number(b.marketingBudget) : 100000,
                description: b.description || "",
                location: {
                  state: b.state || "Karnataka",
                  city: b.city || "Bengaluru"
                },
                verified: b.verified
              }));
              setBrands(mappedBrands);
            }

            if (data.campaigns) {
              const mappedCamps = data.campaigns.map((c: any) => ({
                id: c.id,
                brandId: c.brandId,
                title: c.title,
                description: c.description,
                budget: Number(c.budget) || 0,
                category: c.category || "All",
                platform: c.platform || "Instagram",
                deadline: c.deadline || "2026-12-31",
                status: c.status || "published",
                companyName: data.brands?.find((b: any) => b.userId === c.brandId)?.companyName || "Brand Partner",
                companyLogo: data.brands?.find((b: any) => b.userId === c.brandId)?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                industry: data.brands?.find((b: any) => b.userId === c.brandId)?.industry || "Sports nutrition"
              }));
              setCampaigns(mappedCamps);
            }
            if (data.payments) {
              const mappedPayments = data.payments.map((p: any) => ({
                id: p.id,
                campaignId: p.campaignId,
                brandId: p.brandId,
                influencerId: p.influencerId,
                amount: Number(p.amount) || 0,
                status: p.status || "escrowed",
                transactionId: p.transactionId || "",
                invoiceUrl: p.invoiceUrl || "",
                timestamp: new Date().toISOString()
              }));
              setPayments(mappedPayments);
            }
          }
        })
        .catch(err => console.error("Error fetching admin dashboard data: ", err));
      }
    }

    // Resolve URL view
    if (urlView) {
      setActiveView(urlView);
    }

  }, [urlRole, urlView]);

  // 1.5. Real-time background sync polling
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const interval = setInterval(() => {
      // Sync invitations
      fetch(`${BACKEND_URL}/api/auth/invitations`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
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
      })
      .catch(err => console.error("Error polling invitations: ", err));

      // Sync campaigns
      fetch(`${BACKEND_URL}/api/auth/campaigns`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.campaigns) {
          const mappedCamps = data.campaigns.map((c: any) => ({
            id: c.id,
            brandId: c.brandId,
            title: c.title,
            description: c.description,
            budget: Number(c.budget) || 0,
            category: c.category || "All",
            platform: c.platform || "Instagram",
            deadline: c.deadline || "2026-12-31",
            status: c.status || "published",
            companyName: c.brand?.companyName || "Brand Partner",
            companyLogo: c.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
            industry: c.brand?.industry || "Sports nutrition"
          }));
          setCampaigns(mappedCamps);
        }

      })
      .catch(err => console.error("Error polling campaigns: ", err));

      // Sync applications
      fetch(`${BACKEND_URL}/api/auth/applications`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.applications) {
          const mappedApps = data.applications.map((app: any) => ({
            id: app.id,
            campaignId: app.campaignId,
            influencerId: app.influencerId,
            status: app.status || "applied",
            proposal: app.proposal || "",
            createdAt: app.createdAt || new Date().toISOString(),
            campaignTitle: app.campaignTitle || "Campaign Proposal",
            campaignBudget: Number(app.campaignBudget) || 0,
            influencerName: app.influencerName || "Creator",
            influencerAvatar: app.influencerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            influencerRating: Number(app.influencerRating) || 4.8
          }));
          setApplications(mappedApps);

        }
      })
      .catch(err => console.error("Error polling applications: ", err));

      // Sync chat messages
      fetch(`${BACKEND_URL}/api/auth/messages`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          const mappedChats = data.messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            receiverId: m.receiverId,
            message: m.message,
            isRead: m.isRead || false,
            createdAt: m.createdAt || new Date().toISOString()
          }));
          setChats(mappedChats);
        }
      })
      .catch(err => console.error("Error polling chat messages: ", err));

    }, 5000); // Poll every 5 seconds for immediate real-time parity!

    return () => clearInterval(interval);
  }, []);

  // 2. Synchronize State to LocalStorage on modifications
  useEffect(() => {
    if (influencers.length > 0) localStorage.setItem("db_influencers", JSON.stringify(influencers));
  }, [influencers]);

  useEffect(() => {
    if (brands.length > 0) localStorage.setItem("db_brands", JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    if (campaigns.length > 0) localStorage.setItem("db_campaigns", JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    if (applications.length > 0) localStorage.setItem("db_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    if (invitations.length > 0) localStorage.setItem("db_invitations", JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    if (chats.length > 0) localStorage.setItem("db_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (payments.length > 0) localStorage.setItem("db_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (reviews.length > 0) localStorage.setItem("db_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Handle role switcher triggers
  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    setActiveView("overview");
    localStorage.setItem("userRole", newRole);
    router.push(`/dashboard?role=${newRole}`);
  };

  const getRoleLabel = () => {
    switch (role) {
      case "master_admin": return "Master Admin Control Panel";
      case "brand_owner": return "Brand Owner Operations Portal";
      case "influencer": return "Influencer / Creator Studio";
      default: return "Dashboard";
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        role={role} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        variant="inset" 
      />
      <SidebarInset>
        
        {/* Navigation header row */}
        <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{getRoleLabel()}</h1>
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="h-7 text-xs border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 dark:border-zinc-800">
              View Homepage
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          {role === "master_admin" && (
            <DashboardAdmin
              view={activeView}
              influencers={influencers}
              brands={brands}
              campaigns={campaigns}
              payments={payments}
              setInfluencers={setInfluencers}
              setBrands={setBrands}
              setCampaigns={setCampaigns}
              setPayments={setPayments}
            />
          )}

          {role === "brand_owner" && (
            <DashboardBrand
              view={activeView}
              setView={setActiveView}
              influencers={influencers}
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              applications={applications}
              setApplications={setApplications}
              invitations={invitations}
              setInvitations={setInvitations}
              chats={chats}
              setChats={setChats}
              payments={payments}
              setPayments={setPayments}
              reviews={reviews}
              setReviews={setReviews}
              initialInviteId={urlInviteId}
              initialInfId={urlInfId}
              dbUser={dbUser}
              setDbUser={setDbUser}
            />
          )}

          {role === "influencer" && (
            <DashboardInfluencer
              view={activeView}
              setView={setActiveView}
              campaigns={campaigns}
              applications={applications}
              setApplications={setApplications}
              invitations={invitations}
              setInvitations={setInvitations}
              chats={chats}
              setChats={setChats}
              payments={payments}
              setPayments={setPayments}
              initialCampId={urlCampId}
              initialApplyId={urlApplyId}
              dbUser={dbUser}
              setDbUser={setDbUser}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-500">
        Loading Influenz Sandbox Console...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
