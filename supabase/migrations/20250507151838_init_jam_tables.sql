create table "public"."jam_devlogs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_name" text not null,
    "content" text not null,
    "jam_id" uuid not null,
    "attachment_url" text
);


alter table "public"."jam_devlogs" enable row level security;

create table "public"."jams" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "number" bigint not null,
    "name" text not null,
    "start_timestamp" timestamp without time zone,
    "end_timestamp" timestamp without time zone,
    "type" text default 'gamejam'::text,
    "tag" text default 'gamejam'::text
);


alter table "public"."jams" enable row level security;

CREATE UNIQUE INDEX jam_devlogs_pkey ON public.jam_devlogs USING btree (id);

CREATE UNIQUE INDEX jams_pkey ON public.jams USING btree (id);

alter table "public"."jam_devlogs" add constraint "jam_devlogs_pkey" PRIMARY KEY using index "jam_devlogs_pkey";

alter table "public"."jams" add constraint "jams_pkey" PRIMARY KEY using index "jams_pkey";

alter table "public"."jam_devlogs" add constraint "jam_devlogs_jam_id_fkey" FOREIGN KEY (jam_id) REFERENCES jams(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."jam_devlogs" validate constraint "jam_devlogs_jam_id_fkey";

grant delete on table "public"."jam_devlogs" to "anon";

grant insert on table "public"."jam_devlogs" to "anon";

grant references on table "public"."jam_devlogs" to "anon";

grant select on table "public"."jam_devlogs" to "anon";

grant trigger on table "public"."jam_devlogs" to "anon";

grant truncate on table "public"."jam_devlogs" to "anon";

grant update on table "public"."jam_devlogs" to "anon";

grant delete on table "public"."jam_devlogs" to "authenticated";

grant insert on table "public"."jam_devlogs" to "authenticated";

grant references on table "public"."jam_devlogs" to "authenticated";

grant select on table "public"."jam_devlogs" to "authenticated";

grant trigger on table "public"."jam_devlogs" to "authenticated";

grant truncate on table "public"."jam_devlogs" to "authenticated";

grant update on table "public"."jam_devlogs" to "authenticated";

grant delete on table "public"."jam_devlogs" to "service_role";

grant insert on table "public"."jam_devlogs" to "service_role";

grant references on table "public"."jam_devlogs" to "service_role";

grant select on table "public"."jam_devlogs" to "service_role";

grant trigger on table "public"."jam_devlogs" to "service_role";

grant truncate on table "public"."jam_devlogs" to "service_role";

grant update on table "public"."jam_devlogs" to "service_role";

grant delete on table "public"."jams" to "anon";

grant insert on table "public"."jams" to "anon";

grant references on table "public"."jams" to "anon";

grant select on table "public"."jams" to "anon";

grant trigger on table "public"."jams" to "anon";

grant truncate on table "public"."jams" to "anon";

grant update on table "public"."jams" to "anon";

grant delete on table "public"."jams" to "authenticated";

grant insert on table "public"."jams" to "authenticated";

grant references on table "public"."jams" to "authenticated";

grant select on table "public"."jams" to "authenticated";

grant trigger on table "public"."jams" to "authenticated";

grant truncate on table "public"."jams" to "authenticated";

grant update on table "public"."jams" to "authenticated";

grant delete on table "public"."jams" to "service_role";

grant insert on table "public"."jams" to "service_role";

grant references on table "public"."jams" to "service_role";

grant select on table "public"."jams" to "service_role";

grant trigger on table "public"."jams" to "service_role";

grant truncate on table "public"."jams" to "service_role";

grant update on table "public"."jams" to "service_role";