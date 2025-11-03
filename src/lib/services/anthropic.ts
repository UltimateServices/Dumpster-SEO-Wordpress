import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ContentGenerationParams {
  city: string
  state: string
  pageType: 'main_city' | 'topic' | 'neighborhood'
  topic?: string
  neighborhood?: string
  targetWordCount: number
  targetQuestionCount: number
}

interface GeneratedContent {
  title: string
  metaDescription: string
  content: string
  questions: Array<{
    question: string
    answer: string
  }>
  keywords: string[]
  wordCount: number
  questionsCount: number
}

export class AnthropicContentService {
  /**
   * Generate SEO-optimized content for a specific page type
   */
  async generateContent(params: ContentGenerationParams): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(params)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    return this.parseResponse(responseText, params)
  }

  /**
   * Build a detailed prompt for content generation
   */
  private buildPrompt(params: ContentGenerationParams): string {
    const { city, state, pageType, topic, neighborhood, targetWordCount, targetQuestionCount } = params

    const baseContext = `You are an expert SEO content writer specializing in local service businesses.
Generate comprehensive, engaging, and SEO-optimized content for a dumpster rental business.

TARGET LOCATION: ${city}, ${state}
PAGE TYPE: ${pageType}
${topic ? `TOPIC: ${topic}` : ''}
${neighborhood ? `NEIGHBORHOOD: ${neighborhood}` : ''}
TARGET WORD COUNT: ${targetWordCount} words
TARGET QUESTIONS: ${targetQuestionCount} questions

CONTENT REQUIREMENTS:
1. Write naturally and conversationally while maintaining professionalism
2. Include specific local references (streets, landmarks, neighborhoods)
3. Answer real customer questions comprehensively
4. Include pricing guidance and permit information
5. Use semantic SEO - naturally include related terms and concepts
6. Structure content with clear headings (H2, H3)
7. Write for featured snippets (direct answers, tables, lists)
8. Include actionable advice and practical tips

RESPONSE FORMAT (JSON):
{
  "title": "SEO-optimized page title with primary keyword",
  "metaDescription": "Compelling 155-character meta description with CTA",
  "content": "Full HTML content with proper heading structure",
  "questions": [
    {
      "question": "Question text",
      "answer": "Detailed answer (200-400 words)"
    }
  ],
  "keywords": ["primary keyword", "semantic keyword 1", "semantic keyword 2", ...]
}

`

    const specificInstructions = this.getPageTypeInstructions(pageType, topic, neighborhood)

    return baseContext + specificInstructions
  }

  /**
   * Get page-type specific instructions
   */
  private getPageTypeInstructions(
    pageType: string,
    topic?: string,
    neighborhood?: string
  ): string {
    switch (pageType) {
      case 'main_city':
        return `
MAIN CITY PAGE FOCUS:
- Primary keyword: "dumpster rental [city]"
- Cover ALL aspects: residential, commercial, construction, roofing
- Include comprehensive pricing guide (by size)
- Detail permit requirements and regulations
- List major neighborhoods served
- Include local dump/transfer station information
- Add section on delivery areas and restrictions
- Include real customer reviews/testimonials structure
- Cover dumpster sizes (10, 20, 30, 40 yard) in detail

EXAMPLE QUESTIONS TO ANSWER:
- How much does it cost to rent a dumpster in [city]?
- What size dumpster do I need for [project type]?
- Do I need a permit for a dumpster in [city]?
- How long can I keep the dumpster?
- What can't I put in a dumpster?
- Same-day dumpster rental options
- Weight limits and overage charges
`

      case 'topic':
        return `
TOPIC PAGE FOCUS (${topic}):
- Target keyword: "${topic} dumpster rental [city]"
- Deep dive into this specific use case
- Include project-specific advice
- Detail typical project timelines
- List what materials are commonly disposed
- Provide size recommendations for this project type
- Include cost breakdowns specific to ${topic}
- Add safety considerations
- Include local regulations specific to ${topic} projects

EXAMPLE QUESTIONS FOR ${topic?.toUpperCase()}:
- What size dumpster for ${topic} project?
- How much does ${topic} dumpster rental cost?
- What can I throw away from ${topic}?
- ${topic} dumpster rental tips
- Best practices for ${topic} waste disposal
`

      case 'neighborhood':
        return `
NEIGHBORHOOD PAGE FOCUS (${neighborhood}):
- Target keyword: "dumpster rental ${neighborhood}"
- Hyper-local content with specific street names
- Mention local landmarks near ${neighborhood}
- Include ${neighborhood}-specific delivery considerations
- Detail permit requirements for ${neighborhood}
- Discuss HOA considerations if applicable
- Include parking/placement tips for ${neighborhood} streets
- Mention nearby dump locations
- Include ${neighborhood} demographics context

EXAMPLE QUESTIONS FOR ${neighborhood?.toUpperCase()}:
- Dumpster rental delivery to ${neighborhood}
- Parking requirements in ${neighborhood}
- Best dumpster sizes for ${neighborhood} homes
- ${neighborhood} permit information
- HOA rules in ${neighborhood}
`

      default:
        return ''
    }
  }

  /**
   * Parse the AI response and extract structured content
   */
  private parseResponse(responseText: string, params: ContentGenerationParams): GeneratedContent {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not find JSON in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Count words in content
      const wordCount = this.countWords(parsed.content)

      return {
        title: parsed.title,
        metaDescription: parsed.metaDescription,
        content: parsed.content,
        questions: parsed.questions || [],
        keywords: parsed.keywords || [],
        wordCount,
        questionsCount: parsed.questions?.length || 0,
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw new Error('Failed to parse content generation response')
    }
  }

  /**
   * Count words in HTML content
   */
  private countWords(html: string): number {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return text.split(' ').length
  }

  /**
   * Generate multiple questions with answers
   */
  async generateQuestions(
    city: string,
    state: string,
    topic: string,
    count: number = 10
  ): Promise<Array<{ question: string; answer: string }>> {
    const prompt = `Generate ${count} specific, detailed questions and answers about "${topic}" for dumpster rental in ${city}, ${state}.

Questions should be:
1. Actual questions customers ask
2. Specific to ${city} when possible
3. SEO-friendly (searchable)
4. Cover different aspects of ${topic}

Answers should be:
1. 200-400 words each
2. Informative and actionable
3. Include specific local details
4. Naturally include related keywords

Return as JSON array:
[
  {
    "question": "Question text?",
    "answer": "Detailed answer..."
  }
]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '[]'

    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return []
  }
}

// Export singleton instance
export const anthropicService = new AnthropicContentService()
