-- Seed data for Books by Forge

insert into public.books (isbn, title, author, cover_url, synopsis, domain, status)
values
  ('9781119387503', 'Inspired', 'Marty Cagan',
   'https://m.media-amazon.com/images/I/71EGMDz3EuL._AC_UF1000,1000_QL80_.jpg',
   'How the best tech companies build products that customers love. A must-read on modern product management, covering discovery, delivery, and team structure.',
   array['Product','Leadership'],
   'borrowed'),
  ('9781449373320', 'Designing Data-Intensive Applications', 'Martin Kleppmann',
   'https://m.media-amazon.com/images/I/91YfNb49PLL._AC_UF1000,1000_QL80_.jpg',
   'The big ideas behind reliable, scalable, and maintainable systems. Covers databases, stream processing, and distributed systems in depth.',
   array['Engineering','Data'],
   'available'),
  ('9780465050659', 'The Design of Everyday Things', 'Don Norman',
   'https://m.media-amazon.com/images/I/71sBJUEbMTL._AC_UF1000,1000_QL80_.jpg',
   'The foundational text on human-centered design. Explains why some products satisfy while others frustrate, through the lens of cognitive psychology.',
   array['Product Design'],
   'borrowed'),
  ('9780525536222', 'Measure What Matters', 'John Doerr',
   'https://m.media-amazon.com/images/I/71yEdNVLjWL._AC_UF1000,1000_QL80_.jpg',
   'How Google, Bono, and the Gates Foundation use OKRs to drive alignment and accountability. A practical guide to goal-setting that actually works.',
   array['Leadership','Strategy','Product'],
   'available'),
  ('9781591847786', 'Hooked', 'Nir Eyal',
   'https://m.media-amazon.com/images/I/71MRMLxEKsL._AC_UF1000,1000_QL80_.jpg',
   'A practical framework for building habit-forming products. Walks through the Hook Model: trigger, action, variable reward, and investment.',
   array['Product','Marketing','Product Design'],
   'borrowed'),
  ('9781942788003', 'Team Topologies', 'Matthew Skelton & Manuel Pais',
   'https://m.media-amazon.com/images/I/71mDOJz2Y0L._AC_UF1000,1000_QL80_.jpg',
   'How to organise business and technology teams for fast flow. Introduces four fundamental team types and three interaction modes.',
   array['Engineering','Leadership','Strategy'],
   'available'),
  ('9781999023005', 'Obviously Awesome', 'April Dunford',
   'https://m.media-amazon.com/images/I/71Wf+GjJDhL._AC_UF1000,1000_QL80_.jpg',
   'A step-by-step guide to product positioning. Shows how to make your product stand out by connecting what you do best with who needs it most.',
   array['Marketing','Product','Strategy'],
   'available'),
  ('9781250103505', 'Radical Candor', 'Kim Scott',
   'https://m.media-amazon.com/images/I/71MOEQXPGPL._AC_UF1000,1000_QL80_.jpg',
   'A framework for giving feedback that is both caring and direct. Essential reading for anyone who manages people or wants to build better teams.',
   array['People','Leadership'],
   'borrowed'),
  ('9781119002253', 'Storytelling with Data', 'Cole Nussbaumer Knaflic',
   'https://m.media-amazon.com/images/I/71GTFsnUJcL._AC_UF1000,1000_QL80_.jpg',
   'How to turn data into compelling visual stories. Covers chart selection, decluttering, and narrative structure for data presentations.',
   array['Data','Marketing','Product Design'],
   'available');

insert into public.colleagues (name, email)
values
  ('Sarah Chen', 'sarah.chen@example.com'),
  ('James Walker', 'james.walker@example.com'),
  ('Priya Patel', 'priya.patel@example.com'),
  ('Tom Richards', 'tom.richards@example.com'),
  ('Aisha Mohammed', 'aisha.mohammed@example.com');

-- Link some initial loans to match the mock data (books currently borrowed)
insert into public.loans (book_id, colleague_id, borrowed_at)
select b.id, c.id, '2026-01-28'::timestamptz
from public.books b
join public.colleagues c on b.title = 'Inspired' and c.name = 'Sarah Chen';

insert into public.loans (book_id, colleague_id, borrowed_at)
select b.id, c.id, '2026-02-03'::timestamptz
from public.books b
join public.colleagues c on b.title = 'The Design of Everyday Things' and c.name = 'James Walker';

insert into public.loans (book_id, colleague_id, borrowed_at)
select b.id, c.id, '2026-01-15'::timestamptz
from public.books b
join public.colleagues c on b.title = 'Hooked' and c.name = 'Priya Patel';

insert into public.loans (book_id, colleague_id, borrowed_at)
select b.id, c.id, '2026-02-07'::timestamptz
from public.books b
join public.colleagues c on b.title = 'Radical Candor' and c.name = 'Tom Richards';

