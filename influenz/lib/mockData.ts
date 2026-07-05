export interface Influencer {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  bio: string;
  followers: number;
  followersRange: '1K-10K' | '10K-50K' | '50K-100K' | '100K+';
  averageReach: number;
  engagementRate: number;
  platforms: string[];
  categories: string[];
  location: {
    country: string;
    state: string;
    district: string;
    city: string;
  };
  languages: string[];
  pricePost: number;
  priceReel: number;
  priceStory: number;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  verified: boolean;
  rating: number;
  responseTime: string;
  portfolio: {
    images: string[];
    videos: string[];
    brandsWorked: string[];
    achievements: string[];
  };
  availability: string[]; // Days available
}

export interface Campaign {
  id: string;
  brandId: string;
  companyName: string;
  companyLogo: string;
  industry: string;
  title: string;
  budget: number;
  duration: string;
  platform: string;
  deadline: string;
  category: string;
  description: string;
  requirements: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'closed';
  applicantsCount: number;
}

export interface Brand {
  id: string;
  companyName: string;
  logo: string;
  gst: string;
  website: string;
  industry: string;
  location: {
    country: string;
    state: string;
    district: string;
    city: string;
  };
  description: string;
  marketingBudget: number;
  preferredCategories: string[];
  targetAudience: string;
  verified: boolean;
}

// 1. Mock Influencers Data
export const mockInfluencers: Influencer[] = [
  {
    id: "inf-1",
    username: "rohit_clicks",
    name: "Rohit Sharma",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    bio: "Travel and Photography enthusiast. Capture stories around the world.",
    followers: 120000,
    followersRange: "100K+",
    averageReach: 45000,
    engagementRate: 4.8,
    platforms: ["Instagram", "YouTube"],
    categories: ["Travel", "Photography", "Lifestyle"],
    location: { country: "India", state: "Maharashtra", district: "Mumbai", city: "Mumbai" },
    languages: ["Hindi", "English"],
    pricePost: 8000,
    priceReel: 15000,
    priceStory: 5000,
    gender: "Male",
    age: 26,
    verified: true,
    rating: 4.9,
    responseTime: "Within 2 hours",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["Vlog from Spiti Valley", "Cinematic Mumbai"],
      brandsWorked: ["GoPro", "Wildcraft", "Sony India"],
      achievements: ["Best Travel Creator 2025", "Sony Brand Ambassador"]
    },
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "inf-2",
    username: "priya_bakes",
    name: "Priya Nair",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    bio: "Home baker turned culinary reviewer. Sharing easy recipes & cafe reviews.",
    followers: 45000,
    followersRange: "10K-50K",
    averageReach: 15000,
    engagementRate: 6.2,
    platforms: ["Instagram", "Facebook"],
    categories: ["Food", "Lifestyle"],
    location: { country: "India", state: "Kerala", district: "Ernakulam", city: "Kochi" },
    languages: ["Malayalam", "English", "Tamil"],
    pricePost: 3000,
    priceReel: 6000,
    priceStory: 2000,
    gender: "Female",
    age: 28,
    verified: true,
    rating: 4.7,
    responseTime: "Within 1 hour",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["3-ingredient chocolate cake", "Kochi Street Food Tour"],
      brandsWorked: ["Amul", "Nestle", "Urban Platter"],
      achievements: ["Top 50 Food Creators in South India"]
    },
    availability: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    id: "inf-3",
    username: "tech_ananya",
    name: "Ananya Hegde",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    bio: "Unboxing tomorrow's gadgets today. Software engineer & tech reviewer.",
    followers: 95000,
    followersRange: "50K-100K",
    averageReach: 38000,
    engagementRate: 3.9,
    platforms: ["YouTube", "Twitter", "LinkedIn"],
    categories: ["Tech", "Education"],
    location: { country: "India", state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru" },
    languages: ["Kannada", "English", "Telugu"],
    pricePost: 10000,
    priceReel: 18000,
    priceStory: 6000,
    gender: "Female",
    age: 24,
    verified: true,
    rating: 4.8,
    responseTime: "Within 4 hours",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["iPhone 17 Pro Review", "My Coding Setup 2026"],
      brandsWorked: ["Intel", "HP India", "Logitech"],
      achievements: ["Intel Software Creator 2025"]
    },
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    id: "inf-4",
    username: "fit_kabir",
    name: "Kabir Dev",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    bio: "Transforming lives one meal and rep at a time. Certified trainer.",
    followers: 8500,
    followersRange: "1K-10K",
    averageReach: 3000,
    engagementRate: 8.5,
    platforms: ["Instagram", "YouTube"],
    categories: ["Fitness", "Lifestyle"],
    location: { country: "India", state: "Tamil Nadu", district: "Chennai", city: "Chennai" },
    languages: ["Tamil", "English", "Hindi"],
    pricePost: 1500,
    priceReel: 3000,
    priceStory: 1000,
    gender: "Male",
    age: 30,
    verified: false,
    rating: 4.5,
    responseTime: "Within 12 hours",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["15-min Home HIIT Workout", "Full Day of Eating - Clean"],
      brandsWorked: ["Myprotein India", "Cult.fit"],
      achievements: ["Gold Medalist Benchpress Chennai"]
    },
    availability: ["Saturday", "Sunday"]
  },
  {
    id: "inf-5",
    username: "comedy_karthik",
    name: "Karthik Raja",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    bio: "Making you laugh at relatable South Indian moments. Digital Creator.",
    followers: 250000,
    followersRange: "100K+",
    averageReach: 180000,
    engagementRate: 11.2,
    platforms: ["Instagram", "YouTube", "Snapchat"],
    categories: ["Comedy", "Lifestyle"],
    location: { country: "India", state: "Tamil Nadu", district: "Madurai", city: "Madurai" },
    languages: ["Tamil", "English"],
    pricePost: 12000,
    priceReel: 25000,
    priceStory: 8000,
    gender: "Male",
    age: 23,
    verified: true,
    rating: 4.9,
    responseTime: "Within 3 hours",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["When Mom says 'Wait till Dad comes'", "Engineering Semester Exams Vibe"],
      brandsWorked: ["Swiggy", "Zomato", "Spotify India"],
      achievements: ["Creator of the Month by YouTube Tamil"]
    },
    availability: ["Wednesday", "Thursday", "Friday", "Saturday"]
  },
  {
    id: "inf-6",
    username: "shreya_glam",
    name: "Shreya Gupta",
    profileImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=200",
    bio: "Skincare junkie & makeup stylist. Empowering self-love through beauty.",
    followers: 68000,
    followersRange: "50K-100K",
    averageReach: 24000,
    engagementRate: 5.1,
    platforms: ["Instagram", "Pinterest", "YouTube"],
    categories: ["Beauty", "Fashion", "Lifestyle"],
    location: { country: "India", state: "Delhi", district: "New Delhi", city: "Delhi" },
    languages: ["Hindi", "English"],
    pricePost: 5000,
    priceReel: 9000,
    priceStory: 3000,
    gender: "Female",
    age: 22,
    verified: false,
    rating: 4.6,
    responseTime: "Within 2 hours",
    portfolio: {
      images: [
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=300"
      ],
      videos: ["Glass Skin Routine", "Summer Wedding Guest Tutorial"],
      brandsWorked: ["Nykaa", "L'Oreal", "Plum Goodness"],
      achievements: ["Featured in Nykaa Beauty Creators List"]
    },
    availability: ["Monday", "Tuesday", "Wednesday", "Saturday"]
  }
];

// 2. Mock Campaigns Data
export const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    brandId: "brand-1",
    companyName: "FitFuel Nutrition",
    companyLogo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
    industry: "Fitness & Nutrition",
    title: "FitFuel Protein Shake Launch",
    budget: 45000,
    duration: "1 Month",
    platform: "Instagram",
    deadline: "2026-07-25",
    category: "Fitness",
    description: "Launch of our new organic pea protein shakes. We need 1 Reel and 2 Stories focusing on taste and nutrition.",
    requirements: "Followers > 10K, engagement rate > 4%, fitness/sports niche, location in South India preferred.",
    status: "published",
    applicantsCount: 6
  },
  {
    id: "camp-2",
    brandId: "brand-2",
    companyName: "Wanderlust India",
    companyLogo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=100",
    industry: "Travel & Hospitality",
    title: "Monsoon In Western Ghats campaign",
    budget: 85000,
    duration: "2 Weeks",
    platform: "YouTube",
    deadline: "2026-07-20",
    category: "Travel",
    description: "Promotion of luxury eco-resorts in Munnar and Coorg. Looking for a high-quality travel vlog integration.",
    requirements: "Travel content creator, beautiful cinematography, YouTube subscriber base > 50K.",
    status: "published",
    applicantsCount: 4
  },
  {
    id: "camp-3",
    brandId: "brand-3",
    companyName: "Kora Clothing",
    companyLogo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=100",
    industry: "Fashion",
    title: "Handloom Ethnic Wear Promo",
    budget: 20000,
    duration: "10 Days",
    platform: "Instagram",
    deadline: "2026-07-30",
    category: "Fashion",
    description: "Promoting our new festive handloom saree and kurta collection. 1 Aesthetic grid post & 1 Story with purchase link.",
    requirements: "Fashion/Aesthetic niche, Tamil or Telugu speaking creators, high engagement.",
    status: "published",
    applicantsCount: 11
  },
  {
    id: "camp-4",
    brandId: "brand-4",
    companyName: "Logix Academy",
    companyLogo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=100",
    industry: "Education & EdTech",
    title: "Fullstack Bootcamp Admissions 2026",
    budget: 50000,
    duration: "3 Weeks",
    platform: "LinkedIn",
    deadline: "2026-08-05",
    category: "Education",
    description: "Drive registrations for our live cohort coding bootcamp. 1 text post + infographic highlighting curriculum.",
    requirements: "Software developers, tech writers or tech creators on LinkedIn, active tech community.",
    status: "published",
    applicantsCount: 3
  }
];

// 3. Mock Brands Data
export const mockBrands: Brand[] = [
  {
    id: "brand-1",
    companyName: "FitFuel Nutrition",
    logo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
    gst: "29AAAAA1111A1Z1",
    website: "https://fitfuel.in",
    industry: "Fitness & Nutrition",
    location: { country: "India", state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru" },
    description: "Premium sports nutrition brand focusing on clean plant-based ingredients for athletes.",
    marketingBudget: 500000,
    preferredCategories: ["Fitness", "Lifestyle", "Food"],
    targetAudience: "Active gym-goers, health-conscious youth, aged 18-35.",
    verified: true
  },
  {
    id: "brand-2",
    companyName: "Wanderlust India",
    logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=100",
    gst: "32BBBBB2222B2Z2",
    website: "https://wanderlustindia.co",
    industry: "Travel & Hospitality",
    location: { country: "India", state: "Kerala", district: "Ernakulam", city: "Kochi" },
    description: "Curators of luxury eco-retreats and immersive offbeat travel experiences across India.",
    marketingBudget: 1200000,
    preferredCategories: ["Travel", "Photography"],
    targetAudience: "Premium travelers, couples, adventure-seekers, aged 25-50.",
    verified: true
  }
];

// Shared application and workflow state (Simulated Local Storage Database)
export interface ApplicationState {
  id: string;
  campaignId: string;
  influencerId: string;
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected';
  proposal: string;
  createdAt: string;
  campaignTitle?: string;
  campaignBudget?: number;
  influencerName?: string;
  influencerAvatar?: string;
  influencerRating?: number;
}

export interface InvitationState {
  id: string;
  brandId: string;
  influencerId: string;
  campaignId: string;
  status: 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  campaignTitle?: string;
  companyName?: string;
  companyLogo?: string;
  campaignBudget?: number;
  campaignPlatform?: string;
  industry?: string;
  influencerName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  attachments?: { name: string; url: string; type: string }[];
  isRead: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  campaignId: string;
  brandId: string;
  influencerId: string;
  amount: number;
  status: 'escrowed' | 'released' | 'refunded';
  transactionId: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface RatingReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  campaignTitle: string;
  rating: number;
  communication: number;
  paymentSpeed?: number;
  contentQuality?: number;
  professionalism: number;
  comment: string;
  createdAt: string;
}

// Initial Simulated Application Tables
export const initialApplications: ApplicationState[] = [
  {
    id: "app-1",
    campaignId: "camp-1",
    influencerId: "inf-4", // Kabir Dev
    status: "shortlisted",
    proposal: "Hey, I can make a high-energy Reel demonstrating the shake mixing process pre-workout at my local gym in Chennai. I have a very active local follower base.",
    createdAt: "2026-07-04T12:00:00Z"
  },
  {
    id: "app-2",
    campaignId: "camp-1",
    influencerId: "inf-2", // Priya Nair
    status: "applied",
    proposal: "I'd love to integrate the FitFuel shakes into a high-reach breakfast recipe Reel! Protein pancakes are a huge trend right now.",
    createdAt: "2026-07-04T14:30:00Z"
  }
];

export const initialInvitations: InvitationState[] = [
  {
    id: "inv-1",
    brandId: "brand-1",
    influencerId: "inf-1", // Rohit Sharma
    campaignId: "camp-1",
    status: "sent",
    createdAt: "2026-07-04T10:00:00Z"
  }
];

export const initialChats: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "brand-1",
    receiverId: "inf-4",
    message: "Hey Kabir! We loved your proposal for the FitFuel protein launch. Are you okay with the ₹3,000/Reel pricing?",
    isRead: true,
    createdAt: "2026-07-04T13:00:00Z"
  },
  {
    id: "msg-2",
    senderId: "inf-4",
    receiverId: "brand-1",
    message: "Hey! Yes, ₹3,000 is perfectly fine for me. I can deliver the draft video by next Tuesday. Should I include the nutrition chart breakdown?",
    isRead: true,
    createdAt: "2026-07-04T13:15:00Z"
  },
  {
    id: "msg-3",
    senderId: "brand-1",
    receiverId: "inf-4",
    message: "Yes please, highlight that it has 25g organic protein and 0g sugar. Let me know when you can start.",
    isRead: false,
    createdAt: "2026-07-04T13:30:00Z"
  }
];

export const initialPayments: WalletTransaction[] = [
  {
    id: "pay-1",
    campaignId: "camp-1",
    brandId: "brand-1",
    influencerId: "inf-4",
    amount: 3000,
    status: "escrowed",
    transactionId: "TXN_7849204812",
    createdAt: "2026-07-04T15:00:00Z"
  }
];

export const initialReviews: RatingReview[] = [
  {
    id: "rev-1",
    reviewerId: "brand-2",
    reviewerName: "Wanderlust India",
    targetId: "inf-1",
    campaignTitle: "Western Ghats Monsoon Promotion",
    rating: 4.8,
    communication: 5.0,
    contentQuality: 4.8,
    professionalism: 4.6,
    comment: "Excellent high-definition video. Delivered on time and followed all resort instructions perfectly. Highly recommended!",
    createdAt: "2026-06-15T18:00:00Z"
  }
];
