# Quick Start Guide

## 1. Install Dependencies (2 minutes)

\`\`\`bash
cd ~/dumpster-crm
npm install
\`\`\`

## 2. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 3. Set Up WordPress (3 minutes)

1. Go to your WordPress admin
2. Navigate to **Users → Profile**
3. Scroll to "Application Passwords"
4. Enter name: "Dumpster CRM"
5. Click "Add New Application Password"
6. Copy the generated password (format: `xxxx xxxx xxxx xxxx`)

## 4. Get Anthropic API Key (2 minutes)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Get API Keys"
3. Create a new key
4. Copy the key (starts with `sk-ant-`)

## 5. Configure Environment Variables (2 minutes)

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your keys:

\`\`\`env
ANTHROPIC_API_KEY=sk-ant-...
WORDPRESS_SITE_URL=https://your-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
\`\`\`

## 6. Test Connections (1 minute)

\`\`\`bash
npm run dev
\`\`\`

Visit: [http://localhost:3000/api/test](http://localhost:3000/api/test)

You should see:
\`\`\`json
{
  "success": true,
  "services": {
    "supabase": true,
    "wordpress": true,
    "anthropic": true
  }
}
\`\`\`

## 7. Start Using the Platform (5 minutes)

1. Open [http://localhost:3000](http://localhost:3000)
2. You'll see the dashboard with 5 sample Texas cities
3. Click **Cities** in the sidebar
4. Click **Research** next to Houston
5. Click **Generate Content**
6. Wait 30-60 seconds for AI generation
7. Review the content
8. Click **Publish to WordPress**
9. Check your WordPress site!

## Common Issues

### "Supabase connection failed"
- Check that your Supabase URL is correct
- Verify the anon key is copied correctly
- Make sure RLS policies are enabled

### "WordPress connection failed"
- Verify the site URL doesn't have trailing slash
- Check that Application Password is correct (not account password)
- Ensure WordPress REST API is enabled

### "Anthropic API key invalid"
- Make sure key starts with `sk-ant-`
- Check for spaces or extra characters
- Verify key has credits available

## Next Steps

1. **Add More Cities**: Click "Add City" in Cities page
2. **Bulk Generate**: Select multiple cities and generate all at once
3. **Customize Content**: Edit the Anthropic prompts in `src/lib/services/anthropic.ts`
4. **Adjust SEO**: Modify schema templates in `src/lib/utils/seo.ts`
5. **Track Rankings**: Add keyword tracking (coming soon)

## Production Deployment

When ready for production:

\`\`\`bash
npm run build
npm run start
\`\`\`

Or deploy to Vercel:
\`\`\`bash
vercel deploy
\`\`\`

## Support

For questions or issues, check:
- README.md for full documentation
- src/lib/services/ for service implementations
- src/app/api/ for API endpoints
