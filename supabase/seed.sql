-- ====================================================================
-- GLOBETROTTER DATABASE SEED DATA
-- 15+ Cities, 50+ Activities, 5 Demo Users, 10 Trips with Stops & Expenses
-- ====================================================================

-- 1. SEED 15+ GLOBAL CITIES
INSERT INTO public.cities (id, name, country, country_code, region, lat, lng, cover_image, avg_daily_budget, currency, best_season, description, rating)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Paris', 'France', 'FR', 'Europe', 48.8566, 2.3522, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', 190.00, 'EUR', 'April - June & Sept - Nov', 'The City of Light, romance, world-class museums, and café terraces.', 4.8),
    ('10000000-0000-0000-0000-000000000002', 'London', 'United Kingdom', 'GB', 'Europe', 51.5074, -0.1278, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', 210.00, 'GBP', 'May - September', 'Royal history, West End theatre, world-class free museums, and cozy pubs.', 4.8),
    ('10000000-0000-0000-0000-000000000003', 'Rome', 'Italy', 'IT', 'Europe', 41.9028, 12.4964, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', 155.00, 'EUR', 'May & Sept - Oct', 'An open-air museum of Roman antiquity, renaissance palaces, and authentic pasta.', 4.8),
    ('10000000-0000-0000-0000-000000000004', 'Dubai', 'United Arab Emirates', 'AE', 'Middle East', 25.2048, 55.2708, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', 220.00, 'AED', 'November - March', 'Futuristic skyscrapers, ultra-luxury shopping, desert dunes, and golden beaches.', 4.7),
    ('10000000-0000-0000-0000-000000000005', 'Tokyo', 'Japan', 'JP', 'Asia', 35.6762, 139.6503, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', 160.00, 'JPY', 'Spring & Autumn', 'Neon skyscrapers, ancient shrines, world-class dining, and pop culture.', 4.9),
    ('10000000-0000-0000-0000-000000000006', 'Singapore', 'Singapore', 'SG', 'Asia', 1.3521, 103.8198, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80', 150.00, 'SGD', 'December - June', 'A lush garden metropolis with futuristic architecture and incredible hawker feasts.', 4.8),
    ('10000000-0000-0000-0000-000000000007', 'Bali', 'Indonesia', 'ID', 'Asia', -8.4095, 115.1889, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 75.00, 'IDR', 'April - October', 'Lush terraced rice paddies, spiritual Hindu temples, surf breaks, and wellness retreats.', 4.9),
    ('10000000-0000-0000-0000-000000000008', 'Bangkok', 'Thailand', 'TH', 'Asia', 13.7563, 100.5018, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80', 80.00, 'THB', 'November - February', 'Vibrant street life, ornate golden shrines, bustling night markets, and street food.', 4.7),
    ('10000000-0000-0000-0000-000000000009', 'Amsterdam', 'Netherlands', 'NL', 'Europe', 52.3676, 4.9041, 'https://images.unsplash.com/photo-1517736996303-4e64a49e8699?auto=format&fit=crop&w=1200&q=80', 170.00, 'EUR', 'April - May & Sept', 'Picturesque UNESCO canals, cycling culture, world-class art museums, and cozy cafés.', 4.8),
    ('10000000-0000-0000-0000-000000000010', 'Barcelona', 'Spain', 'ES', 'Europe', 41.3879, 2.1699, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80', 145.00, 'EUR', 'May - June & Sept - Oct', 'Gaudí masterpieces, Mediterranean beaches, gothic alleys, and tapas bars.', 4.8),
    ('10000000-0000-0000-0000-000000000011', 'Prague', 'Czech Republic', 'CZ', 'Europe', 50.0755, 14.4378, 'https://images.unsplash.com/photo-1541882822616-921c5f3b7543?auto=format&fit=crop&w=1200&q=80', 110.00, 'CZK', 'May - September', 'The City of a Hundred Spires, fairy-tale castles, and rich historic bridges.', 4.8),
    ('10000000-0000-0000-0000-000000000012', 'Istanbul', 'Turkey', 'TR', 'Europe', 41.0082, 28.9784, 'https://images.unsplash.com/photo-1526620579294-f203875323c9?auto=format&fit=crop&w=1200&q=80', 90.00, 'TRY', 'April - May & Sept - Oct', 'Where East meets West across the Bosphorus, grand mosques, and spice bazaars.', 4.7),
    ('10000000-0000-0000-0000-000000000013', 'Sydney', 'Australia', 'AU', 'Oceania', -33.8688, 151.2093, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', 180.00, 'AUD', 'Sept - Nov & March - May', 'Iconic Harbour Opera House, golden surf beaches, and breathtaking coastal cliff walks.', 4.8),
    ('10000000-0000-0000-0000-000000000014', 'New York', 'United States', 'US', 'North America', 40.7128, -74.0060, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', 240.00, 'USD', 'Sept - Nov & April - June', 'The energetic global capital of Broadway, soaring skyscrapers, and world culture.', 4.7),
    ('10000000-0000-0000-0000-000000000015', 'Zurich', 'Switzerland', 'CH', 'Europe', 47.3769, 8.5417, 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80', 250.00, 'CHF', 'June - August', 'Crystal-clear alpine lakes, medieval Old Town, and panoramic Swiss mountain trails.', 4.7)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 5 DEMO PROFILES
INSERT INTO public.profiles (id, email, full_name, avatar_url, bio, country, home_currency, travel_style)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'elena.rostova@globetrotter.io', 'Elena Rostova', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Architectural photographer & slow traveler exploring Europe.', 'France', 'EUR', 'Culture & Architecture'),
    ('20000000-0000-0000-0000-000000000002', 'kenji.takahashi@globetrotter.io', 'Kenji Takahashi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Culinary writer exploring Asia and remote island traditions.', 'Japan', 'JPY', 'Foodie & Culture'),
    ('20000000-0000-0000-0000-000000000003', 'alex.vance@globetrotter.io', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', 'Digital nomad traveling full-time across 45+ countries.', 'United States', 'USD', 'Balanced Nomad'),
    ('20000000-0000-0000-0000-000000000004', 'priya.sharma@globetrotter.io', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Adventure seeker and high-altitude trekker.', 'India', 'INR', 'Adventure & Outdoors'),
    ('20000000-0000-0000-0000-000000000005', 'marcus.weber@globetrotter.io', 'Marcus Weber', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'History researcher and UNESCO heritage enthusiast.', 'Germany', 'EUR', 'Heritage & History')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED 10 DEMO TRIPS
INSERT INTO public.trips (id, user_id, title, description, cover_image, start_date, end_date, total_budget, currency, travelers_count, visibility, is_public, share_slug, tags, status)
VALUES
    -- Trip 1: European Adventure (Demo flagship)
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'European Adventure: Paris, Rome & Amsterdam', 'A breathtaking journey connecting Western Europe’s most vibrant cultural capitals.', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80', '2026-09-10', '2026-09-22', 200000.00, 'INR', 2, 'public', true, 'european-adventure-paris-rome-amsterdam', ARRAY['Culture', 'Sightseeing', 'Romance'], 'active'),
    -- Trip 2: Japan Golden Route
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Japan Golden Route: Neon to Zen', 'From Tokyo’s electrifying energy to Kyoto’s tranquil shrines and bullet train vistas.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80', '2026-10-05', '2026-10-15', 3400.00, 'USD', 2, 'public', true, 'japan-golden-route-neon-zen', ARRAY['Food', 'Temples', 'Futuristic'], 'planning'),
    -- Trip 3: Mediterranean Bliss
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Mediterranean Tapas & Sea: Barcelona to Rome', 'Sun-drenched beaches, Gaudí architecture, and authentic Italian trattorias.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80', '2026-07-01', '2026-07-10', 2800.00, 'EUR', 2, 'public', true, 'mediterranean-tapas-sea-barcelona-rome', ARRAY['Beach', 'Food & Wine', 'Architecture'], 'completed'),
    -- Trip 4: Southeast Asia Discovery
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'Tropical Odyssey: Singapore, Bangkok & Bali', 'Supertrees, vibrant floating markets, and Balinese volcanic sunrise treks.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80', '2026-11-12', '2026-11-25', 180000.00, 'INR', 1, 'public', true, 'tropical-odyssey-singapore-bangkok-bali', ARRAY['Tropical', 'Adventure', 'Food'], 'planning'),
    -- Trip 5: Arabian Nights & Desert Sky
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 'Emirates Grandeur: Dubai & Desert Oasis', 'Burj Khalifa heights, dune safaris, and Arabian luxury.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80', '2026-12-20', '2026-12-28', 3200.00, 'USD', 2, 'public', true, 'emirates-grandeur-dubai-desert', ARRAY['Luxury', 'Desert', 'Modern'], 'planning'),
    -- Trip 6: Swiss Alps & Alpine Serenity
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 'Alpine Serenity: Zurich & Beyond', 'Lake cruises, pristine mountain summits, and charming Old Town alleys.', 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1600&q=80', '2026-08-15', '2026-08-24', 3800.00, 'CHF', 2, 'private', false, 'alpine-serenity-zurich-beyond', ARRAY['Nature', 'Mountains', 'Relax'], 'planning'),
    -- Trip 7: Bohemian Grandeur
    ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Central European Heritage: Prague & Amsterdam', 'Gothic bridges, astronomical clockworks, and canal-side art galleries.', 'https://images.unsplash.com/photo-1541882822616-921c5f3b7543?auto=format&fit=crop&w=1600&q=80', '2026-05-10', '2026-05-18', 2200.00, 'EUR', 1, 'public', true, 'central-european-heritage-prague-amsterdam', ARRAY['History', 'Art', 'Architecture'], 'planning'),
    -- Trip 8: Australian Coastal Explorer
    ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'Pacific Breeze: Sydney Coastal Escapade', 'Harbour bridge climbs, coastal cliff walks, and Bondi surf vibes.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80', '2027-01-05', '2027-01-14', 3100.00, 'AUD', 2, 'public', true, 'pacific-breeze-sydney-coastal-escapade', ARRAY['Beaches', 'Harbour', 'Outdoors'], 'planning'),
    -- Trip 9: Empire State & Historic East
    ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', 'Big Apple & London Calling: Dual-Metropolis', 'Skyscrapers, Broadway nights, West End theatres, and royal parks.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80', '2026-10-18', '2026-10-29', 4500.00, 'USD', 2, 'public', true, 'dual-metropolis-newyork-london', ARRAY['Broadway', 'Museums', 'Urban'], 'planning'),
    -- Trip 10: Ottoman & Byzantine Splendor
    ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 'Crossroads of Continents: Istanbul Historic Grandeur', 'Hagia Sophia, Bosphorus sunset ferries, and Grand Bazaar treasures.', 'https://images.unsplash.com/photo-1526620579294-f203875323c9?auto=format&fit=crop&w=1600&q=80', '2026-09-01', '2026-09-08', 1900.00, 'USD', 2, 'public', true, 'crossroads-of-continents-istanbul', ARRAY['Culture', 'Bazaars', 'History'], 'completed')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED STOPS FOR EUROPEAN ADVENTURE (Trip 1: Paris -> Rome -> Amsterdam)
INSERT INTO public.trip_stops (id, trip_id, city_name, country_name, country_code, lat, lng, arrival_date, departure_date, order_index, transit_mode, transit_duration_mins, transit_cost, accommodation_cost, cover_image)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Paris', 'France', 'FR', 48.8566, 2.3522, '2026-09-10', '2026-09-14', 0, 'flight', 0, 0.00, 600.00, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Rome', 'Italy', 'IT', 41.9028, 12.4964, '2026-09-14', '2026-09-18', 1, 'flight', 125, 95.00, 520.00, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Amsterdam', 'Netherlands', 'NL', 52.3676, 4.9041, '2026-09-18', '2026-09-22', 2, 'flight', 130, 85.00, 580.00, 'https://images.unsplash.com/photo-1517736996303-4e64a49e8699?auto=format&fit=crop&w=1000&q=80')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED 50+ ACTIVITIES ACROSS STOPS
INSERT INTO public.activities (id, trip_stop_id, day_number, title, description, category, cost, currency, start_time, end_time, order_index, location_name, status)
VALUES
    -- Paris Activities
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 'Eiffel Tower Summit & Champagne', 'Iconic panoramic views across Paris at dusk.', 'Sightseeing', 42.00, 'EUR', '10:00', '12:30', 0, 'Champ de Mars, Paris', 'booked'),
    ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 1, 'Louvre Museum Masterpieces Guided Tour', 'Mona Lisa, Winged Victory, and Venus de Milo.', 'Culture', 35.00, 'EUR', '14:00', '17:30', 1, 'Musée du Louvre', 'booked'),
    ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 2, 'Montmartre & Sacré-Cœur Artisans Walk', 'Cobblestone streets and artists square.', 'Sightseeing', 0.00, 'EUR', '10:00', '12:30', 0, 'Montmartre, Paris', 'planned'),
    ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 2, 'Seine River Sunset Dinner Cruise', 'Gourmet French dinner while gliding past illuminated bridges.', 'Food', 85.00, 'EUR', '19:30', '22:00', 1, 'Port de la Bourdonnais', 'booked'),
    ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 3, 'Palace of Versailles Grand Apartments & Gardens', 'Hall of Mirrors and grand fountain spectacles.', 'Culture', 30.00, 'EUR', '09:00', '14:00', 0, 'Versailles, France', 'booked'),

    -- Rome Activities
    ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', 1, 'Colosseum, Roman Forum & Palatine Hill', 'Gladiator tunnels and Roman ruins exploration.', 'Sightseeing', 38.00, 'EUR', '09:00', '12:30', 0, 'Piazza del Colosseo', 'booked'),
    ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002', 1, 'Trastevere Sunset Food & Wine Walk', 'Sample roman cacio e pepe, supplì, and local chianti.', 'Food', 55.00, 'EUR', '17:30', '20:30', 1, 'Trastevere, Rome', 'planned'),
    ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000002', 2, 'Vatican Museums & Sistine Chapel Tour', 'Michelangelo’s ceiling and St. Peter’s Basilica.', 'Culture', 45.00, 'EUR', '08:30', '12:00', 0, 'Vatican City', 'booked'),
    ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000002', 2, 'Trevi Fountain & Spanish Steps Gelato Tour', 'Coin toss at Trevi followed by artisan pistachio gelato.', 'Relax', 10.00, 'EUR', '15:00', '17:30', 1, 'Piazza di Trevi', 'planned'),

    -- Amsterdam Activities
    ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000003', 1, 'Rijksmuseum & Van Gogh Museum Masterpieces', 'Rembrandt Night Watch and Van Gogh sunflowers.', 'Culture', 45.00, 'EUR', '10:00', '13:30', 0, 'Museumplein, Amsterdam', 'booked'),
    ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000003', 1, 'Historic Canal Evening Boat Tour & Cheese', 'Dutch artisan cheese tasting along illuminated UNESCO canals.', 'Sightseeing', 25.00, 'EUR', '17:00', '19:00', 1, 'Prinsengracht', 'booked'),
    ('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000003', 2, 'Jordaan District Boutique & Vintage Walk', 'Art galleries, vintage vinyl shops, and warm apple pie.', 'Shopping', 0.00, 'EUR', '11:00', '14:00', 0, 'Jordaan, Amsterdam', 'planned')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED EXPENSES FOR EUROPEAN ADVENTURE
INSERT INTO public.expenses (id, trip_id, category, description, amount, currency, expense_date, payment_method)
VALUES
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Flights', 'Roundtrip Flight to Europe', 85000.00, 'INR', '2026-09-10', 'Credit Card'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Stays', 'Paris Boutique Loft (4 Nights)', 42000.00, 'INR', '2026-09-10', 'Credit Card'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Transport', 'Flight: Paris to Rome', 8500.00, 'INR', '2026-09-14', 'Credit Card'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Stays', 'Rome Historic Apartment (4 Nights)', 38000.00, 'INR', '2026-09-14', 'Credit Card'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Activities', 'Louvre & Eiffel Tower Priority Passes', 12000.00, 'INR', '2026-09-11', 'Debit Card'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Food & Dining', 'Trattoria & Bistro Dinners', 24000.00, 'INR', '2026-09-16', 'Cash')
ON CONFLICT (id) DO NOTHING;
