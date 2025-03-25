-- Create matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  track_a_id uuid references public.tracks(id) on delete cascade not null,
  track_b_id uuid references public.tracks(id) on delete cascade not null,
  status text default 'pending' not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  constraint different_tracks check (track_a_id != track_b_id)
);

-- Set up Row Level Security (RLS)
alter table public.matches enable row level security;

-- Create policies
create policy "Users can view matches they're part of"
  on public.matches for select
  using (
    exists (
      select 1 from public.tracks
      where (tracks.id = matches.track_a_id or tracks.id = matches.track_b_id)
      and tracks.user_id = auth.uid()
    )
  );

-- Create function to update track status when matched
create function public.handle_new_match()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.tracks
  set status = 'matched'
  where id in (new.track_a_id, new.track_b_id);
  return new;
end;
$$;

-- Create trigger for new match creation
create trigger on_match_created
  after insert on public.matches
  for each row execute procedure public.handle_new_match(); 