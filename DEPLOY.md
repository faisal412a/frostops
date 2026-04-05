# ❄️ FrostOps ERP — Deployment Guide
## For users with no coding experience

---

## 🖥️ Option 1: Run on YOUR Computer (Easiest — Free, Private)

### Step 1 — Install Node.js
1. Go to: **https://nodejs.org**
2. Click the big green button **"LTS (Recommended)"**
3. Download and install it (just click Next, Next, Finish)
4. Restart your computer

### Step 2 — Run FrostOps
1. Extract the `frostops` folder to your Desktop
2. Open it — you'll see `server.js` and a `public` folder
3. **On Windows:** Hold `Shift` + Right-click inside the folder → "Open PowerShell window here"
   **On Mac:** Right-click the folder → "New Terminal at Folder"
4. Type this and press Enter:
   ```
   node server.js
   ```
5. You'll see: `❄️ FrostOps ERP is running! Open: http://localhost:3000`
6. Open your browser and go to: **http://localhost:3000**

✅ **Done! Your ERP is running.**

> Keep the terminal/PowerShell window open while using it.
> To stop: press `Ctrl + C` in the terminal.

---

## 🌐 Option 2: Free Cloud Hosting (Access from Anywhere)

### Deploy to Railway (Free Tier — Recommended)

1. Go to **https://railway.app** and create a free account (sign in with GitHub)
2. Create a GitHub account at **https://github.com** if you don't have one
3. Download **GitHub Desktop**: https://desktop.github.com (makes it easy)
4. Create a new repository, add your `frostops` folder files
5. On Railway: click **"New Project"** → **"Deploy from GitHub repo"**
6. Select your repository → Railway deploys automatically
7. Click **"Settings"** → **"Generate Domain"** → you get a free URL like `https://frostops-xxx.railway.app`

Share that URL with your team — they can access it from any device!

### Alternative: Render.com (Also Free)
1. Go to **https://render.com**
2. Sign up → **"New Web Service"**
3. Connect GitHub repo → Set **Start Command** to: `node server.js`
4. Click Deploy → Get your free URL

---

## 📁 File Structure
```
frostops/
├── server.js        ← Backend (the "brain")
├── package.json     ← App info
├── db.json          ← Your DATA (auto-created on first run)
└── public/
    └── index.html   ← Frontend (what you see in browser)
```

## 💾 Your Data
- All data lives in `db.json` (auto-created when you first run the server)
- **Back it up regularly** — copy `db.json` to a safe place
- To restore: replace `db.json` with your backup and restart the server

## 👥 Team Access
- **Local:** Share your computer's IP address (e.g., http://192.168.1.10:3000)
  - Find IP: Windows → `ipconfig` | Mac → System Preferences → Network
  - Make sure everyone is on the same WiFi
- **Cloud (Railway/Render):** Share the URL — works from anywhere

## 🔄 API Endpoints (For Reference)
All data is available as a REST API at `/api/`:
- `/api/products` — Finished products
- `/api/rawMaterials` — Raw materials
- `/api/inventory` — Stock register
- `/api/customers` — Customers
- `/api/salesOrders` — Sales orders
- `/api/invoices` — Invoices
- `/api/suppliers` — Suppliers
- `/api/purchases` — Purchase orders
- `/api/supplierBills` — Supplier bills
- `/api/receivables` — AR summary
- `/api/payables` — AP summary
- `/api/accounting` — Financial summary
- `/api/dashboard` — Dashboard data

---

## ❓ Troubleshooting

**"node is not recognized"** → Restart computer after installing Node.js

**"Port 3000 already in use"** → Change PORT: `PORT=3001 node server.js`

**Page doesn't load** → Make sure terminal shows "FrostOps ERP is running" and use http:// not https://

**Data disappeared** → Check `db.json` exists in the folder. If deleted, it will re-seed with demo data.

---

*FrostOps ERP v2.0 — Built for Frozen Food Operations*
