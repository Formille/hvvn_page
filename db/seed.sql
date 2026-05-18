-- Sample data for local testing. Run AFTER schema.sql.
insert into public.products (slug, name, price_krw, short_description, description_html, stock, thumbnail_url, is_published, is_set)
values
  ('archive-tee-01', 'Archive Tee 01', 38000, '오버사이즈 핏 / 100% 코튼', '<p>hvvn 의 첫 굿즈 티셔츠.</p>', 12, null, true, false),
  ('artprint-a3', 'Artprint A3', 22000, '리미티드 100장 / A3 사이즈', '<p>친환경 종이에 인쇄된 한정판 작품 프린트.</p>', 30, null, true, false),
  ('keyring', 'Keyring', 9000, '메탈 / 38mm', '<p>일상에서 함께할 수 있는 작은 사인.</p>', 0, null, true, false)
on conflict (slug) do nothing;
