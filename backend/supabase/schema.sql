-- Catalog
create table if not exists public.colleges (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  state text not null,
  city text not null,
  nirf_rank int,
  ownership text check (ownership in ('Public','Private')),
  year_estd int,
  accreditation text,
  website text, phone text, email text,
  latitude numeric(9,6), longitude numeric(9,6),
  cover_img_url text,
  gallery_urls text[],
  streams text[],
  avg_fees int,
  hostel_fees int,
  created_at timestamptz default now()
);

create table if not exists public.programs (
  id bigserial primary key,
  college_id bigint not null references public.colleges(id) on delete cascade,
  name text not null,
  degree text not null,
  duration text,
  annual_fee int,
  seats int,
  eligibility text,
  entrance_exam text
);

create table if not exists public.cutoffs (
  id bigserial primary key,
  college_id bigint not null references public.colleges(id) on delete cascade,
  exam text not null,
  year int not null,
  round text,
  category text,
  rank_or_percentile numeric
);

-- Auth-linked profile
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  created_at timestamptz default now()
);

-- UGC
create table if not exists public.reviews (
  id bigserial primary key,
  college_id bigint not null references public.colleges(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  pros text,
  cons text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Extend reviews with optional detailed fields used by the app
alter table public.reviews add column if not exists body text;
alter table public.reviews add column if not exists rating_overall numeric;
alter table public.reviews add column if not exists rating_academics numeric;
alter table public.reviews add column if not exists rating_placements numeric;
alter table public.reviews add column if not exists rating_infra numeric;
alter table public.reviews add column if not exists rating_faculty numeric;

-- Votes on reviews (for helpful count)
create table if not exists public.review_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  review_id bigint not null references public.reviews(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, review_id)
);

-- Favorites
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id bigint not null references public.colleges(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, college_id)
);

-- Admins (optional; can moderate or do catalog edits later if needed)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin'))
);

-- Indexes
create index if not exists idx_colleges_name on public.colleges(name);
create index if not exists idx_colleges_state_city on public.colleges(state, city);
create index if not exists idx_colleges_nirf on public.colleges(nirf_rank);
create index if not exists idx_programs_college_degree on public.programs(college_id, degree);
create index if not exists idx_cutoffs_college_year on public.cutoffs(college_id, year);
create index if not exists idx_reviews_college_status on public.reviews(college_id, status);

-- Seats
create table if not exists public.seats (
  id bigserial primary key,
  college_id bigint not null references public.colleges(id) on delete cascade,
  year int not null,
  branch text,
  category text,
  intake int
);
create index if not exists idx_seats_college_year on public.seats(college_id, year);
create index if not exists idx_review_votes_review on public.review_votes(review_id);
