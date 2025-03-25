-- Create enum for track status
create type public.track_status as enum ('pending', 'matched', 'reviewed');

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

-- Set up Row Level Security (RLS)
alter table public.tracks enable row level security;

-- Create policies
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

-- Create updated_at trigger
create trigger handle_updated_at before update on public.tracks
  for each row execute procedure moddatetime (updated_at); 