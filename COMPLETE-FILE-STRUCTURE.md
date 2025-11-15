# AITK Backend - Complete File Structure & Deployment Guide

## ðŸ“ FILE STRUCTURE - Create These Files in This Order

```
aitk-backend/
â”œâ”€â”€ .gitignore                          [115]
â”œâ”€â”€ .env.example                        [109]
â”œâ”€â”€ package.json                        [108]
â”œâ”€â”€ server.js                           [107]
â”œâ”€â”€ config/
â”‚   â””â”€â”€ blockchain-config.js            [111]
â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ User.js                         [116]
â”‚   â”œâ”€â”€ Service.js                      [117]
â”‚   â”œâ”€â”€ Transaction.js                  [118]
â”‚   â””â”€â”€ APIKey.js                       [119]
â”œâ”€â”€ middleware/
â”‚   â”œâ”€â”€ auth.js                         [120]
â”‚   â””â”€â”€ adminCheck.js                   [121]
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ authController.js               [122]
â”‚   â”œâ”€â”€ transactionController.js        [112]
â”‚   â””â”€â”€ serviceController.js            [113]
â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ auth.js                         [123]
â”‚   â”œâ”€â”€ services.js                     [124]
â”‚   â””â”€â”€ transactions.js                 [125]
â””â”€â”€ DEPLOYMENT-GUIDE.md                 [114]
```

---

## ðŸš€ STEP-BY-STEP: How to Add Files to GitHub

### Step 1: Create GitHub Repository
1. Go to github.com
2. Click "New" â†’ Create repository
3. Name: `aitk-backend`
4. Make it Public or Private
5. Click "Create repository"

---

### Step 2: Add Files in THIS ORDER

**Root Level (Add to main folder):**

1. **First**, add `.gitignore`
   - Content: [115]

2. **Then**, add `package.json`
   - Content: [108]

3. **Then**, add `.env.example`
   - Content: [109]

4. **Then**, add `server.js`
   - Content: [107]

5. **Finally**, add `DEPLOYMENT-GUIDE.md`
   - Content: [114]

---

**Step 3: Create `config/` folder and add:**

1. `config/blockchain-config.js`
   - Content: [111]

---

**Step 4: Create `models/` folder and add:**

1. `models/User.js`
   - Content: [116]

2. `models/Service.js`
   - Content: [117]

3. `models/Transaction.js`
   - Content: [118]

4. `models/APIKey.js`
   - Content: [119]

---

**Step 5: Create `middleware/` folder and add:**

1. `middleware/auth.js`
   - Content: [120]

2. `middleware/adminCheck.js`
   - Content: [121]

---

**Step 6: Create `controllers/` folder and add:**

1. `controllers/authController.js`
   - Content: [122]

2. `controllers/transactionController.js`
   - Content: [112]

3. `controllers/serviceController.js`
   - Content: [113]

---

**Step 7: Create `routes/` folder and add:**

1. `routes/auth.js`
   - Content: [123]

2. `routes/services.js`
   - Content: [124]

3. `routes/transactions.js`
   - Content: [125]

---

## âœ… Quick GitHub Upload Method

**Option 1: Using GitHub Website**
1. Click "Add file" â†’ "Create new file"
2. Name it (e.g., `config/blockchain-config.js`)
3. Paste content
4. Click "Commit changes"

**Option 2: Using Git Command (Recommended)**
```bash
git clone https://github.com/YOUR-USERNAME/aitk-backend.git
cd aitk-backend

# Create folders
mkdir config models middleware controllers routes

# Copy all files into respective folders

# Upload to GitHub
git add .
git commit -m "Add AITK backend complete code"
git push
```

---

## ðŸ”§ Setup Before Deploying

### 1. Create MongoDB Database
- Go to mongodb.com
- Create free cluster
- Get connection string
- This will be your `MONGODB_URI` in `.env`

### 2. Create `.env` File (Locally)
Copy from `.env.example` and fill in:
```
PORT=5000
NODE_ENV=production

POLYGON_RPC_URL=https://polygon-rpc.com
AITK_TOKEN_ADDRESS=0x6f9a52d1Bef12a602a9cE943E3eA95c5BbCB9B3d
ROUTER_ADDRESS=0x792668a0e8de5b7b07a3cffffed82cddef6738a8
PRIVATE_KEY=YOUR_BACKEND_WALLET_PRIVATE_KEY
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_random_secret_key_here
ADMIN_WALLET=0xYourAdminWalletAddress
FRONTEND_URL=http://localhost:3000
```

### 3. Test Locally
```bash
npm install
npm run dev
# Should see: "Backend Server Running on http://localhost:5000"
```

---

## ðŸ“¤ Deploy to Render

1. Push code to GitHub (all files)
2. Go to render.com
3. Sign up with GitHub
4. Create "New +" â†’ "Web Service"
5. Select your `aitk-backend` repo
6. Name: `aitk-api`
7. Build: `npm install`
8. Start: `npm start`
9. Add environment variables (from `.env.example`)
10. Deploy!

**You'll get URL like:** `https://aitk-api.onrender.com`

---

## ðŸ§ª Test Your Backend

```bash
# Health check
curl https://aitk-api.onrender.com/api/health

# Get services
curl https://aitk-api.onrender.com/api/services

# Connect wallet
curl -X POST https://aitk-api.onrender.com/api/auth/connect \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'
```

---

## âœ¨ YOUR COMPLETE BACKEND IS READY!

All files created with proper structure:
âœ… Blockchain integration
âœ… Web3 payment processing
âœ… User authentication
âœ… Service marketplace
âœ… Transaction tracking
âœ… API key management
âœ… Admin dashboard support
âœ… Production-ready code

**Next: Connect your frontend to use these APIs!**