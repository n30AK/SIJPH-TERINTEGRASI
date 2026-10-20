-- Registry seed only. This records source endpoints, not the legal status of individual instruments.
-- Verify access terms, availability and ingestion permissions before crawling or bulk import.
BEGIN;

INSERT INTO legal_sources
  (source_key, title, publisher, source_type, canonical_url, jurisdiction, subject_tags, usage_rights, trust_tier)
SELECT v.source_key, v.title, v.publisher, v.source_type, v.canonical_url, v.jurisdiction,
       v.subject_tags, v.usage_rights, v.trust_tier
FROM (VALUES
  ('peraturan-go-id', 'Portal Peraturan Perundang-undangan Indonesia', 'Pemerintah Republik Indonesia', 'regulation_portal', 'https://peraturan.go.id/', 'Indonesia', ARRAY['peraturan','regulasi'], 'Periksa ketentuan penggunaan dan metadata sumber sebelum reproduksi massal.', 'primary_official'),
  ('jdihn-go-id', 'Jaringan Dokumentasi dan Informasi Hukum Nasional', 'BPHN / JDIHN', 'official_jdih', 'https://jdihn.go.id/', 'Indonesia', ARRAY['peraturan','JDIH'], 'Periksa ketentuan sumber anggota JDIH sebelum ingestion.', 'primary_official'),
  ('putusan3-mahkamahagung', 'Direktori Putusan Mahkamah Agung RI', 'Mahkamah Agung Republik Indonesia', 'court_decision', 'https://putusan3.mahkamahagung.go.id/', 'Indonesia', ARRAY['putusan','yurisprudensi'], 'Periksa ketentuan penggunaan dan batasan data putusan.', 'primary_official'),
  ('mkri-id', 'Mahkamah Konstitusi Republik Indonesia', 'Mahkamah Konstitusi Republik Indonesia', 'court_decision', 'https://www.mkri.id/', 'Indonesia', ARRAY['putusan','konstitusi'], 'Periksa ketentuan penggunaan sumber sebelum ingestion.', 'primary_official')
) AS v(source_key,title,publisher,source_type,canonical_url,jurisdiction,subject_tags,usage_rights,trust_tier)
WHERE NOT EXISTS (
  SELECT 1 FROM legal_sources s WHERE s.organization_id IS NULL AND s.source_key = v.source_key
);

COMMIT;
