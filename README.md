# Dumpster CRM - Enterprise SEO Automation Platform

A comprehensive Next.js 14 TypeScript application that replaces expensive SEO agencies with intelligent content generation and automated publishing. Built for dumpster rental businesses but adaptable to any local service business.

## 🚀 Features

### Core Capabilities
- **Automated Content Generation**: Uses Anthropic's Claude AI to generate high-quality, SEO-optimized content
- **WordPress Integration**: Automated publishing with parent-child page hierarchies
- **Hub & Spoke Architecture**: Main city pages, topic pages, and neighborhood pages
- **SEO Optimization**: Schema markup, meta tags, internal linking, and more
- **Analytics Dashboard**: Track pages published, word count, coverage by city

### Content Types
1. **Main City Pages** (8-10k words, 40-50 questions)
   - Target: "dumpster rental [city]"
   - Comprehensive coverage of all services

2. **Topic Pages** (4-6k words, 20-30 questions)
   - Residential, Commercial, Construction, Roofing
   - Deep dives into specific use cases

3. **Neighborhood Pages** (3-4k words, 15-20 questions)
   - Hyper-local content with street names and landmarks
   - Local permit and HOA information

### SEO Features
- ✅ FAQ Schema for every question
- ✅ LocalBusiness Schema with geo coordinates
- ✅ BreadcrumbList Schema
- ✅ Organization Schema
- ✅ Optimized meta descriptions (155 chars with CTA)
- ✅ SEO-friendly title tags
- ✅ Automatic internal linking
- ✅ Semantic keyword optimization
- ✅ Featured snippet optimization
- ✅ Image alt tags with geo-modifiers
- ✅ Open Graph tags for social sharing
- ✅ Canonical URLs

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Supabase account
- Anthropic API key
- WordPress site with REST API enabled

## 🛠️ Installation

### 1. Clone and Install Dependencies

\`\`\`bash
cd ~/dumpster-crm
npm install
\`\`\`

### 2. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in Supabase SQL Editor:

\`\`\`bash
# Copy the contents of supabase-schema.sql to your Supabase SQL Editor
# This will create all tables, indexes, and sample data
\`\`\`

### 3. Configure WordPress

1. Enable WordPress REST API (enabled by default in WordPress 4.7+)
2. Create an Application Password:
   - Go to Users → Profile
   - Scroll to "Application Passwords"
   - Enter a name and click "Add New Application Password"
   - Copy the generated password

### 4. Set Up Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your credentials:

\`\`\`env
# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# WordPress
WORDPRESS_SITE_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
dumpster-crm/
├── src/
│   ├── app/                      # Next.js 14 app router
│   │   ├── api/                  # API routes
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── cities/           # Cities management
│   │   │   ├── research/         # Content research jobs
│   │   │   ├── pages/            # Published pages
│   │   │   └── analytics/        # Analytics dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   └── ui/                   # Reusable UI components
│   ├── lib/                      # Libraries and utilities
│   │   ├── services/             # API services
│   │   │   ├── anthropic.ts      # Anthropic AI service
│   │   │   └── wordpress.ts      # WordPress REST API
│   │   ├── supabase/             # Supabase client
│   │   └── utils/                # Utility functions
│   │       ├── seo.ts            # SEO utilities
│   │       └── cn.ts             # Tailwind utilities
│   └── types/                    # TypeScript types
│       └── database.types.ts     # Supabase types
├── public/                       # Static assets
├── supabase-schema.sql           # Database schema
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.js                # Next.js config
\`\`\`

## 🎯 Usage

### Generate Content for a City

1. Navigate to **Dashboard → Cities**
2. Click "Research" next to a city
3. Select page type (Main City, Topic, or Neighborhood)
4. Click "Generate Content"
5. Review generated content
6. Click "Publish to WordPress"

### Bulk Operations

1. Navigate to **Dashboard → Research**
2. Select multiple cities
3. Choose operation:
   - Generate Main City Pages
   - Generate Topic Pages
   - Generate Neighborhood Pages
4. Click "Start Bulk Operation"

### Monitor Progress

- **Dashboard**: Overview of all metrics
- **Cities**: Coverage by city
- **Research Jobs**: Status of content generation
- **Published Pages**: All WordPress publications
- **Analytics**: Performance tracking

## 🔧 API Services

### Anthropic Content Service

\`\`\`typescript
import { anthropicService } from '@/lib/services/anthropic'

const content = await anthropicService.generateContent({
  city: 'Houston',
  state: 'Texas',
  pageType: 'main_city',
  targetWordCount: 8000,
  targetQuestionCount: 45,
})
\`\`\`

### WordPress Service

\`\`\`typescript
import { wordpressService } from '@/lib/services/wordpress'

const page = await wordpressService.createPage({
  title: 'Dumpster Rental Houston TX',
  content: generatedContent,
  slug: 'dumpster-rental-houston-tx',
  status: 'publish',
})
\`\`\`

### SEO Utilities

\`\`\`typescript
import {
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateMetaDescription,
} from '@/lib/utils/seo'

const schema = generateLocalBusinessSchema({
  name: 'Dumpster Rental Houston',
  description: 'Professional dumpster rental services',
  address: { /* ... */ },
  url: 'https://example.com',
})
\`\`\`

## 📊 Database Schema

### Tables

- **geo_locations**: Cities with population, coordinates, priority ranking
- **research_jobs**: Track content generation (status, results, word count)
- **wordpress_pages**: Track published pages (WP post ID, URL, page type)
- **keywords**: Track target keywords and rankings
- **internal_links**: Track link structure for analysis

## 🚀 Deployment

### Vercel (Recommended)

\`\`\`bash
npm run build
# Deploy to Vercel
\`\`\`

### Docker

\`\`\`bash
# Coming soon
\`\`\`

## 🔐 Security

- All API keys stored in environment variables
- Supabase Row Level Security (RLS) enabled
- WordPress Application Passwords (not account password)
- HTTPS required for production

## 📈 Performance

- Server-side rendering (SSR) for dynamic content
- Static generation for public pages
- Image optimization with Next.js Image
- Lazy loading for large tables
- Database indexes for fast queries

## 🤝 Contributing

This is a private enterprise tool. For bugs or features, contact the development team.

## 📝 License

Proprietary - All rights reserved

## 🆘 Support

For setup help or issues:
1. Check environment variables are correct
2. Verify Supabase schema is applied
3. Test WordPress connection
4. Check Anthropic API key

## 🎉 What This Replaces

### $50k/Month SEO Agency Services:
- ✅ Content strategy and planning
- ✅ Keyword research and optimization
- ✅ Content writing (8-10k word articles)
- ✅ Local SEO optimization
- ✅ Schema markup implementation
- ✅ Internal linking strategy
- ✅ Meta tag optimization
- ✅ Technical SEO audits
- ✅ Content publishing
- ✅ Performance tracking

### Cost Savings:
- **Agency**: $50,000/month = $600,000/year
- **This Platform**: ~$500/month (API costs) = $6,000/year
- **Savings**: $594,000/year (99% cost reduction)

## 🔮 Future Enhancements

- [ ] Rank tracking integration
- [ ] Automated internal linking suggestions
- [ ] A/B testing for meta descriptions
- [ ] Automated image generation
- [ ] Competitor analysis
- [ ] Content refresh recommendations
- [ ] Email reports and alerts
- [ ] Multi-site management
- [ ] White-label capabilities
