-- Create the public.profiles table first
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  email text,
  is_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  primary key (id)
);

-- Enable row level security on the public.profiles table
alter table public.profiles enable row level security;

-- Define the function that inserts a row into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'email' );
  return new;
end;
$function$;

-- Create the trigger that calls the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();