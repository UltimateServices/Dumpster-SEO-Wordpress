# Deployment Guide - Dumpster CRM

This guide will help you deploy your SEO automation CRM to production and set up user authentication.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best deployment experience.

#### Step 1: Prepare Your Repository

```bash
cd ~/dumpster-crm

# Initialize git if not already done
git init

# Create .gitignore (already exists)
# Add all files
git add .

# Commit
git commit -m "Initial commit: Enterprise SEO CRM"
```

#### Step 2: Push to GitHub

1. Create a new repository on GitHub: https://github.com/new
2. Name it: `dumpster-crm` (or whatever you prefer)
3. Push your code:

```bash
git remote add origin https://github.com/YOUR-USERNAME/dumpster-crm.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure project:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables** (click "Environment Variables"):

**Copy these from your `.env` file:**

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here

WORDPRESS_SITE_URL=https://your-wordpress-site.com

WORDPRESS_USERNAME=your_username

WORDPRESS_APP_PASSWORD=your_wordpress_app_password

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NODE_ENV=production
```

**Note:** Copy the actual values from your local `.env` file when setting up Vercel.

5. **Click "Deploy"**

Your app will be live at: `https://your-project.vercel.app`

---

### Option 2: VPS Deployment (DigitalOcean, AWS, etc.)

#### Prerequisites:
- Ubuntu 22.04 server
- Domain name pointed to your server
- SSH access

#### Step 1: Set Up Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 2: Deploy Application

```bash
# Clone your repository
cd /var/www
git clone https://github.com/YOUR-USERNAME/dumpster-crm.git
cd dumpster-crm

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables (same as above)

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "dumpster-crm" -- start
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/dumpster-crm
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/dumpster-crm /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Your app is now live at: `https://your-domain.com`

---

## 👥 User Management

### Configure Supabase Authentication

1. **Enable Email Auth in Supabase:**
   - Go to: https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/auth/providers
   - Make sure "Email" is enabled
   - Configure email templates (optional)

2. **Set Redirect URLs:**
   - Go to: https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/auth/url-configuration
   - Add your production URL:
     - `https://your-domain.com/**`
     - `https://your-project.vercel.app/**`

3. **Email Confirmation Settings:**
   - Go to: https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/auth/email-templates
   - You can disable email confirmation for testing
   - Or configure your own SMTP server

### Create Your First User

**Option 1: Self-signup (Easiest)**
1. Visit: `https://your-domain.com/signup`
2. Create an account
3. Check email for confirmation (if enabled)
4. Sign in at: `https://your-domain.com/login`

**Option 2: Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/auth/users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. User can now sign in

### Invite Team Members

Simply share the signup link: `https://your-domain.com/signup`

They can create their own accounts and start using the platform immediately.

### User Roles (Advanced - Optional)

If you want to add admin roles, create a new table in Supabase:

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);
```

Then modify the dashboard to check roles before allowing certain actions.

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to Git (already in .gitignore)
- ✅ Use different API keys for production vs development
- ✅ Rotate keys regularly

### 2. Supabase Security
- ✅ Row Level Security (RLS) is enabled
- ✅ Service role key only used server-side
- ✅ Anon key is safe for client-side

### 3. WordPress Security
- ✅ Application passwords (not account password)
- ✅ Revoke unused application passwords
- ✅ Monitor WordPress access logs

### 4. Rate Limiting (Add to production)
Consider adding rate limiting for API routes to prevent abuse.

---

## 📊 Monitoring

### Vercel Analytics (If using Vercel)
- Automatically enabled
- View at: https://vercel.com/YOUR-USERNAME/dumpster-crm/analytics

### Supabase Logs
- View at: https://supabase.com/dashboard/project/zfrgvionocpdsmyfwwlb/logs

### WordPress Activity
- Monitor at: WordPress Admin → Tools → Site Health

---

## 🔄 Updating Your Deployment

### Vercel (Automatic)
Just push to your GitHub repository:
```bash
git add .
git commit -m "Update feature"
git push
```
Vercel will automatically deploy.

### VPS (Manual)
```bash
cd /var/www/dumpster-crm
git pull
npm install
npm run build
pm2 restart dumpster-crm
```

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible at your domain
- [ ] All environment variables are set
- [ ] Supabase connection works
- [ ] WordPress connection works
- [ ] Anthropic API works
- [ ] User signup works
- [ ] User login works
- [ ] Content generation works
- [ ] WordPress publishing works
- [ ] SSL certificate is active (https)
- [ ] Team members can create accounts

---

## 🆘 Troubleshooting

### "Supabase connection failed"
- Check Supabase URL and keys in environment variables
- Verify Supabase project is not paused

### "WordPress connection failed"
- Verify site URL doesn't have trailing slash
- Check application password is correct
- Ensure WordPress REST API is accessible

### "Authentication not working"
- Check Supabase redirect URLs include your domain
- Verify email confirmation settings
- Check browser console for errors

### "Build fails on Vercel"
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Try building locally first: `npm run build`

---

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review error logs (Vercel/server logs)
3. Check Supabase logs
4. Verify all environment variables

Your production URL: `https://__________.vercel.app` (or your custom domain)

Users can sign up at: `https://your-domain.com/signup`
