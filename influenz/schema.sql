-- Influencer & Brand Marketplace MySQL Database Schema
-- Single SQL file for easy database creation and initialization in MySQL.

-- Disable foreign key checks to allow drops without errors
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS influencers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS verification_codes CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    role ENUM('master_admin', 'influencer', 'brand_owner') NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Influencers Table
CREATE TABLE influencers (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    profile_image TEXT,
    bio TEXT,
    
    -- Location structure
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    
    -- Content and Social Metrics (JSON columns used for MySQL arrays)
    categories JSON,
    languages JSON,
    followers INT DEFAULT 0,
    average_reach INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    content_type JSON,
    
    -- Social links
    instagram_username VARCHAR(100),
    youtube_channel_url TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    twitter_username VARCHAR(100),
    pinterest_url TEXT,
    snapchat_username VARCHAR(100),
    website_url TEXT,
    
    -- Pricing quotes (in ₹ / post, reel, story)
    price_post DECIMAL(10,2) DEFAULT 0.00,
    price_reel DECIMAL(10,2) DEFAULT 0.00,
    price_story DECIMAL(10,2) DEFAULT 0.00,
    
    -- Availability and demographics
    availability_calendar JSON,
    gender VARCHAR(50),
    age INT,
    
    -- Platform status
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    response_time VARCHAR(50) DEFAULT 'Within a few hours',
    portfolio JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Brands Table
CREATE TABLE brands (
    user_id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    logo TEXT,
    gst VARCHAR(15) UNIQUE,
    website TEXT,
    industry VARCHAR(100) NOT NULL,
    
    -- Location structure
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    
    description TEXT,
    marketing_budget DECIMAL(15,2) DEFAULT 0.00,
    preferred_categories JSON,
    target_audience TEXT,
    verification_documents JSON,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Campaigns Table
CREATE TABLE campaigns (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    duration VARCHAR(100),
    status ENUM('draft', 'published', 'in_progress', 'completed', 'closed') DEFAULT 'published',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Applications Table (Influencers applying to Campaigns)
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    status ENUM('applied', 'shortlisted', 'hired', 'rejected') DEFAULT 'applied',
    proposal TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_campaign_influencer_application UNIQUE (campaign_id, influencer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Invitations Table (Brands inviting Influencers)
CREATE TABLE invitations (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    status ENUM('sent', 'accepted', 'rejected') DEFAULT 'sent',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(user_id) ON DELETE CASCADE,
    FOREIGN KEY (influencer_id) REFERENCES influencers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT unique_brand_influencer_campaign_invite UNIQUE (brand_id, influencer_id, campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Chats Table (Live Messaging between Users)
CREATE TABLE chats (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    attachments JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Payments Table (Wallet Escrow Flow)
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    brand_id VARCHAR(36) NOT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('escrowed', 'released', 'refunded') DEFAULT 'escrowed',
    transaction_id VARCHAR(255) NOT NULL,
    invoice_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_id) REFERENCES brands(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (influencer_id) REFERENCES influencers(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reviews Table (Dual rating system)
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    reviewer_id VARCHAR(36) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    
    rating DECIMAL(2,1) NOT NULL,
    communication DECIMAL(2,1) DEFAULT 0.0,
    payment_speed DECIMAL(2,1) DEFAULT 0.0,
    professionalism DECIMAL(2,1) DEFAULT 0.0,
    content_quality DECIMAL(2,1) DEFAULT 0.0,
    
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT unique_reviewer_target_campaign UNIQUE (reviewer_id, target_id, campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Verification Codes (Email OTPs)
CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_verification_codes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
