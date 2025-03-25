-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_admin boolean default false
);

-- Set up Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create tracks table
create type public.track_status as enum ('pending', 'matched', 'reviewed');

create table public.tracks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  genre text,
  file_path text,
  public_url text,
  status public.track_status default 'pending' not null,
  feedback_focus text[], -- Array of focus areas (e.g., mixing, composition)
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for tracks
alter table public.tracks enable row level security;

-- Create policies for tracks
create policy "Users can view their own tracks"
  on public.tracks for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own tracks"
  on public.tracks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own tracks"
  on public.tracks for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own tracks"
  on public.tracks for delete
  using ( auth.uid() = user_id );

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

-- Set up Row Level Security (RLS) for matches
alter table public.matches enable row level security;

-- Create policies for matches
create policy "Users can view matches they're part of"
  on public.matches for select
  using (
    exists (
      select 1 from public.tracks
      where (tracks.id = matches.track_a_id or tracks.id = matches.track_b_id)
      and tracks.user_id = auth.uid()
    )
  );

-- Create feedback table
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  giver_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  content jsonb not null, -- Structured feedback form data
  rating smallint check (rating >= 1 and rating <= 5),
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint different_users check (giver_id != receiver_id)
);

-- Set up Row Level Security (RLS) for feedback
alter table public.feedback enable row level security;

-- Create policies for feedback
create policy "Users can view feedback they've given or received"
  on public.feedback for select
  using (
    auth.uid() in (giver_id, receiver_id)
  );

create policy "Users can insert feedback they're giving"
  on public.feedback for insert
  with check (
    auth.uid() = giver_id
  );

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

-- Set up Row Level Security (RLS) for flags
alter table public.flags enable row level security;

-- Create policies for flags
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

create policy "Admins can view all flags"
  on public.flags for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Create functions and triggers
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create trigger on_match_created
  after insert on public.matches
  for each row execute procedure public.handle_new_match();

create function public.check_match_completion()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  feedback_count integer;
begin
  select count(*)
  into feedback_count
  from public.feedback
  where match_id = new.match_id;
  
  if feedback_count = 2 then
    update public.matches
    set status = 'completed',
        completed_at = now()
    where id = new.match_id;

    update public.tracks
    set status = 'reviewed'
    where id in (
      select track_a_id from public.matches where id = new.match_id
      union
      select track_b_id from public.matches where id = new.match_id
    );
  end if;
  
  return new;
end;
$$;

create trigger on_feedback_submitted
  after insert on public.feedback
  for each row execute procedure public.check_match_completion(); 