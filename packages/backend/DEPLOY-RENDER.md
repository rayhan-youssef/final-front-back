# Deploy backend to Render

## 1. Prepare MongoDB

Use **MongoDB Atlas** (or another hosted MongoDB) for production:

- Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
- Get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/ai-learning?retryWrites=true&w=majority`).
- Allow access from anywhere (`0.0.0.0/0`) in Network Access, or add Render’s outbound IPs if you restrict them.

## 2. Deploy on Render

### Option A: From GitHub (recommended)

1. Go to [render.com](https://render.com) and sign in (GitHub).
2. **New** → **Web Service**.
3. Connect this repo and choose the branch to deploy.
4. Configure the service:

   | Field | Value |
   |-------|--------|
   | **Name** | `ai-backend` (or any name) |
   | **Region** | Oregon (or your choice) |
   | **Root Directory** | `packages/backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or paid) |

5. **Environment** tab → Add variables:

   | Key | Value | Notes |
   |-----|--------|--------|
   | `NODE_ENV` | `production` | Optional |
   | `MONGO_URI` | Your Atlas connection string | Required |
   | `JWT_SECRET` | Long random string | Required; e.g. generate with `openssl rand -hex 32` |
   | `GEMINI_API_KEY` | Your Gemini API key | Required for AI features |

   Do **not** set `PORT`; Render sets it automatically.

6. Click **Create Web Service**. Render will build and deploy. The URL will be like `https://ai-backend.onrender.com`.

### Option B: Using the Blueprint (`render.yaml`)

1. In the repo root there is a `render.yaml` (Blueprint).
2. In Render: **New** → **Blueprint** → connect this repo.
3. Render will create a Web Service from the Blueprint. Set the secret env vars in the service’s **Environment** tab:
   - `MONGO_URI`
   - `GEMINI_API_KEY`
   (Blueprint can generate `JWT_SECRET` for you.)

## 3. After deploy

- **Health check:** `GET https://<your-service>.onrender.com/health` should return `{"status":"ok"}`.
- **Free tier:** the service sleeps after inactivity; the first request after sleep can take 30–60 seconds.
- Use the service URL as the API base in your frontend (e.g. in env as `VITE_API_URL` or similar).

## 4. Optional: custom domain

In the Render service → **Settings** → **Custom Domains**, add your domain and follow the DNS instructions.
