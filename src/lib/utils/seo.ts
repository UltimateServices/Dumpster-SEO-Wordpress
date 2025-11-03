/**
 * SEO Optimization Utilities
 * Generates schema markup, meta tags, and other SEO enhancements
 */

interface LocalBusinessSchema {
  name: string
  description: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  telephone?: string
  url: string
  priceRange?: string
  areaServed?: string[]
}

interface FAQSchemaItem {
  question: string
  answer: string
}

interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * Generate LocalBusiness schema markup
 */
export function generateLocalBusinessSchema(params: LocalBusinessSchema): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address.streetAddress,
      addressLocality: params.address.addressLocality,
      addressRegion: params.address.addressRegion,
      postalCode: params.address.postalCode,
      addressCountry: params.address.addressCountry,
    },
    url: params.url,
    ...(params.telephone && { telephone: params.telephone }),
    ...(params.priceRange && { priceRange: params.priceRange }),
    ...(params.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: params.geo.latitude,
        longitude: params.geo.longitude,
      },
    }),
    ...(params.areaServed && {
      areaServed: params.areaServed.map((area) => ({
        '@type': 'City',
        name: area,
      })),
    }),
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
}

/**
 * Generate FAQ schema markup
 */
export function generateFAQSchema(faqs: FAQSchemaItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
}

/**
 * Generate BreadcrumbList schema markup
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
}

/**
 * Generate Organization schema markup
 */
export function generateOrganizationSchema(params: {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
  telephone?: string
  email?: string
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    url: params.url,
    ...(params.logo && { logo: params.logo }),
    ...(params.sameAs && { sameAs: params.sameAs }),
    ...(params.telephone && { telephone: params.telephone }),
    ...(params.email && { email: params.email }),
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
}

/**
 * Generate optimized meta description
 */
export function generateMetaDescription(
  city: string,
  state: string,
  pageType: 'main_city' | 'topic' | 'neighborhood',
  topic?: string
): string {
  const templates = {
    main_city: `Professional dumpster rental in ${city}, ${state}. Same-day delivery, competitive pricing, all sizes available. Get your free quote today! ⭐️`,
    residential: `Residential dumpster rental ${city}, ${state}. Perfect for home cleanouts, renovations & yard waste. Easy booking, fast delivery. Call now!`,
    commercial: `Commercial dumpster services ${city}, ${state}. Reliable waste management for businesses. Multiple sizes, flexible scheduling. Free quote!`,
    construction: `Construction dumpster rental ${city}, ${state}. Heavy-duty containers for job sites. Quick delivery, competitive rates. Order today!`,
    roofing: `Roofing dumpster rental ${city}, ${state}. Specialized containers for shingle disposal. Fast service, transparent pricing. Get started!`,
  }

  if (pageType === 'main_city') {
    return templates.main_city
  }

  if (pageType === 'topic' && topic) {
    const key = topic.toLowerCase() as keyof typeof templates
    return templates[key] || templates.main_city
  }

  return templates.main_city
}

/**
 * Generate SEO-friendly slug
 */
export function generateSlug(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(params: {
  title: string
  description: string
  url: string
  image?: string
  type?: string
}): string {
  return `
    <meta property="og:title" content="${params.title}" />
    <meta property="og:description" content="${params.description}" />
    <meta property="og:url" content="${params.url}" />
    <meta property="og:type" content="${params.type || 'website'}" />
    ${params.image ? `<meta property="og:image" content="${params.image}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${params.title}" />
    <meta name="twitter:description" content="${params.description}" />
    ${params.image ? `<meta name="twitter:image" content="${params.image}" />` : ''}
  `.trim()
}

/**
 * Generate canonical URL tag
 */
export function generateCanonicalTag(url: string): string {
  return `<link rel="canonical" href="${url}" />`
}

/**
 * Extract and optimize keywords from content
 */
export function extractKeywords(
  content: string,
  city: string,
  state: string,
  limit: number = 20
): string[] {
  const baseKeywords = [
    `dumpster rental ${city}`,
    `${city} dumpster rental`,
    `dumpster ${city} ${state}`,
    `roll off dumpster ${city}`,
    `waste management ${city}`,
  ]

  // Add semantic variations
  const semanticKeywords = [
    'rent a dumpster',
    'waste container',
    'trash removal',
    'junk removal',
    'debris removal',
    'construction waste',
    'residential dumpster',
    'commercial dumpster',
    'dumpster sizes',
    'dumpster prices',
  ]

  const allKeywords = [
    ...baseKeywords,
    ...semanticKeywords.map((kw) => `${kw} ${city}`),
  ]

  return allKeywords.slice(0, limit)
}

/**
 * Generate internal linking suggestions
 */
export function generateInternalLinks(params: {
  currentPage: {
    city: string
    state: string
    pageType: string
  }
  availablePages: Array<{
    title: string
    url: string
    pageType: string
    city: string
  }>
}): Array<{ anchor: string; url: string; context: string }> {
  const suggestions: Array<{ anchor: string; url: string; context: string }> = []

  for (const page of params.availablePages) {
    // Don't link to self
    if (page.url === params.currentPage.city) continue

    // Suggest links based on relevance
    if (page.city === params.currentPage.city && page.pageType !== params.currentPage.pageType) {
      suggestions.push({
        anchor: page.title,
        url: page.url,
        context: `Related page in ${page.city}`,
      })
    }
  }

  return suggestions
}

/**
 * Optimize content for featured snippets
 */
export function formatForFeaturedSnippet(
  question: string,
  answer: string,
  format: 'paragraph' | 'list' | 'table' = 'paragraph'
): string {
  switch (format) {
    case 'paragraph':
      return `
        <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 itemprop="name">${question}</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              <p><strong>Answer:</strong> ${answer}</p>
            </div>
          </div>
        </div>
      `

    case 'list':
      return `
        <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 itemprop="name">${question}</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              ${answer}
            </div>
          </div>
        </div>
      `

    case 'table':
      return `
        <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 itemprop="name">${question}</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              ${answer}
            </div>
          </div>
        </div>
      `
  }
}

/**
 * Generate image alt text with SEO optimization
 */
export function generateImageAlt(params: {
  subject: string
  city: string
  state: string
  context?: string
}): string {
  const parts = [params.subject, params.city, params.state]
  if (params.context) {
    parts.push(params.context)
  }
  return parts.join(' - ')
}

/**
 * Calculate content readability score (simplified Flesch Reading Ease)
 */
export function calculateReadabilityScore(content: string): {
  score: number
  level: string
} {
  const text = content.replace(/<[^>]*>/g, '').trim()
  const sentences = text.split(/[.!?]+/).filter(Boolean).length
  const words = text.split(/\s+/).length
  const syllables = text.split(/[aeiou]/i).length - 1

  if (sentences === 0 || words === 0) {
    return { score: 0, level: 'Unknown' }
  }

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)

  let level = 'Unknown'
  if (score >= 90) level = 'Very Easy'
  else if (score >= 80) level = 'Easy'
  else if (score >= 70) level = 'Fairly Easy'
  else if (score >= 60) level = 'Standard'
  else if (score >= 50) level = 'Fairly Difficult'
  else if (score >= 30) level = 'Difficult'
  else level = 'Very Difficult'

  return { score: Math.round(score), level }
}

/**
 * Generate XML sitemap entry
 */
export function generateSitemapEntry(params: {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}): string {
  return `
  <url>
    <loc>${params.url}</loc>
    <lastmod>${params.lastmod}</lastmod>
    <changefreq>${params.changefreq}</changefreq>
    <priority>${params.priority}</priority>
  </url>
  `.trim()
}
