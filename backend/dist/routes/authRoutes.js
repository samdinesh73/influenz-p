"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// /api/auth/register
router.post("/register", authController_1.register);
// /api/auth/verify-otp
router.post("/verify-otp", authController_1.verifyOtp);
// /api/auth/complete-profile
router.post("/complete-profile", authController_1.completeProfile);
// /api/auth/login
router.post("/login", authController_1.login);
// /api/auth/profile (Authenticated profile operations)
router.get("/profile", authController_1.authenticateToken, authController_1.getProfile);
router.post("/profile", authController_1.authenticateToken, authController_1.updateProfile);
// /api/auth/admin (Authenticated Master Admin audits & moderation)
router.get("/admin/data", authController_1.authenticateToken, authController_1.getAdminData);
router.post("/admin/verify-user", authController_1.authenticateToken, authController_1.toggleVerifyUser);
router.post("/admin/campaign-status", authController_1.authenticateToken, authController_1.moderateCampaign);
router.post("/admin/suspend-user", authController_1.authenticateToken, authController_1.suspendUser);
// /api/auth/influencers (Public directory of creators)
router.get("/influencers", authController_1.getInfluencers);
// /api/auth/campaigns (Brand campaign creation & marketplace query)
router.post("/campaigns", authController_1.authenticateToken, authController_1.createCampaign);
router.get("/campaigns", authController_1.getCampaigns);
// /api/auth/invitations (Brand invitations for influencers)
router.post("/invitations", authController_1.authenticateToken, authController_1.createInvitation);
router.get("/invitations", authController_1.authenticateToken, authController_1.getInvitations);
router.post("/invitations/status", authController_1.authenticateToken, authController_1.updateInvitationStatus);
// /api/auth/applications (Pitches and proposals applications)
router.post("/applications", authController_1.authenticateToken, authController_1.createApplication);
router.get("/applications", authController_1.authenticateToken, authController_1.getApplications);
router.post("/applications/status", authController_1.authenticateToken, authController_1.updateApplicationStatus);
// /api/auth/messages (Live chat message storage & endpoints)
router.post("/messages", authController_1.authenticateToken, authController_1.createMessage);
router.get("/messages", authController_1.authenticateToken, authController_1.getMessages);
exports.default = router;
