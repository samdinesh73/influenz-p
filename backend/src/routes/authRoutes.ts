import { Router } from "express";
import { register, verifyOtp, completeProfile, login, authenticateToken, getProfile, updateProfile, getAdminData, toggleVerifyUser, moderateCampaign, suspendUser, getInfluencers, createCampaign, getCampaigns, createInvitation, getInvitations, updateInvitationStatus, createApplication, getApplications, updateApplicationStatus, createMessage, getMessages } from "../controllers/authController";

const router = Router();

// /api/auth/register
router.post("/register", register);

// /api/auth/verify-otp
router.post("/verify-otp", verifyOtp);

// /api/auth/complete-profile
router.post("/complete-profile", completeProfile);

// /api/auth/login
router.post("/login", login);

// /api/auth/profile (Authenticated profile operations)
router.get("/profile", authenticateToken, getProfile);
router.post("/profile", authenticateToken, updateProfile);

// /api/auth/admin (Authenticated Master Admin audits & moderation)
router.get("/admin/data", authenticateToken, getAdminData);
router.post("/admin/verify-user", authenticateToken, toggleVerifyUser);
router.post("/admin/campaign-status", authenticateToken, moderateCampaign);
router.post("/admin/suspend-user", authenticateToken, suspendUser);

// /api/auth/influencers (Public directory of creators)
router.get("/influencers", getInfluencers);

// /api/auth/campaigns (Brand campaign creation & marketplace query)
router.post("/campaigns", authenticateToken, createCampaign);
router.get("/campaigns", getCampaigns);

// /api/auth/invitations (Brand invitations for influencers)
router.post("/invitations", authenticateToken, createInvitation);
router.get("/invitations", authenticateToken, getInvitations);
router.post("/invitations/status", authenticateToken, updateInvitationStatus);

// /api/auth/applications (Pitches and proposals applications)
router.post("/applications", authenticateToken, createApplication);
router.get("/applications", authenticateToken, getApplications);
router.post("/applications/status", authenticateToken, updateApplicationStatus);

// /api/auth/messages (Live chat message storage & endpoints)
router.post("/messages", authenticateToken, createMessage);
router.get("/messages", authenticateToken, getMessages);

export default router;
