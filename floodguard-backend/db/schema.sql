-- FloodGuard Database Schema (PostgreSQL)
-- Auth: Google Sign-In (GSI One Tap) — no password storage

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    google_id       VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    avatar_url      VARCHAR(500),
    role            VARCHAR(20) DEFAULT 'user', -- user | admin
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Every AI-assisted risk check, guest or logged-in
CREATE TABLE IF NOT EXISTS risk_assessments (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL = guest
    latitude            DECIMAL(9,6) NOT NULL,
    longitude           DECIMAL(9,6) NOT NULL,
    address_label       VARCHAR(255),

    elevation           DECIMAL(6,2),
    slope               DECIMAL(5,2),
    river_distance       INTEGER, -- meters
    river_type           VARCHAR(50),
    historical_flood     BOOLEAN DEFAULT FALSE,
    annual_rainfall      INTEGER, -- mm
    soil_drainage        VARCHAR(20), -- Poor | Moderate | Good
    land_cover            VARCHAR(50),

    risk_score           INTEGER,
    risk_level            VARCHAR(20), -- LOW | MODERATE | HIGH | VERY HIGH
    confidence            INTEGER,
    reasons                JSONB,

    ai_summary            TEXT,
    ai_recommendation     TEXT,
    ai_buyer_advice       TEXT,

    created_at            TIMESTAMP DEFAULT NOW()
);

-- Cache external GIS calls (Open-Meteo / Overpass / SoilGrids) on a ~100m grid
CREATE TABLE IF NOT EXISTS gis_cache (
    id            SERIAL PRIMARY KEY,
    data_type     VARCHAR(30) NOT NULL, -- elevation | waterway | rainfall | soil | landcover
    lat_rounded   DECIMAL(6,3) NOT NULL,
    lng_rounded   DECIMAL(6,3) NOT NULL,
    payload       JSONB NOT NULL,
    fetched_at    TIMESTAMP DEFAULT NOW(),
    expires_at    TIMESTAMP NOT NULL,
    UNIQUE (data_type, lat_rounded, lng_rounded)
);

-- GDACS/ReliefWeb pre-loaded events + community-submitted reports, one table
CREATE TABLE IF NOT EXISTS flood_events (
    id              SERIAL PRIMARY KEY,
    latitude        DECIMAL(9,6) NOT NULL,
    longitude       DECIMAL(9,6) NOT NULL,
    address_label   VARCHAR(255),
    source          VARCHAR(20) NOT NULL, -- gdacs | reliefweb | community
    reported_by     INTEGER REFERENCES users(id) ON DELETE SET NULL, -- community only
    severity        VARCHAR(20), -- Minor | Moderate | Severe
    event_date      DATE,
    description     TEXT,
    verified        BOOLEAN DEFAULT FALSE, -- admin can verify community reports
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flood_events_location ON flood_events (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_flood_events_source ON flood_events (source);

-- Bookmarked assessments for logged-in users
CREATE TABLE IF NOT EXISTS saved_locations (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id   INTEGER NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    nickname        VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);