-- Add icon column to categories
ALTER TABLE "categories" ADD COLUMN "icon" text;
--> statement-breakpoint

-- Seed categories
INSERT INTO "categories" ("public_id", "name", "slug", "icon", "description", "created_at", "updated_at") VALUES
  (gen_random_uuid(), 'Travel',    'travel',    '✈️',  'Adventures, destinations, and travel tips from around the world', now(), now()),
  (gen_random_uuid(), 'Work',      'work',      '💼',  'Productivity, career growth, and workplace insights',              now(), now()),
  (gen_random_uuid(), 'Software',  'software',  '💻',  'Engineering, architecture, and software development',              now(), now()),
  (gen_random_uuid(), 'Design',    'design',    '🎨',  'UI/UX, visual design, and creative process',                       now(), now()),
  (gen_random_uuid(), 'Health',    'health',    '❤️',  'Wellness, fitness, and mental health',                             now(), now()),
  (gen_random_uuid(), 'Food',      'food',      '🍴',  'Recipes, restaurants, and culinary adventures',                    now(), now()),
  (gen_random_uuid(), 'Finance',   'finance',   '💰',  'Personal finance, investing, and money management',                now(), now()),
  (gen_random_uuid(), 'Education', 'education', '📚',  'Learning, courses, and knowledge sharing',                         now(), now()),
  (gen_random_uuid(), 'Other',     'other',     '📦',  'Everything else worth writing about',                              now(), now())
ON CONFLICT (slug) DO UPDATE SET
  icon        = EXCLUDED.icon,
  description = EXCLUDED.description,
  updated_at  = now();
--> statement-breakpoint

-- Seed tags
INSERT INTO "tags" ("public_id", "name", "slug", "created_at") VALUES
  -- Travel
  (gen_random_uuid(), 'Backpacking',       'backpacking',       now()),
  (gen_random_uuid(), 'Solo travel',       'solo-travel',       now()),
  (gen_random_uuid(), 'Road trip',         'road-trip',         now()),
  (gen_random_uuid(), 'Budget travel',     'budget-travel',     now()),
  (gen_random_uuid(), 'Asia',              'asia',              now()),
  (gen_random_uuid(), 'Europe',            'europe',            now()),
  -- Work
  (gen_random_uuid(), 'Remote work',       'remote-work',       now()),
  (gen_random_uuid(), 'Productivity',      'productivity',      now()),
  (gen_random_uuid(), 'Career',            'career',            now()),
  (gen_random_uuid(), 'Leadership',        'leadership',        now()),
  (gen_random_uuid(), 'Freelancing',       'freelancing',       now()),
  -- Software
  (gen_random_uuid(), 'TypeScript',        'typescript',        now()),
  (gen_random_uuid(), 'Vue.js',            'vuejs',             now()),
  (gen_random_uuid(), 'React',             'react',             now()),
  (gen_random_uuid(), 'Bun',               'bun',               now()),
  (gen_random_uuid(), 'PostgreSQL',        'postgresql',        now()),
  (gen_random_uuid(), 'Open source',       'open-source',       now()),
  (gen_random_uuid(), 'DevOps',            'devops',            now()),
  (gen_random_uuid(), 'AI',                'ai',                now()),
  -- Design
  (gen_random_uuid(), 'UI design',         'ui-design',         now()),
  (gen_random_uuid(), 'UX research',       'ux-research',       now()),
  (gen_random_uuid(), 'Figma',             'figma',             now()),
  -- Health
  (gen_random_uuid(), 'Running',           'running',           now()),
  (gen_random_uuid(), 'Meditation',        'meditation',        now()),
  (gen_random_uuid(), 'Nutrition',         'nutrition',         now()),
  -- Food
  (gen_random_uuid(), 'Vietnamese cuisine','vietnamese-cuisine', now()),
  (gen_random_uuid(), 'Vegetarian',        'vegetarian',        now()),
  (gen_random_uuid(), 'Recipes',           'recipes',           now()),
  -- Finance
  (gen_random_uuid(), 'Investing',         'investing',         now()),
  (gen_random_uuid(), 'Savings',           'savings',           now()),
  -- General
  (gen_random_uuid(), 'Tutorial',          'tutorial',          now()),
  (gen_random_uuid(), 'Opinion',           'opinion',           now()),
  (gen_random_uuid(), 'Review',            'review',            now()),
  (gen_random_uuid(), 'News',              'news',              now())
ON CONFLICT (slug) DO NOTHING;
b