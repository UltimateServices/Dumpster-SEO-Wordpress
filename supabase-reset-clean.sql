-- ============================================
-- SUPABASE DATABASE CLEAN RESET SCRIPT
-- ============================================
-- This script safely resets everything
-- ============================================

-- Step 1: Drop tables in correct order (respects foreign keys)
DROP TABLE IF EXISTS internal_links CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS wordpress_pages CASCADE;
DROP TABLE IF EXISTS research_jobs CASCADE;
DROP TABLE IF EXISTS geo_locations CASCADE;

-- Drop any old tables from previous projects
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Step 2: Drop custom types
DROP TYPE IF EXISTS page_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS publish_status CASCADE;
DROP TYPE IF EXISTS link_type CASCADE;

-- Step 3: Drop functions (triggers drop automatically with tables)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- CREATE NEW SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE page_type AS ENUM ('main_city', 'topic', 'neighborhood');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE publish_status AS ENUM ('publish', 'draft', 'pending');
CREATE TYPE link_type AS ENUM ('contextual', 'navigational', 'footer');

-- Geo Locations Table
CREATE TABLE geo_locations (
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
CREATE TABLE research_jobs (
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
CREATE TABLE wordpress_pages (
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
CREATE TABLE keywords (
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
CREATE TABLE internal_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_page_id UUID NOT NULL REFERENCES wordpress_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES wordpress_pages(id) ON DELETE CASCADE,
    anchor_text TEXT NOT NULL,
    link_type link_type DEFAULT 'contextual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_page_id, target_page_id, anchor_text)
);

-- Create indexes
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

-- Apply triggers
CREATE TRIGGER update_geo_locations_updated_at
    BEFORE UPDATE ON geo_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_jobs_updated_at
    BEFORE UPDATE ON research_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordpress_pages_updated_at
    BEFORE UPDATE ON wordpress_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE geo_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all on geo_locations" ON geo_locations FOR ALL USING (true);
CREATE POLICY "Allow all on research_jobs" ON research_jobs FOR ALL USING (true);
CREATE POLICY "Allow all on wordpress_pages" ON wordpress_pages FOR ALL USING (true);
CREATE POLICY "Allow all on keywords" ON keywords FOR ALL USING (true);
CREATE POLICY "Allow all on internal_links" ON internal_links FOR ALL USING (true);

-- Insert sample cities
INSERT INTO geo_locations (city, state, state_abbr, county, population, latitude, longitude, priority_rank)
VALUES
    ('Houston', 'Texas', 'TX', 'Harris', 2304580, 29.7604, -95.3698, 1),
    ('San Antonio', 'Texas', 'TX', 'Bexar', 1434625, 29.4241, -98.4936, 2),
    ('Dallas', 'Texas', 'TX', 'Dallas', 1304379, 32.7767, -96.7970, 3),
    ('Austin', 'Texas', 'TX', 'Travis', 961855, 30.2672, -97.7431, 4),
    ('Fort Worth', 'Texas', 'TX', 'Tarrant', 918915, 32.7555, -97.3308, 5),
    ('El Paso', 'Texas', 'TX', 'El Paso', 678815, 31.7619, -106.4850, 6),
    ('Arlington', 'Texas', 'TX', 'Tarrant', 398121, 32.7357, -97.1081, 7),
    ('Corpus Christi', 'Texas', 'TX', 'Nueces', 326586, 27.8006, -97.3964, 8),
    ('Plano', 'Texas', 'TX', 'Collin', 285494, 33.0198, -96.6989, 9),
    ('Laredo', 'Texas', 'TX', 'Webb', 255205, 27.5306, -99.4803, 10);

-- Verify success
SELECT
    'SUCCESS! Database reset complete.' as status,
    (SELECT COUNT(*) FROM geo_locations) as total_cities,
    'Ready to generate content!' as next_step;
