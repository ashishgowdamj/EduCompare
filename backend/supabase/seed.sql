insert into public.colleges (slug, name, state, city, nirf_rank, ownership, year_estd, accreditation, website, phone, email, latitude, longitude, cover_img_url, gallery_urls, streams, avg_fees, hostel_fees)
values
('iit-madras','IIT Madras','Tamil Nadu','Chennai', 1,'Public',1959,'NAAC A++','https://www.iitm.ac.in','044-2257-8280','info@iitm.ac.in',12.991,80.233,'https://picsum.photos/seed/iitm/800/480',array['https://picsum.photos/seed/iitm1/800/480'],array['Engineering','Science'],200000,50000),
('iiit-hyd','IIIT Hyderabad','Telangana','Hyderabad', 8,'Private',1998,'NAAC A','https://www.iiit.ac.in','040-6653-1000','info@iiit.ac.in',17.444,78.349,'https://picsum.photos/seed/iiith/800/480',array['https://picsum.photos/seed/iiith1/800/480'],array['Engineering','IT'],250000,60000);

insert into public.programs (college_id, name, degree, duration, annual_fee, seats, eligibility, entrance_exam)
select id, 'Computer Science and Engineering','B.Tech','4 years',200000,120,'JEE Advanced rank','JEE Advanced'
from public.colleges where slug='iit-madras';

insert into public.cutoffs (college_id, exam, year, round, category, rank_or_percentile)
select id, 'JEE Advanced', 2024, 'Round 1', 'GEN', 1200
from public.colleges where slug='iit-madras';
