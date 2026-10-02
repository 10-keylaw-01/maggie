-- Seed data. Prices converted from the original USD data at ~KES 129/USD and rounded to the nearest KES 10.
-- stock_qty is a PLACEHOLDER (50) — update real stock from Admin > Products.
begin;

insert into public.categories (id, name, description, icon, sort_order) values
  ('vitamins', 'Vitamins & Supplements', 'Daily vitamins, minerals and supplements for immunity, energy and heart health.', 'solar:pills-3-linear', 1),
  ('cold-flu', 'Cold & Flu', 'Relief for cough, fever, blocked nose and sore throat.', 'solar:thermometer-linear', 2),
  ('pain-relief', 'Pain Relief', 'Tablets for headaches, muscle aches, period pain and fever.', 'solar:bandage-linear', 3),
  ('skincare', 'Skincare', 'Moisturisers and sun protection for everyday skin health.', 'solar:sun-2-linear', 4),
  ('digestive', 'Digestive Health', 'Antacids and probiotics for heartburn, indigestion and gut balance.', 'solar:health-linear', 5),
  ('first-aid', 'First Aid', 'Bandages, antiseptics and kits for cuts, scrapes and emergencies.', 'solar:medical-kit-linear', 6)
on conflict (id) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order;

insert into public.categories (id, name, description, icon, sort_order) values
  ('prescription', 'Prescription Medicines', 'Prescription-only medicines, dispensed after a pharmacist checks your prescription.', 'solar:document-medicine-linear', 7)
on conflict (id) do nothing;

insert into public.products (id, category_id, name, brand, generic_name, dosage_form, strength, pack_size, price, compare_at_price, stock_qty, requires_prescription, image_url, badge, description, details, is_featured, is_active) values
  (1, 'vitamins', 'Vitamin C 1000mg', null, 'Ascorbic acid (Vitamin C)', 'Tablet', '1000 mg', '120 tablets', 1930, 2580, 50, false, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', 'Best Seller', 'High-potency Vitamin C with Rose Hips for immune support. Each tablet delivers 1000mg of ascorbic acid to support your immune system, skin health, and antioxidant protection.', array['1000mg per tablet', '120 tablets per bottle', 'With Rose Hips', 'Non-GMO', 'Gluten Free']::text[], true, true),
  (2, 'vitamins', 'Omega-3 Fish Oil', null, 'Omega-3 fatty acids (fish oil)', 'Softgel', '1200 mg', '90 softgels', 2970, null, 50, false, 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80', null, 'Premium Omega-3 fatty acids from wild-caught fish. Supports heart health, brain function, and joint mobility.', array['1200mg per softgel', '90 softgels', 'Wild-caught fish', 'Enteric coated', 'No fishy aftertaste']::text[], true, true),
  (3, 'cold-flu', 'DayQuil Cold & Flu', 'DayQuil', 'Acetaminophen (paracetamol) combination', 'Liquid capsule', '325 mg', '24 LiquiCaps', 1480, 1800, 50, false, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80', 'Sale', 'Non-drowsy daytime relief for cold and flu symptoms including fever, cough, sore throat, and nasal congestion.', array['24 LiquiCaps', 'Non-drowsy formula', 'Relieves 6 symptoms', 'Acetaminophen 325mg']::text[], false, true),
  (4, 'pain-relief', 'Ibuprofen 200mg', null, 'Ibuprofen', 'Tablet', '200 mg', '100 coated tablets', 1160, null, 50, false, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', 'Top Rated', 'Fast-acting pain reliever and fever reducer. Effective for headaches, muscle aches, arthritis, backache, and menstrual cramps.', array['200mg per tablet', '100 coated tablets', 'NSAID pain reliever', 'Fever reducer']::text[], true, true),
  (5, 'skincare', 'Hydrating Face Moisturizer', null, 'Hyaluronic acid, SPF 30', 'Cream', null, '60 ml', 2450, 3220, 50, false, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80', 'New', 'Lightweight daily moisturizer with hyaluronic acid and SPF 30. Hydrates, protects, and improves skin texture.', array['SPF 30 protection', 'Hyaluronic acid', '2oz / 60ml', 'Fragrance-free', 'Dermatologist tested']::text[], false, true),
  (6, 'digestive', 'Probiotic 50 Billion CFU', null, 'Probiotic blend (20 strains)', 'Capsule', '50 billion CFU', '60 capsules', 3870, 4510, 50, false, 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&q=80', 'Sale', 'Advanced probiotic formula with 50 billion CFU and 20 strains to support digestive health and immune function.', array['50 Billion CFU', '20 probiotic strains', '60 capsules', 'Shelf stable', 'Delayed release']::text[], true, true),
  (7, 'first-aid', 'First Aid Kit Deluxe', null, null, 'Kit', null, '200 pieces', 4510, null, 50, false, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80', null, '200-piece comprehensive first aid kit for home, car, or travel. Includes bandages, antiseptics, gauze, and more.', array['200 pieces', 'Hard case included', 'Contents suited to home, car & travel', 'Ideal for home & travel']::text[], true, true),
  (8, 'vitamins', 'Melatonin 5mg', null, 'Melatonin', 'Tablet', '5 mg', '90 tablets', 1290, null, 50, false, 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&q=80', null, 'Melatonin supplement to help you fall asleep faster. Speak to a pharmacist or doctor before using it with other medicines, or if you are pregnant or breastfeeding.', array['5mg per tablet', '90 tablets', 'Dietary supplement', 'Vegetarian']::text[], false, true),
  (9, 'cold-flu', 'NyQuil Nighttime Relief', 'NyQuil', 'Acetaminophen, dextromethorphan, doxylamine', 'Liquid capsule', null, '24 LiquiCaps', 1680, null, 0, false, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80', null, 'Nighttime cold and flu relief to help you sleep through symptoms. Relieves cough, sore throat, headache, and fever.', array['24 LiquiCaps', 'Nighttime formula', 'Relieves 6 symptoms', 'Doxylamine succinate']::text[], false, true),
  (10, 'skincare', 'Sunscreen SPF 50', null, 'Broad-spectrum sunscreen, SPF 50', 'Lotion', null, '90 ml tube', 2060, 2580, 50, false, 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80', 'Sale', 'Broad spectrum SPF 50 sunscreen. Water resistant for 80 minutes. Lightweight, non-greasy formula.', array['SPF 50', 'Broad spectrum UVA/UVB', 'Water resistant 80 min', '3oz tube']::text[], true, true),
  (11, 'digestive', 'Antacid Chewable Tablets', null, 'Calcium carbonate', 'Chewable tablet', '750 mg', '96 tablets', 970, null, 50, false, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', null, 'Fast-acting antacid for heartburn, acid indigestion, and upset stomach. Calcium carbonate 750mg.', array['750mg calcium carbonate', '96 chewable tablets', 'Assorted fruit flavors', 'Fast acting']::text[], false, true),
  (12, 'first-aid', 'Adhesive Bandages 100ct', null, null, 'Bandage', null, '100 bandages', 900, null, 50, false, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', 'Best Seller', 'Flexible fabric bandages that move with you. Sterile, latex-free, and comfortable for all-day wear.', array['100 bandages', 'Assorted sizes', 'Latex-free', 'Sterile', 'Flexible fabric']::text[], true, true)
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.products', 'id'), (select max(id) from public.products));

-- ---------------------------------------------------------------------
-- Advertisement cards
-- ---------------------------------------------------------------------
insert into public.promotions (placement, title, subtitle, badge_text, cta_label, cta_link, icon, theme, sort_order)
select * from (values
  ('hero',      'Your pharmacy, delivered to your door',  'Order medicines, vitamins and health essentials online and pay securely with M-Pesa.', 'Online pharmacy', 'Shop now', '/shop', 'solar:delivery-linear', 'green', 1),
  ('home_card', 'Boost your immunity',                    'Vitamin C, Omega-3 and probiotics to keep you going all season.',                         'Vitamins',        'Shop vitamins', '/shop?cat=vitamins', 'solar:shield-plus-linear', 'green', 1),
  ('home_card', 'Pay with M-Pesa',                        'Approve a payment prompt on your phone at checkout — no card needed.',                      'Easy payment',    'Start shopping', '/shop', 'solar:smartphone-2-linear', 'dark', 2),
  ('home_card', 'Cold & flu season essentials',           'Daytime and night-time relief that helps you rest and recover.',                           'Cold & Flu',      'Shop cold & flu', '/shop?cat=cold-flu', 'solar:thermometer-linear', 'amber', 3),
  ('home_card', 'Sun & skin care',                        'SPF protection and daily moisturisers for healthy skin.',                                  'Skincare',        'Shop skincare', '/shop?cat=skincare', 'solar:sun-2-linear', 'light', 4),
  ('shop_banner','Have a prescription?',                  'Add your medicine to the cart and upload your prescription at checkout. A pharmacist reviews it before dispatch.', 'Prescriptions', 'How it works', '/about', 'solar:document-medicine-linear', 'dark', 1)
) as v(placement, title, subtitle, badge_text, cta_label, cta_link, icon, theme, sort_order)
where not exists (select 1 from public.promotions);

-- ---------------------------------------------------------------------
-- Services (what the store actually does)
-- ---------------------------------------------------------------------
insert into public.services (tag, title, description, icon, link, sort_order)
select * from (values
  ('Prescriptions', 'Prescription fulfilment', 'Upload your prescription at checkout. A pharmacist verifies it before your medicine is dispatched.', 'solar:document-medicine-linear', '/shop?cat=prescription', 1),
  ('Advice',        'Ask a pharmacist',        'Unsure about a dose or an interaction? Send us a question and our pharmacy team will reply.',      'solar:chat-round-dots-linear', '/contact', 2),
  ('Delivery',      'Home delivery',           'Orders are packed and delivered to your address. Delivery is free above the order value shown at checkout.', 'solar:delivery-linear', '/shop', 3),
  ('Payments',      'M-Pesa checkout',         'Pay securely with a Safaricom M-Pesa prompt sent straight to your phone.',                         'solar:smartphone-2-linear', '/shop', 4)
) as v(tag, title, description, icon, link, sort_order)
where not exists (select 1 from public.services);

-- ---------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------
insert into public.faqs (question, answer, sort_order)
select * from (values
  ('How do I pay for my order?', 'At checkout choose M-Pesa, enter your Safaricom number and we send an STK Push prompt to your phone. Enter your M-Pesa PIN to approve it and your order is confirmed automatically.', 1),
  ('Do I need a prescription?', 'Only for medicines marked "Prescription only". Add them to your cart, upload a clear photo or PDF of your prescription at checkout, and a pharmacist will verify it before dispatch. Over-the-counter products need no prescription.', 2),
  ('How much is delivery?', 'The delivery fee and the order value above which delivery is free are shown in your cart and at checkout, calculated before you pay.', 3),
  ('How can I track my order?', 'Open the Track Order page and enter your order number and the phone number you used at checkout. If you created an account, your orders are also listed there.', 4),
  ('What if my M-Pesa prompt does not arrive?', 'Check that the number is a registered Safaricom M-Pesa line with network coverage, then try again from the payment screen. If money was deducted but your order still shows unpaid, contact us with your M-Pesa confirmation message.', 5),
  ('Can I ask a pharmacist a question before buying?', 'Yes. Use the contact form and choose "Ask a pharmacist". Please do not rely on the website for emergencies — in an emergency go to the nearest hospital.', 6)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- ---------------------------------------------------------------------
-- Site settings (edit all of these in Admin > Settings)
-- Contact details are intentionally blank: they are hidden on the site until you fill them in.
-- ---------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('brand_name',               to_jsonb('Valentine Pharmacy'::text)),
  ('tagline',                  to_jsonb('Genuine care, delivered.'::text)),
  ('hero_title',               to_jsonb('Medicines and health essentials, delivered to you.'::text)),
  ('hero_subtitle',            to_jsonb('Shop vitamins, cold & flu, pain relief, skincare and first aid. Pay with M-Pesa and track your order from checkout to your door.'::text)),
  ('phone',                    to_jsonb(''::text)),
  ('whatsapp',                 to_jsonb(''::text)),
  ('email',                    to_jsonb(''::text)),
  ('address',                  to_jsonb(''::text)),
  ('opening_hours',            to_jsonb(''::text)),
  ('ppb_license',              to_jsonb(''::text)),
  ('delivery_fee',             to_jsonb(700)),
  ('free_delivery_threshold',  to_jsonb(4500)),
  ('tax_rate',                 to_jsonb(0)),
  ('delivery_eta',             to_jsonb('1–3 business days'::text)),
  ('cod_enabled',              to_jsonb(false)),
  ('about_title',              to_jsonb('Pharmacy care you can order from home.'::text)),
  ('about_intro',              to_jsonb('We make it simple to get the medicines and health products your family needs, with pharmacist oversight on prescriptions and secure M-Pesa payment.'::text)),
  ('about_mission_title',      to_jsonb('Safe, simple and accessible healthcare shopping.'::text)),
  ('about_mission_body',       to_jsonb('Every prescription order is reviewed by a pharmacist before it is dispatched, and prices and stock shown on the site are the same ones used at checkout.'::text)),
  ('about_points',             to_jsonb(array['Prescriptions verified by a pharmacist before dispatch', 'Secure M-Pesa checkout — no card details collected', 'Clear pricing: delivery fee shown before you pay', 'Order tracking with your order number'])),
  ('about_stats',              '[{"value":"M-Pesa","label":"Secure mobile payments"},{"value":"Rx","label":"Pharmacist-checked prescriptions"},{"value":"24/7","label":"Order online any time"},{"value":"Tracked","label":"Orders from checkout to door"}]'::jsonb)
on conflict (key) do nothing;

commit;
