-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE page_type AS ENUM ('main_city', 'topic', 'neighborhood');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE publish_status AS ENUM ('publish', 'draft', 'pending');
CREATE TYPE link_type AS ENUM ('contextual', 'navigational', 'footer');

-- Geo Locations Table
CREATE TABLE IF NOT EXISTS geo_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    state_abbr VARCHAR(2) NOT NULL,
    county VARCHAR(255),
    population INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    zip_codes TEXT[],
    priority_rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city, state_abbr)
);

-- Research Jobs Table
CREATE TABLE IF NOT EXISTS research_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES geo_locations(id) ON DELETE CASCADE,
    page_type page_type NOT NULL,
    topic VARCHAR(255),
    neighborhood VARCHAR(255),
    status job_status DEFAULT 'pending',
    results_json JSONB,
    word_count INTEGER,
    questions_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- WordPress Pages Table
CREATE TABLE IF NOT EXISTS wordpress_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES geo_locations(id) ON DELETE CASCADE,
    research_job_id UUID REFERENCES research_jobs(id) ON DELETE SET NULL,
    wp_post_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    page_type page_type NOT NULL,
    topic VARCHAR(255),
    neighborhood VARCHAR(255),
    title TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_post_id INTEGER,
    status publish_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wp_post_id)
);

-- Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES geo_locations(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    difficulty INTEGER,
    current_rank INTEGER,
    target_rank INTEGER DEFAULT 1,
    target_url TEXT,
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, keyword)
);

-- Internal Links Table
CREATE TABLE IF NOT EXISTS internal_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_page_id UUID NOT NULL REFERENCES wordpress_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES wordpress_pages(id) ON DELETE CASCADE,
    anchor_text TEXT NOT NULL,
    link_type link_type DEFAULT 'contextual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_page_id, target_page_id, anchor_text)
);

-- Create indexes for better query performance
CREATE INDEX idx_geo_locations_state ON geo_locations(state_abbr);
CREATE INDEX idx_geo_locations_priority ON geo_locations(priority_rank);
CREATE INDEX idx_research_jobs_city ON research_jobs(city_id);
CREATE INDEX idx_research_jobs_status ON research_jobs(status);
CREATE INDEX idx_research_jobs_page_type ON research_jobs(page_type);
CREATE INDEX idx_wordpress_pages_city ON wordpress_pages(city_id);
CREATE INDEX idx_wordpress_pages_wp_id ON wordpress_pages(wp_post_id);
CREATE INDEX idx_wordpress_pages_page_type ON wordpress_pages(page_type);
CREATE INDEX idx_keywords_city ON keywords(city_id);
CREATE INDEX idx_internal_links_source ON internal_links(source_page_id);
CREATE INDEX idx_internal_links_target ON internal_links(target_page_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_geo_locations_updated_at BEFORE UPDATE ON geo_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_jobs_updated_at BEFORE UPDATE ON research_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordpress_pages_updated_at BEFORE UPDATE ON wordpress_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE geo_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on geo_locations" ON geo_locations FOR ALL USING (true);
CREATE POLICY "Allow all operations on research_jobs" ON research_jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on wordpress_pages" ON wordpress_pages FOR ALL USING (true);
CREATE POLICY "Allow all operations on keywords" ON keywords FOR ALL USING (true);
CREATE POLICY "Allow all operations on internal_links" ON internal_links FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO geo_locations (city, state, state_abbr, county, population, latitude, longitude, priority_rank)
VALUES
    ('Houston', 'Texas', 'TX', 'Harris', 2304580, 29.7604, -95.3698, 1),
    ('San Antonio', 'Texas', 'TX', 'Bexar', 1434625, 29.4241, -98.4936, 2),
    ('Dallas', 'Texas', 'TX', 'Dallas', 1304379, 32.7767, -96.7970, 3),
    ('Austin', 'Texas', 'TX', 'Travis', 961855, 30.2672, -97.7431, 4),
    ('Fort Worth', 'Texas', 'TX', 'Tarrant', 918915, 32.7555, -97.3308, 5)
ON CONFLICT (city, state_abbr) DO NOTHING;
