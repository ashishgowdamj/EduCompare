create or replace function public.f_search_colleges(
  q text default null,
  p_state text[] default null,
  p_streams text[] default null,
  min_rank int default null,
  max_rank int default null,
  min_fee int default null,
  max_fee int default null,
  p_limit int default 20,
  p_offset int default 0
) returns table(id bigint, slug text, name text, state text, city text, nirf_rank int, avg_fees int, cover_img_url text)
language sql stable as $$
  select c.id, c.slug, c.name, c.state, c.city, c.nirf_rank, c.avg_fees, c.cover_img_url
  from public.colleges c
  where
    (q is null or c.name ilike '%'||q||'%' or c.city ilike '%'||q||'%')
    and (p_state   is null or c.state = any(p_state))
    and (p_streams is null or (c.streams && p_streams))
    and (min_rank  is null or c.nirf_rank >= min_rank)
    and (max_rank  is null or c.nirf_rank <= max_rank)
    and (min_fee   is null or c.avg_fees >= min_fee)
    and (max_fee   is null or c.avg_fees <= max_fee)
  order by coalesce(c.nirf_rank, 999999), c.name
  limit p_limit offset p_offset;
$$;
