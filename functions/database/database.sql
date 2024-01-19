-- SQL Schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table if not exists services (
    id uuid default uuid_generate_v4(),
    name text not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    unique (name, deleted_on)
);

create table if not exists users (
    id uuid default uuid_generate_v4(),
    name text not null,
    service_id uuid not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (service_id) references services(id),
    unique (name, service_id, deleted_on)
);

create table if not exists endpoints (
    id uuid default uuid_generate_v4(),
    url text not null,
    user_id uuid not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (user_id) references users(id)
);

create table if not exists event_types (
    id uuid default uuid_generate_v4(),
    name text not null,
    service_id uuid not null,
    topic_arn text not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (service_id) references services(id),
    unique (name, service_id, deleted_on)
);

create table if not exists subscriptions (
    id uuid default uuid_generate_v4(),
    event_type_id uuid not null,
    endpoint_id uuid not null,
    subscription_arn text not null unique,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (event_type_id) references event_types(id),
    foreign key (endpoint_id) references endpoints(id),
    unique (endpoint_id, event_type_id, deleted_on)
);

create table if not exists events (
    id uuid default uuid_generate_v4(),
    payload json,
    user_id uuid not null,
    event_type_id uuid not null,
    event_unique_key uuid not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (user_id) references users(id),
    foreign key (event_type_id) references event_types(id),
    unique (user_id, event_unique_key)
);

create table if not exists messages (
    id uuid default uuid_generate_v4(),
    delivered_at timestamp,
    delivery_attempts integer not null default 0,
    status integer not null,
    user_id uuid not null,
    endpoint text not null,
    event_id uuid not null,
    created_on timestamp not null default now(),
    deleted_on timestamp not null default to_timestamp(0),
    primary key (id),
    foreign key (user_id) references users(id) foreign key (event_id) references events(id)
);