-- Pontifex Industries BLE Beacon Database Schema Extension
-- Run these commands in Supabase SQL Editor

-- 1. Asset Beacons Table - Links physical beacons to assets
CREATE TABLE IF NOT EXISTS asset_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  beacon_id VARCHAR(50) UNIQUE NOT NULL, -- M4P hardware ID
  mac_address VARCHAR(17), -- Bluetooth MAC address
  beacon_name VARCHAR(100), -- Human readable name
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  firmware_version VARCHAR(20),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  paired_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Location Readings Table - Historical beacon location data  
CREATE TABLE IF NOT EXISTS beacon_location_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_id VARCHAR(50) NOT NULL,
  asset_id UUID REFERENCES assets(id),
  reader_device_id VARCHAR(100), -- Device that detected the beacon
  rssi INTEGER, -- Signal strength
  estimated_distance DECIMAL(10,2), -- Distance in meters
  location_name VARCHAR(200), -- Human readable location
  coordinates POINT, -- GPS coordinates if available
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Asset Movement Events - Track when assets move between locations
CREATE TABLE IF NOT EXISTS asset_movement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  beacon_id VARCHAR(50),
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  movement_type VARCHAR(50) CHECK (movement_type IN ('manual', 'automatic', 'proximity')),
  detected_by VARCHAR(100), -- User or system that detected movement
  confidence_level VARCHAR(20) CHECK (confidence_level IN ('high', 'medium', 'low')),
  distance_moved DECIMAL(10,2), -- Distance in meters
  movement_duration INTERVAL, -- How long the movement took
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Beacon Configuration Table - Store M4P settings
CREATE TABLE IF NOT EXISTS beacon_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_id VARCHAR(50) UNIQUE NOT NULL,
  transmission_interval INTEGER DEFAULT 1000, -- Milliseconds
  tx_power INTEGER DEFAULT 0, -- Transmission power level
  advertisement_mode VARCHAR(20) DEFAULT 'iBeacon',
  custom_payload JSONB, -- Store custom data
  calibration_rssi INTEGER DEFAULT -59, -- RSSI at 1 meter
  environmental_factors JSONB, -- Temperature, humidity compensation
  configuration_applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Real-time Asset Status View - Optimized for dashboard queries
CREATE OR REPLACE VIEW asset_realtime_status AS
SELECT 
  a.id,
  a.name,
  a.status,
  a.assigned_location,
  ab.beacon_id,
  ab.battery_level,
  ab.last_seen as beacon_last_seen,
  blr.location_name as current_beacon_location,
  blr.estimated_distance,
  blr.confidence_score,
  blr.recorded_at as location_updated_at,
  CASE 
    WHEN ab.last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
    WHEN ab.last_seen > NOW() - INTERVAL '1 hour' THEN 'recently_seen'
    ELSE 'offline'
  END as beacon_status
FROM assets a
LEFT JOIN asset_beacons ab ON a.id = ab.asset_id AND ab.is_active = true
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (beacon_id) 
    beacon_id, location_name, estimated_distance, confidence_score, recorded_at
  FROM beacon_location_readings 
  WHERE beacon_id = ab.beacon_id 
  ORDER BY beacon_id, recorded_at DESC
) blr ON ab.beacon_id = blr.beacon_id;

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_asset_beacons_asset_id ON asset_beacons(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_beacons_beacon_id ON asset_beacons(beacon_id);
CREATE INDEX IF NOT EXISTS idx_beacon_readings_beacon_id ON beacon_location_readings(beacon_id);
CREATE INDEX IF NOT EXISTS idx_beacon_readings_recorded_at ON beacon_location_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_movement_events_asset_id ON asset_movement_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_movement_events_timestamp ON asset_movement_events(event_timestamp DESC);

-- 7. Real-time Functions for Live Updates
CREATE OR REPLACE FUNCTION update_beacon_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE asset_beacons 
  SET last_seen = NOW(), updated_at = NOW()
  WHERE beacon_id = NEW.beacon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update beacon last_seen when location reading is inserted
CREATE TRIGGER trigger_update_beacon_last_seen
  AFTER INSERT ON beacon_location_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_beacon_last_seen();

-- 8. Asset Movement Detection Function
CREATE OR REPLACE FUNCTION detect_asset_movement()
RETURNS TRIGGER AS $$
DECLARE
  previous_location VARCHAR(200);
  asset_record RECORD;
BEGIN
  -- Get asset information
  SELECT a.id, a.name INTO asset_record
  FROM assets a
  JOIN asset_beacons ab ON a.id = ab.asset_id
  WHERE ab.beacon_id = NEW.beacon_id;

  -- Get previous location
  SELECT location_name INTO previous_location
  FROM beacon_location_readings
  WHERE beacon_id = NEW.beacon_id
    AND recorded_at < NEW.recorded_at
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- If location changed significantly, log movement event
  IF previous_location IS NOT NULL 
     AND previous_location != NEW.location_name 
     AND NEW.confidence_score > 70 THEN
    
    INSERT INTO asset_movement_events (
      asset_id,
      beacon_id,
      from_location,
      to_location,
      movement_type,
      confidence_level,
      event_timestamp
    ) VALUES (
      asset_record.id,
      NEW.beacon_id,
      previous_location,
      NEW.location_name,
      'automatic',
      CASE 
        WHEN NEW.confidence_score > 90 THEN 'high'
        WHEN NEW.confidence_score > 80 THEN 'medium'
        ELSE 'low'
      END,
      NEW.recorded_at
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic movement detection
CREATE TRIGGER trigger_detect_asset_movement
  AFTER INSERT ON beacon_location_readings
  FOR EACH ROW
  EXECUTE FUNCTION detect_asset_movement();

-- 9. Sample Data for Testing (Optional)
-- INSERT INTO beacon_configurations (beacon_id, transmission_interval, tx_power) VALUES
-- ('M4P-001', 1000, 0),
-- ('M4P-002', 1000, 0),
-- ('M4P-003', 2000, -12);

-- 10. Row Level Security (RLS) Policies
ALTER TABLE asset_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_location_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_movement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_configurations ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on your existing auth setup
-- Example policy (adjust based on your user management):
-- CREATE POLICY "Users can view their company's beacons" ON asset_beacons
--   FOR SELECT USING (
--     asset_id IN (
--       SELECT id FROM assets WHERE company_id = auth.user_company_id()
--     )
--   );