-- Create flags table
create table public.flags (
  id uuid default gen_random_uuid() primary key,
  feedback_id uuid references public.feedback(id) on delete cascade not null,
  flagger_id uuid references public.profiles(id) not null,
  reason text not null,
  details text,
  status text default 'open' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- Set up Row Level Security (RLS)
alter table public.flags enable row level security;

-- Create policies
create policy "Users can view flags they've created"
  on public.flags for select
  using (
    auth.uid() = flagger_id
  );

create policy "Users can create flags"
  on public.flags for insert
  with check (
    auth.uid() = flagger_id
  );

-- Create policy for admins to view all flags (you'll need to set up admin roles)
create policy "Admins can view all flags"
  on public.flags for select
  using (
    auth.uid() in (
      select id from public.profiles
      where is_admin = true
    )
  ); 