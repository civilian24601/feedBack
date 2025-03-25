-- Cleanup existing objects
-- Drop existing storage policies first
DROP POLICY IF EXISTS "Users can upload their own tracks" ON storage.objects;
DROP POLICY IF EXISTS "Users can read matched tracks" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Drop existing storage buckets
DELETE FROM storage.buckets WHERE id IN ('tracks', 'avatars');

-- Drop existing tables and types in reverse order of dependencies
DROP TABLE IF EXISTS public.flags CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.tracks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.track_status CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_match() CASCADE;
DROP FUNCTION IF EXISTS public.check_match_completion() CASCADE;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_match_created ON public.matches;
DROP TRIGGER IF EXISTS on_feedback_submitted ON public.feedback;

-- Now create everything fresh
-- Create custom types
CREATE TYPE public.track_status AS ENUM ('pending', 'matched', 'reviewed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime";

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

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('tracks', 'tracks', false),
  ('avatars', 'avatars', true);

-- Storage policies
-- Allow users to upload their own tracks
CREATE POLICY "Users can upload their own tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tracks' AND
  (storage.foldername(name))[1]::text = auth.uid()::text
);

-- Allow users to read tracks they have access to (matched tracks)
CREATE POLICY "Users can read matched tracks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tracks' AND
  (
    -- Allow access to own tracks
    (storage.foldername(name))[1]::text = auth.uid()::text OR
    -- Allow access to matched tracks (we'll need to implement this logic in the application)
    EXISTS (
      SELECT 1 FROM tracks t
      JOIN matches m ON t.id = m.track_a_id OR t.id = m.track_b_id
      WHERE t.user_id = auth.uid()
      AND (storage.foldername(name))[1]::text = t.user_id::text
    )
  )
);

-- Allow users to delete their own tracks
CREATE POLICY "Users can delete their own tracks"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tracks' AND
  (storage.foldername(name))[1]::text = auth.uid()::text
);

-- Avatar policies (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1]::text = auth.uid()::text
); 