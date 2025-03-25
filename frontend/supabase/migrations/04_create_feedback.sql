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

-- Set up Row Level Security (RLS)
alter table public.feedback enable row level security;

-- Create policies
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

-- Create function to check if match is complete
create function public.check_match_completion()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  feedback_count integer;
begin
  -- Count feedback entries for this match
  select count(*)
  into feedback_count
  from public.feedback
  where match_id = new.match_id;
  
  -- If both users have submitted feedback, update match and track status
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

-- Create trigger for feedback submission
create trigger on_feedback_submitted
  after insert on public.feedback
  for each row execute procedure public.check_match_completion(); 