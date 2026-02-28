Create Extension if not exist "citext" 
create Extinsion if not exist "uuid-ossp"

Create table users {
    id UUID primery key defult uuid_generate_v4(),
    email Citext not null unique,
    first_name varchar(100) not null,
    last-name varchar(100) not null 
    password varchar(255) not null,
    status user_status('active', 'inactive') not null default 'active',
    phone varchar(20) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
}

// Trigger to update the updated_at column on update
create or replace function update_updated_at_column()
returns trigger as $$ 
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';

create trigger update_users_updated_at
before update on users
for each row
execute procedure update_updated_at_column();