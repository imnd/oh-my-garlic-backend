-- Seed data for development/testing

-- Insert default proxy sources
INSERT INTO proxy_sources (url) VALUES
    ('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'),
    ('https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt')
ON CONFLICT (url) DO NOTHING;