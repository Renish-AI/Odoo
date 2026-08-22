-- Seed Cities
INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('4b9de2be-4ff2-49cf-8919-e58bf43e7ca0', 'Tokyo', 'Japan', 'Asia', 'Neon skyscrapers, ancient shrines, world-class culinary scenes, and vibrant pop culture.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', 160.00, 4.9, 35.6762, 139.6503)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('1d4eb611-6677-4b71-b0db-bcf5c3671221', 'Kyoto', 'Japan', 'Asia', 'Thousands of classical Buddhist temples, Zen gardens, imperial palaces, and bamboo groves.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', 140.00, 4.9, 35.0116, 135.7681)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('3b95ee38-7090-482a-bc91-88df7907577b', 'Paris', 'France', 'Europe', 'The City of Light, romance, iconic architecture, world-renowned museums, and café terraces.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', 190.00, 4.8, 48.8566, 2.3522)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('c3e5aa51-fa72-4638-b7eb-62cf9b1784ff', 'Rome', 'Italy', 'Europe', 'An open-air museum of Roman antiquity, renaissance palaces, baroque piazzas, and authentic pasta.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', 155.00, 4.8, 41.9028, 12.4964)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('9bebe2df-3450-4ff6-9cb3-38bf3bbf8bb8', 'Barcelona', 'Spain', 'Europe', 'Gaudí masterpieces, Mediterranean beaches, gothic alleyways, and world-class tapas bars.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80', 145.00, 4.8, 41.3879, 2.1699)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('fe825488-8120-4e50-9bb3-58cf5bbf4ee4', 'Bali', 'Indonesia', 'Asia', 'Lush terraced rice paddies, spiritual Hindu temples, surf breaks, and tranquil wellness retreats.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 75.00, 4.9, -8.4095, 115.1889)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('9beee1df-fa72-4638-b7eb-62cf9b1784ff', 'New York City', 'United States', 'North America', 'The energetic global capital of Broadway, world finance, landmark skyscrapers, and diverse food culture.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', 240.00, 4.7, 40.7128, -74.0060)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('c4e5aa51-fa72-4638-b7eb-62cf9b1784ff', 'London', 'United Kingdom', 'Europe', 'Royal history, West End theatre, world-class free museums, cozy pubs, and iconic skyline icons.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', 210.00, 4.8, 51.5074, -0.1278)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('f9e25488-8120-4e50-9bb3-58cf5bbf4ee4', 'Dubai', 'United Arab Emirates', 'Middle East', 'Futuristic architecture, ultra-luxury shopping, desert safaris, and golden Arabian gulf beaches.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', 220.00, 4.7, 25.2048, 55.2708)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('e9bfe2be-4ff2-49cf-8919-e58bf43e7ca0', 'Reykjavik', 'Iceland', 'Europe', 'Dramatic volcanic waterfalls, geothermal lagoons, black sand beaches, and the ethereal Northern Lights.', 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', 230.00, 4.9, 64.1466, -21.9426)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('11223344-5566-7788-9900-aabbccddeeff', 'New Delhi', 'India', 'Asia', 'A vibrant blend of ancient history, Mughal architecture, bustling bazaars, and diverse culinary street food.', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', 60.00, 4.6, 28.6139, 77.2090)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('ffe25488-8120-4e50-9bb3-58cf5bbf4ee4', 'Jaipur', 'India', 'Asia', 'The Pink City, famed for its majestic forts, royal palaces, vibrant markets, and rich Rajputana heritage.', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80', 55.00, 4.8, 26.9124, 75.7873)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cities (id, name, country, region, description, image_url, average_daily_cost, popularity_score, latitude, longitude)
VALUES
    ('a9bfe2be-4ff2-49cf-8919-e58bf43e7ca0', 'Goa', 'India', 'Asia', 'Sun-kissed beaches, Portuguese heritage architecture, vibrant nightlife, and relaxed coastal vibes.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', 75.00, 4.7, 15.2993, 74.1240)
    ON CONFLICT (id) DO NOTHING;
