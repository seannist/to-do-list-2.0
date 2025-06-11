-- Create the todos table
create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  completed boolean default false,
  user_id uuid references auth.users(id),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  due_date timestamp with time zone,
  description text
);

-- Set up Row Level Security (RLS)
alter table todos enable row level security;

-- Create a policy that allows anyone to see todos
create policy "Anyone can see todos"
  on todos for select
  using (true);

-- Create a policy that allows anyone to insert todos
create policy "Anyone can insert todos"
  on todos for insert
  with check (true);

-- Create a policy that allows anyone to update todos
create policy "Anyone can update todos"
  on todos for update
  using (true);

-- Create a policy that allows anyone to delete todos
create policy "Anyone can delete todos"
  on todos for delete
  using (true);

-- Create indexes for better performance
create index if not exists todos_user_id_idx on todos(user_id);
create index if not exists todos_created_at_idx on todos(created_at);
create index if not exists todos_completed_idx on todos(completed);
create index if not exists todos_priority_idx on todos(priority); 