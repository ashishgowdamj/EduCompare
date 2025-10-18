alter table public.colleges   enable row level security;
alter table public.programs   enable row level security;
alter table public.cutoffs    enable row level security;
alter table public.profiles   enable row level security;
alter table public.reviews    enable row level security;
alter table public.favorites  enable row level security;
alter table public.review_votes enable row level security;
alter table public.seats enable row level security;
alter table public.admin_users enable row level security;

-- Public can read catalog
create policy "read_colleges" on public.colleges for select using (true);
create policy "read_programs" on public.programs for select using (true);
create policy "read_cutoffs"  on public.cutoffs  for select using (true);

-- Profiles: owner only
create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);
create policy "upsert_own_profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Reviews
create policy "read_approved_reviews" on public.reviews
  for select using (status = 'approved');
create policy "insert_own_review" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Review votes
create policy "read_votes" on public.review_votes
  for select using (true);
create policy "upsert_own_vote" on public.review_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favorites: owner only
create policy "rw_own_favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional admin powers (if you add admins):
create policy "admins_update_reviews" on public.reviews
  for update using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admins_catalog_crud" on public.colleges
  for all using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admins_programs_crud" on public.programs
  for all using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admins_cutoffs_crud" on public.cutoffs
  for all using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
