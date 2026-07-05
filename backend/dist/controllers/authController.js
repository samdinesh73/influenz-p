"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.createMessage = exports.updateApplicationStatus = exports.getApplications = exports.createApplication = exports.updateInvitationStatus = exports.getInvitations = exports.createInvitation = exports.getCampaigns = exports.createCampaign = exports.getInfluencers = exports.suspendUser = exports.moderateCampaign = exports.toggleVerifyUser = exports.getAdminData = exports.updateProfile = exports.getProfile = exports.authenticateToken = exports.login = exports.completeProfile = exports.verifyOtp = exports.register = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Helper to send email OTP via Nodemailer
async function sendOTPEmail(email, code) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 2525;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || "noreply@influenz.com";
    // Check if SMTP is configured. If not, log to console as fallback.
    if (!host || !user || !pass) {
        console.log("\n==================================================");
        console.log(`[EMAIL OTP DEMO MODE]`);
        console.log(`To: ${email}`);
        console.log(`Verification Code: ${code}`);
        console.log(`Expires in: 15 minutes`);
        console.log("==================================================\n");
        return true;
    }
    try {
        const transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports (like 587)
            auth: {
                user,
                pass,
            },
        });
        await transporter.sendMail({
            from,
            to: email,
            subject: "Influenz - Verification OTP",
            text: `Your verification OTP is: ${code}. It will expire in 15 minutes.`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; max-width: 500px;">
          <h2 style="font-weight: bold; margin-bottom: 10px; color: #18181b;">Influenz Verification</h2>
          <p style="color: #71717a; font-size: 14px;">Thank you for registering. Please verify your email using the following 6-digit OTP code:</p>
          <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; color: #18181b;">
            ${code}
          </div>
          <p style="color: #a1a1aa; font-size: 11px;">This code is valid for 15 minutes. If you did not request this code, you can ignore this email.</p>
        </div>
      `,
        });
        return true;
    }
    catch (error) {
        console.error("Nodemailer failed to send email OTP: ", error);
        // Fall back to console print so registration flow is never broken
        console.log("\n==================================================");
        console.log(`[EMAIL OTP FALLBACK PRINT]`);
        console.log(`To: ${email}`);
        console.log(`Verification Code: ${code}`);
        console.log("==================================================\n");
        return false;
    }
}
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        // Validate inputs
        if (!name || !email || !phone || !password || !role) {
            res.status(400).json({ error: "Missing required fields: name, email, phone, password, role" });
            return;
        }
        const mappedRole = role === "brand" ? "brand_owner" : "influencer";
        // 1. Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
            include: { influencer: true, brand: true }
        });
        if (existingUser) {
            if (existingUser.influencer || existingUser.brand) {
                res.status(400).json({ error: "Email address is already registered." });
                return;
            }
            // User exists but registration is incomplete.
            // Update user fields, generate a new OTP, and allow proceeding.
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(password, salt);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await prisma_1.default.verificationCode.deleteMany({
                where: { email },
            });
            await prisma_1.default.verificationCode.create({
                data: {
                    email,
                    code,
                    expiresAt,
                },
            });
            await sendOTPEmail(email, code);
            await prisma_1.default.user.update({
                where: { id: existingUser.id },
                data: {
                    role: mappedRole,
                    phone,
                    passwordHash,
                },
            });
            res.status(200).json({
                success: true,
                message: "User registration updated and email OTP resent.",
                userId: existingUser.id,
                email: existingUser.email,
            });
            return;
        }
        // 2. Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // 3. Generate verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        // 4. Save verification code to database
        await prisma_1.default.verificationCode.deleteMany({
            where: { email },
        });
        await prisma_1.default.verificationCode.create({
            data: {
                email,
                code,
                expiresAt,
            },
        });
        // 5. Send Email OTP
        await sendOTPEmail(email, code);
        // 6. Save basic user record in database
        const newUser = await prisma_1.default.user.create({
            data: {
                id: crypto.randomUUID(), // Generates UUID string
                role: mappedRole,
                email,
                phone,
                passwordHash,
            },
        });
        res.status(200).json({
            success: true,
            message: "User registered and email OTP sent.",
            userId: newUser.id,
            email: newUser.email,
        });
    }
    catch (error) {
        console.error("Express register error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.register = register;
const verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({ error: "Email and OTP code are required" });
            return;
        }
        // 1. Fetch code record from database
        const record = await prisma_1.default.verificationCode.findFirst({
            where: {
                email,
                code,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!record) {
            res.status(400).json({ error: "Invalid OTP code." });
            return;
        }
        // 2. Check expiration
        const isExpired = new Date() > record.expiresAt;
        if (isExpired) {
            res.status(400).json({ error: "OTP code has expired. Please request a new one." });
            return;
        }
        // 3. Clear code after successful verification
        await prisma_1.default.verificationCode.delete({
            where: {
                id: record.id,
            },
        });
        res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });
    }
    catch (error) {
        console.error("Express verify-otp error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.verifyOtp = verifyOtp;
const completeProfile = async (req, res) => {
    try {
        const { email, role, profileData } = req.body;
        if (!email || !role || !profileData) {
            res.status(400).json({ error: "Missing parameters: email, role, and profileData are required." });
            return;
        }
        // 1. Find user in database
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "User record not found." });
            return;
        }
        const mappedRole = role === "brand" ? "brand_owner" : "influencer";
        // 2. Insert profile details depending on role
        if (mappedRole === "influencer") {
            const { username, bio, country, state, district, city, categories, languages, followers, averageReach, engagementRate, contentType, instagramUsername, youtubeChannelUrl, pricePost, priceReel, priceStory, availabilityCalendar, gender, age, portfolio, } = profileData;
            if (!username) {
                res.status(400).json({ error: "Username is required for creators." });
                return;
            }
            // Check if username is already taken
            const existingUsername = await prisma_1.default.influencer.findUnique({
                where: { username },
            });
            if (existingUsername) {
                res.status(400).json({ error: "Username @" + username + " is already taken." });
                return;
            }
            await prisma_1.default.influencer.create({
                data: {
                    userId: user.id,
                    username,
                    bio: bio || "",
                    country: country || "India",
                    state: state || "",
                    district: district || "",
                    city: city || "",
                    categories: categories || [],
                    languages: languages || [],
                    followers: followers ? Number(followers) : 0,
                    averageReach: averageReach ? Number(averageReach) : 0,
                    engagementRate: engagementRate ? Number(engagementRate) : 0.00,
                    contentType: contentType || [],
                    instagramUsername: instagramUsername || "",
                    youtubeChannelUrl: youtubeChannelUrl || "",
                    pricePost: pricePost ? Number(pricePost) : 0.00,
                    priceReel: priceReel ? Number(priceReel) : 0.00,
                    priceStory: priceStory ? Number(priceStory) : 0.00,
                    availabilityCalendar: availabilityCalendar || {},
                    gender: gender || "",
                    age: age ? Number(age) : null,
                    portfolio: portfolio || {},
                },
            });
        }
        else {
            // brand_owner
            const { companyName, logo, gst, website, industry, country, state, district, city, description, marketingBudget, preferredCategories, targetAudience, verificationDocuments, } = profileData;
            if (!companyName || !gst || !industry) {
                res.status(400).json({ error: "Company name, GST registration, and industry classification are required for brands." });
                return;
            }
            await prisma_1.default.brand.create({
                data: {
                    userId: user.id,
                    companyName,
                    logo: logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100",
                    gst,
                    website: website || "",
                    industry,
                    country: country || "India",
                    state: state || "",
                    district: district || "",
                    city: city || "",
                    description: description || "",
                    marketingBudget: marketingBudget ? Number(marketingBudget) : 0.00,
                    preferredCategories: preferredCategories || [],
                    targetAudience: targetAudience || "",
                    verificationDocuments: verificationDocuments || {},
                },
            });
        }
        // 3. Generate secure JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "super-secret-influenz-key-2026", { expiresIn: "7d" });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: mappedRole === "brand_owner" ? profileData.companyName : (profileData.username || user.email),
            },
        });
    }
    catch (error) {
        console.error("Express complete-profile error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.completeProfile = completeProfile;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        // 1. Find user by email and pull their associated profile
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { influencer: true, brand: true }
        });
        if (!user) {
            res.status(401).json({ error: "Invalid email or password credentials." });
            return;
        }
        // 2. Validate password
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password credentials." });
            return;
        }
        // 3. Resolve user profile screen display name
        let name = user.email;
        let username = "";
        let avatar = "";
        if (user.role === "influencer") {
            name = user.influencer?.username || user.email;
            username = user.influencer?.username || "";
            avatar = user.influencer?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
        }
        else if (user.role === "brand_owner") {
            name = user.brand?.companyName || user.email;
            username = user.brand?.companyName.toLowerCase().replace(/\s/g, "_") || "";
            avatar = user.brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100";
        }
        else if (user.role === "master_admin") {
            name = "System Admin";
            avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100";
        }
        // 4. Sign session token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "super-secret-influenz-key-2026", { expiresIn: "7d" });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name,
                username,
                avatar,
            }
        });
    }
    catch (error) {
        console.error("Express login controller error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.login = login;
// Middleware to authenticate JWT token from Authorization header
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Access token is missing." });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "super-secret-influenz-key-2026", (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Session token is invalid or expired." });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Retrieve authenticated user's profile from database
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                influencer: true,
                brand: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User profile record not found." });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                phone: user.phone,
                influencer: user.influencer,
                brand: user.brand,
            },
        });
    }
    catch (error) {
        console.error("Express getProfile error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getProfile = getProfile;
// Save updates to user profile (influencer pricing, quotes, or brand company fields)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        if (user.role === "influencer") {
            const { bio, pricePost, priceReel, priceStory, instagramUsername, youtubeChannelUrl } = req.body;
            const updatedInfluencer = await prisma_1.default.influencer.update({
                where: { userId: user.id },
                data: {
                    bio: bio || "",
                    pricePost: pricePost ? Number(pricePost) : 0.00,
                    priceReel: priceReel ? Number(priceReel) : 0.00,
                    priceStory: priceStory ? Number(priceStory) : 0.00,
                    instagramUsername: instagramUsername || "",
                    youtubeChannelUrl: youtubeChannelUrl || "",
                },
            });
            res.status(200).json({ success: true, influencer: updatedInfluencer });
        }
        else if (user.role === "brand_owner") {
            const { companyName, website, description, gst, industry } = req.body;
            const updatedBrand = await prisma_1.default.brand.update({
                where: { userId: user.id },
                data: {
                    companyName: companyName || "",
                    website: website || "",
                    description: description || "",
                    gst: gst || "",
                    industry: industry || "",
                },
            });
            res.status(200).json({ success: true, brand: updatedBrand });
        }
        else {
            res.status(400).json({ error: "System administrators cannot update brand or influencer profiles." });
        }
    }
    catch (error) {
        console.error("Express updateProfile error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.updateProfile = updateProfile;
// Retrieve complete database audit data for Master Admin
const getAdminData = async (req, res) => {
    try {
        if (req.user.role !== "master_admin") {
            res.status(403).json({ error: "Access denied. Master Admin privileges required." });
            return;
        }
        const influencers = await prisma_1.default.influencer.findMany({
            include: { user: true }
        });
        const brands = await prisma_1.default.brand.findMany({
            include: { user: true }
        });
        const campaigns = await prisma_1.default.campaign.findMany();
        const payments = await prisma_1.default.payment.findMany();
        res.status(200).json({
            success: true,
            influencers,
            brands,
            campaigns,
            payments
        });
    }
    catch (error) {
        console.error("Express getAdminData error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getAdminData = getAdminData;
// Toggle verification badges
const toggleVerifyUser = async (req, res) => {
    try {
        if (req.user.role !== "master_admin") {
            res.status(403).json({ error: "Access denied." });
            return;
        }
        const { userId, isBrand } = req.body;
        if (isBrand) {
            const brand = await prisma_1.default.brand.findUnique({ where: { userId } });
            if (!brand) {
                res.status(404).json({ error: "Brand not found." });
                return;
            }
            const updated = await prisma_1.default.brand.update({
                where: { userId },
                data: { verified: !brand.verified }
            });
            res.status(200).json({ success: true, verified: updated.verified });
        }
        else {
            const influencer = await prisma_1.default.influencer.findUnique({ where: { userId } });
            if (!influencer) {
                res.status(404).json({ error: "Influencer not found." });
                return;
            }
            const updated = await prisma_1.default.influencer.update({
                where: { userId },
                data: { verified: !influencer.verified }
            });
            res.status(200).json({ success: true, verified: updated.verified });
        }
    }
    catch (error) {
        console.error("Express toggleVerifyUser error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.toggleVerifyUser = toggleVerifyUser;
// Update/close/delete campaigns inside the audit dashboard
const moderateCampaign = async (req, res) => {
    try {
        if (req.user.role !== "master_admin") {
            res.status(403).json({ error: "Access denied." });
            return;
        }
        const { campaignId, status, action } = req.body;
        if (action === "delete") {
            await prisma_1.default.campaign.delete({ where: { id: campaignId } });
            res.status(200).json({ success: true, deleted: true });
        }
        else {
            const updated = await prisma_1.default.campaign.update({
                where: { id: campaignId },
                data: { status }
            });
            res.status(200).json({ success: true, status: updated.status });
        }
    }
    catch (error) {
        console.error("Express moderateCampaign error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.moderateCampaign = moderateCampaign;
// Remove/suspend a user from the platform (cascade delete will purge influencer/brand profiles)
const suspendUser = async (req, res) => {
    try {
        if (req.user.role !== "master_admin") {
            res.status(403).json({ error: "Access denied." });
            return;
        }
        const { userId } = req.body;
        await prisma_1.default.user.delete({ where: { id: userId } });
        res.status(200).json({ success: true, message: "User suspended and deleted successfully." });
    }
    catch (error) {
        console.error("Express suspendUser error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.suspendUser = suspendUser;
// Fetch list of registered influencers
const getInfluencers = async (req, res) => {
    try {
        const influencers = await prisma_1.default.influencer.findMany({
            include: {
                user: true
            }
        });
        res.status(200).json({
            success: true,
            influencers
        });
    }
    catch (error) {
        console.error("Express getInfluencers error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getInfluencers = getInfluencers;
// Create a new campaign for active brand user in database
const createCampaign = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, budget, category, platform, deadline } = req.body;
        const brand = await prisma_1.default.brand.findUnique({
            where: { userId }
        });
        if (!brand) {
            res.status(403).json({ error: "Access denied. Only brand owners can create campaigns." });
            return;
        }
        const campaign = await prisma_1.default.campaign.create({
            data: {
                brandId: brand.userId,
                title: title || "New Campaign Launch",
                description: description || "",
                budget: Number(budget) || 0,
                category: category || "All",
                platform: platform || "Instagram",
                deadline: deadline || new Date(),
                status: "published"
            }
        });
        res.status(201).json({
            success: true,
            campaign
        });
    }
    catch (error) {
        console.error("Express createCampaign error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.createCampaign = createCampaign;
// Retrieve all campaigns with associated brand metadata joined in-memory
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma_1.default.campaign.findMany();
        const brands = await prisma_1.default.brand.findMany();
        const campaignsWithBrand = campaigns.map((c) => {
            const brand = brands.find((b) => b.userId === c.brandId);
            return {
                ...c,
                brand: brand ? {
                    companyName: brand.companyName,
                    logo: brand.logo,
                    industry: brand.industry
                } : null
            };
        });
        res.status(200).json({
            success: true,
            campaigns: campaignsWithBrand
        });
    }
    catch (error) {
        console.error("Express getCampaigns error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getCampaigns = getCampaigns;
// Create a new direct campaign invitation
const createInvitation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { influencerId, campaignId } = req.body;
        const brand = await prisma_1.default.brand.findUnique({ where: { userId } });
        if (!brand) {
            res.status(403).json({ error: "Access denied. Brand privileges required." });
            return;
        }
        // Check if invitation already exists in database
        const existing = await prisma_1.default.invitation.findFirst({
            where: { brandId: brand.userId, influencerId, campaignId }
        });
        if (existing) {
            res.status(400).json({ error: "Invitation already sent to this creator for this campaign." });
            return;
        }
        const invitation = await prisma_1.default.invitation.create({
            data: {
                brandId: brand.userId,
                influencerId,
                campaignId,
                status: "sent"
            }
        });
        res.status(201).json({ success: true, invitation });
    }
    catch (error) {
        console.error("Express createInvitation error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.createInvitation = createInvitation;
// Retrieve invitations associated with user role
const getInvitations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        let invitations;
        if (role === "brand_owner") {
            invitations = await prisma_1.default.invitation.findMany({
                where: { brandId: userId }
            });
        }
        else if (role === "influencer") {
            invitations = await prisma_1.default.invitation.findMany({
                where: { influencerId: userId }
            });
        }
        else {
            invitations = await prisma_1.default.invitation.findMany();
        }
        // Join brand details and campaign titles in-memory
        const campaigns = await prisma_1.default.campaign.findMany();
        const brands = await prisma_1.default.brand.findMany();
        const joinedInvites = invitations.map((inv) => {
            const campaign = campaigns.find((c) => c.id === inv.campaignId);
            const brand = brands.find((b) => b.userId === inv.brandId);
            return {
                ...inv,
                campaignTitle: campaign?.title || "Campaign Proposal",
                campaignBudget: campaign?.budget || 0,
                campaignPlatform: campaign?.platform || "Instagram",
                companyName: brand?.companyName || "Brand Partner",
                companyLogo: brand?.logo || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=100"
            };
        });
        res.status(200).json({ success: true, invitations: joinedInvites });
    }
    catch (error) {
        console.error("Express getInvitations error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getInvitations = getInvitations;
// Update invitation status (Accept/Decline invite)
const updateInvitationStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { inviteId, status } = req.body;
        if (!["accepted", "rejected"].includes(status)) {
            res.status(400).json({ error: "Invalid status value. Must be accepted or rejected." });
            return;
        }
        const invitation = await prisma_1.default.invitation.findUnique({
            where: { id: inviteId }
        });
        if (!invitation) {
            res.status(404).json({ error: "Invitation not found." });
            return;
        }
        if (invitation.influencerId !== userId) {
            res.status(403).json({ error: "Access denied. You can only respond to your own invitations." });
            return;
        }
        const updatedInvite = await prisma_1.default.invitation.update({
            where: { id: inviteId },
            data: { status }
        });
        res.status(200).json({
            success: true,
            invitation: updatedInvite
        });
    }
    catch (error) {
        console.error("Express updateInvitationStatus error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.updateInvitationStatus = updateInvitationStatus;
// Pitch a campaign proposal (application)
const createApplication = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { campaignId, proposal } = req.body;
        const creator = await prisma_1.default.influencer.findUnique({
            where: { userId }
        });
        if (!creator) {
            res.status(403).json({ error: "Access denied. Only influencers can submit proposals." });
            return;
        }
        const existing = await prisma_1.default.application.findFirst({
            where: { campaignId, influencerId: creator.userId }
        });
        if (existing) {
            res.status(400).json({ error: "You have already pitched a proposal for this campaign." });
            return;
        }
        const application = await prisma_1.default.application.create({
            data: {
                campaignId,
                influencerId: creator.userId,
                proposal: proposal || "",
                status: "applied"
            }
        });
        res.status(201).json({ success: true, application });
    }
    catch (error) {
        console.error("Express createApplication error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.createApplication = createApplication;
// Retrieve applications filtered by role (brands get their campaigns' applicants, creators get their pitches)
const getApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const applications = await prisma_1.default.application.findMany();
        const campaigns = await prisma_1.default.campaign.findMany();
        const influencers = await prisma_1.default.influencer.findMany({ include: { user: true } });
        const joinedApps = applications.map((app) => {
            const campaign = campaigns.find((c) => c.id === app.campaignId);
            const influencer = influencers.find((i) => i.userId === app.influencerId);
            return {
                ...app,
                campaignTitle: campaign?.title || "Campaign Proposal",
                campaignBudget: campaign?.budget || 0,
                campaignBrandId: campaign?.brandId || "",
                influencerName: influencer?.username || influencer?.user?.email?.split("@")[0] || "Creator",
                influencerAvatar: influencer?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                influencerRating: Number(influencer?.rating) || 4.8
            };
        });
        let filteredApps;
        if (role === "brand_owner") {
            filteredApps = joinedApps.filter((app) => app.campaignBrandId === userId);
        }
        else if (role === "influencer") {
            filteredApps = joinedApps.filter((app) => app.influencerId === userId);
        }
        else {
            filteredApps = joinedApps;
        }
        res.status(200).json({ success: true, applications: filteredApps });
    }
    catch (error) {
        console.error("Express getApplications error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getApplications = getApplications;
// Update application status (Shortlist / Hire creator)
const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { applicationId, status } = req.body;
        if (!["shortlisted", "hired"].includes(status)) {
            res.status(400).json({ error: "Invalid status value. Must be shortlisted or hired." });
            return;
        }
        const application = await prisma_1.default.application.findUnique({
            where: { id: applicationId }
        });
        if (!application) {
            res.status(404).json({ error: "Application not found." });
            return;
        }
        const campaign = await prisma_1.default.campaign.findUnique({
            where: { id: application.campaignId }
        });
        if (!campaign || campaign.brandId !== userId) {
            res.status(403).json({ error: "Access denied. Only the campaign owner can moderate application status." });
            return;
        }
        const updatedApp = await prisma_1.default.application.update({
            where: { id: applicationId },
            data: { status }
        });
        res.status(200).json({
            success: true,
            application: updatedApp
        });
    }
    catch (error) {
        console.error("Express updateApplicationStatus error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// Send a chat message
const createMessage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { receiverId, message } = req.body;
        if (!message || !message.trim()) {
            res.status(400).json({ error: "Message content is required." });
            return;
        }
        const newMessage = await prisma_1.default.chat.create({
            data: {
                senderId: userId,
                receiverId,
                message: message.trim(),
                isRead: false
            }
        });
        res.status(201).json({ success: true, message: newMessage });
    }
    catch (error) {
        console.error("Express createMessage error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.createMessage = createMessage;
// Retrieve chat messages history for active user
const getMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const chatHistory = await prisma_1.default.chat.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        res.status(200).json({ success: true, messages: chatHistory });
    }
    catch (error) {
        console.error("Express getMessages error: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
exports.getMessages = getMessages;
