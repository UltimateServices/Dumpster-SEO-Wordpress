import axios, { AxiosInstance } from 'axios'

interface WordPressConfig {
  siteUrl: string
  username: string
  appPassword: string
}

interface CreatePageParams {
  title: string
  content: string
  slug: string
  status?: 'publish' | 'draft' | 'pending'
  parentId?: number
  metaDescription?: string
  focusKeyword?: string
  excerpt?: string
  featuredImage?: number
  categories?: number[]
  tags?: number[]
}

interface WordPressPage {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  parent: number
  menu_order: number
  meta: Record<string, any>
}

interface UpdatePageParams extends Partial<CreatePageParams> {
  id: number
}

export class WordPressService {
  private client: AxiosInstance
  private siteUrl: string

  constructor(config?: WordPressConfig) {
    const siteUrl = config?.siteUrl || process.env.WORDPRESS_SITE_URL!
    const username = config?.username || process.env.WORDPRESS_USERNAME!
    const appPassword = config?.appPassword || process.env.WORDPRESS_APP_PASSWORD!

    if (!siteUrl || !username || !appPassword) {
      throw new Error('Missing WordPress configuration')
    }

    this.siteUrl = siteUrl.replace(/\/$/, '') // Remove trailing slash

    this.client = axios.create({
      baseURL: `${this.siteUrl}/wp-json/wp/v2`,
      auth: {
        username,
        password: appPassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Create a new WordPress page
   */
  async createPage(params: CreatePageParams): Promise<WordPressPage> {
    try {
      const response = await this.client.post<WordPressPage>('/pages', {
        title: params.title,
        content: params.content,
        slug: params.slug,
        status: params.status || 'draft',
        parent: params.parentId || 0,
        excerpt: params.excerpt || '',
        categories: params.categories || [],
        tags: params.tags || [],
        featured_media: params.featuredImage || 0,
        // Yoast SEO meta (if Yoast is installed)
        yoast_head_json: params.metaDescription || params.focusKeyword ? {
          description: params.metaDescription,
          focus_keyword: params.focusKeyword,
        } : undefined,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('WordPress API Error:', error.response?.data)
        throw new Error(
          `Failed to create page: ${error.response?.data?.message || error.message}`
        )
      }
      throw error
    }
  }

  /**
   * Update an existing WordPress page
   */
  async updatePage(params: UpdatePageParams): Promise<WordPressPage> {
    try {
      const { id, ...updateData } = params

      const response = await this.client.post<WordPressPage>(`/pages/${id}`, {
        title: updateData.title,
        content: updateData.content,
        slug: updateData.slug,
        status: updateData.status,
        parent: updateData.parentId,
        excerpt: updateData.excerpt,
        categories: updateData.categories,
        tags: updateData.tags,
        featured_media: updateData.featuredImage,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('WordPress API Error:', error.response?.data)
        throw new Error(
          `Failed to update page: ${error.response?.data?.message || error.message}`
        )
      }
      throw error
    }
  }

  /**
   * Get a page by ID
   */
  async getPage(id: number): Promise<WordPressPage | null> {
    try {
      const response = await this.client.get<WordPressPage>(`/pages/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Get a page by slug
   */
  async getPageBySlug(slug: string): Promise<WordPressPage | null> {
    try {
      const response = await this.client.get<WordPressPage[]>('/pages', {
        params: { slug },
      })
      return response.data[0] || null
    } catch (error) {
      console.error('Error fetching page by slug:', error)
      return null
    }
  }

  /**
   * Delete a page
   */
  async deletePage(id: number, force: boolean = false): Promise<boolean> {
    try {
      await this.client.delete(`/pages/${id}`, {
        params: { force },
      })
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      return false
    }
  }

  /**
   * Publish a draft page
   */
  async publishPage(id: number): Promise<WordPressPage> {
    return this.updatePage({ id, status: 'publish' })
  }

  /**
   * Create a parent-child page relationship
   * First creates the parent page, then creates child pages
   */
  async createPageHierarchy(params: {
    parent: CreatePageParams
    children: CreatePageParams[]
  }): Promise<{ parent: WordPressPage; children: WordPressPage[] }> {
    // Create parent page first
    const parentPage = await this.createPage(params.parent)

    // Create child pages with parent ID
    const childPages = await Promise.all(
      params.children.map((child) =>
        this.createPage({
          ...child,
          parentId: parentPage.id,
        })
      )
    )

    return {
      parent: parentPage,
      children: childPages,
    }
  }

  /**
   * Bulk publish multiple pages
   */
  async bulkPublish(pageIds: number[]): Promise<{
    success: number[]
    failed: number[]
  }> {
    const results = await Promise.allSettled(
      pageIds.map((id) => this.publishPage(id))
    )

    const success: number[] = []
    const failed: number[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(pageIds[index])
      } else {
        failed.push(pageIds[index])
      }
    })

    return { success, failed }
  }

  /**
   * Get site health/connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/')
      return true
    } catch (error) {
      console.error('WordPress connection test failed:', error)
      return false
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await this.client.get('/categories', {
        params: { per_page: 100 },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  /**
   * Create a category
   */
  async createCategory(name: string, description?: string): Promise<any> {
    try {
      const response = await this.client.post('/categories', {
        name,
        description: description || '',
      })
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  /**
   * Get tags
   */
  async getTags(): Promise<any[]> {
    try {
      const response = await this.client.get('/tags', {
        params: { per_page: 100 },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  }
}

// Export singleton instance
export const wordpressService = new WordPressService()
