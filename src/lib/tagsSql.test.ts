import { describe, expect, it } from "vitest"
import dayScoreSql from "../../supabase/day_score.sql?raw"
import schemaSql from "../../supabase/timer_schema.sql?raw"
import verifySql from "../../supabase/timer_verify.sql?raw"
import { DATABASE_ERRORS } from "@/lib/timerApi"

// AB:TIMER.TESTS:START

// Tests of the session tags in the SQL files (Packet 10A). Run them with: npm test
// Like the tests of the pause log, these read the TEXT of the SQL files: npm test cannot run SQL.
// The behaviour itself (the limit, the names, the bring-back, who sees what) is checked by the owner with supabase/timer_verify.sql
// in the Supabase SQL Editor (18 rows), see CONNECTIONS.md C55 and C58. The rules are labelled DEFAULT in PACKET_10A: a number written here must match the SQL file.

const TAG_ERRORS = ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]

// [how the function is made, how it is named in the lines of revoke and grant]
const TAG_FUNCTIONS: [string, string][] = [
  ["timer_tag_list()", "timer_tag_list()"],
  ["timer_tag_add(p_name text)", "timer_tag_add(text)"],
  ["timer_tag_rename(p_id uuid, p_name text)", "timer_tag_rename(uuid, text)"],
  ["timer_tag_archive(p_id uuid)", "timer_tag_archive(uuid)"],
]

const NAME_CHECK = "if char_length(v_name) < 1 or char_length(v_name) > 20 or v_name ~ '[[:cntrl:]]' or lower(v_name) = 'freestyle' then"

function count(text: string, part: string): number {
  return text.split(part).length - 1
}

describe("the session tags in the SQL file (Packet 10A)", () => {
  it("makes the tag table: a name of 1 to 20 characters without spaces at the ends, Freestyle reserved, one live tag per name whatever the capitals", () => {
    expect(schemaSql).toContain("create table if not exists public.timer_tags (")
    expect(schemaSql).toContain("archived_at timestamptz,")
    expect(schemaSql).toContain(
      "constraint timer_tags_name_shape check (name = btrim(name) and char_length(name) between 1 and 20 and name !~ '[[:cntrl:]]' and lower(name) <> 'freestyle')",
    )
    expect(schemaSql).toContain("create unique index if not exists timer_tags_user_name_live_idx on public.timer_tags (user_id, lower(name)) where archived_at is null;")
  })

  it("adds tag_id to the running session and to the saved session, with no default (NULL is Freestyle or not known)", () => {
    const running = "alter table public.timer_running add column if not exists tag_id uuid references public.timer_tags (id);"
    const saved = "alter table public.timer_sessions add column if not exists tag_id uuid references public.timer_tags (id);"
    expect(schemaSql).toContain(running)
    expect(schemaSql).toContain(saved)
    expect(running).not.toContain("default")
    expect(saved).not.toContain("default")
  })

  it("turns row-level security on for the tags, lets a person only read their own, and gives nobody a direct write", () => {
    expect(schemaSql).toContain("alter table public.timer_tags enable row level security;")
    const tagPolicy = (schemaSql.split("create policy timer_tags_select_own on public.timer_tags")[1] ?? "").split(";")[0]
    expect(tagPolicy).toContain("for select to authenticated using (user_id = (select auth.uid()))")
    expect(schemaSql).toContain("revoke all on public.timer_tags from public, anon, authenticated;")
    expect(schemaSql).toContain("grant select on public.timer_tags to authenticated;")
    expect(schemaSql).not.toMatch(/grant [^;]*(insert|update|delete)[^;]* on public\.timer_tags/)
    expect(schemaSql).not.toMatch(/create policy [a-z_]+ on public\.timer_tags\s+for (insert|update|delete|all)/)
  })

  it("has the four tag functions, and lets only signed-in people call them", () => {
    for (const [made, named] of TAG_FUNCTIONS) {
      expect(schemaSql).toContain("create or replace function public." + made)
      expect(schemaSql).toContain("revoke all on function public." + named + " from public, anon;")
      expect(schemaSql).toContain("grant execute on function public." + named + " to authenticated;")
    }
  })

  it("timer_start: one version only (the one-argument one is dropped), the tag must be the person's own and live, and it goes into the running row", () => {
    expect(schemaSql).toContain("drop function if exists public.timer_start(text);")
    expect(schemaSql).toContain("create or replace function public.timer_start(p_tz text, p_tag_id uuid default null)")
    expect(schemaSql).not.toContain("create or replace function public.timer_start(p_tz text)")
    expect(schemaSql).toContain("where id = p_tag_id and user_id = auth.uid() and archived_at is null")
    expect(schemaSql).toContain("insert into public.timer_running (user_id, tz, tag_id)")
    expect(schemaSql).toContain("values (auth.uid(), p_tz, p_tag_id)")
    expect(schemaSql).toContain("revoke all on function public.timer_start(text, uuid) from public, anon;")
    expect(schemaSql).toContain("grant execute on function public.timer_start(text, uuid) to authenticated;")
  })

  it("timer_end saves the tag of the running session with the session, and does not look at the tag again", () => {
    expect(schemaSql).toContain("insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz, tag_id)")
    expect(schemaSql).toContain("r.started_at, v_end, v_active, v_pauses, r.tz, r.tag_id)")
    const body = schemaSql.split("create or replace function public.timer_end()")[1].split("$$;")[0]
    expect(body).not.toContain("timer_tags")
  })

  it("sends the tag of the running session to the app in timer_row_json (Packet 10C1), and the answer of timer_end has no new key", () => {
    const rowJson = schemaSql.split("create or replace function public.timer_row_json")[1].split("$$;")[0]
    expect(rowJson).toContain("'tag', (select jsonb_build_object('id', t.id, 'name', t.name) from public.timer_tags t where t.id = r.tag_id and t.user_id = r.user_id)")
    expect(rowJson.split("'tag'")).toHaveLength(2)
    expect(rowJson).not.toContain("'tag_id'")
    const end = schemaSql.split("create or replace function public.timer_end()")[1].split("$$;")[0]
    expect(end).not.toContain("'tag")
  })

  it("checks the name the same way in add and in rename: cut the spaces, 1 to 20 characters, no control character, Freestyle reserved", () => {
    expect(count(schemaSql, NAME_CHECK)).toBe(2)
    expect(count(schemaSql, "v_name := btrim(coalesce(p_name, ''));")).toBe(2)
    expect(count(schemaSql, "raise exception 'BAD_TAG_NAME';")).toBe(2)
  })

  it("allows at most 10 live tags in add (a rename needs no free place), and takes a lock per person in add and in rename", () => {
    expect(schemaSql).toContain("where user_id = auth.uid() and archived_at is null) >= 10 then")
    expect(count(schemaSql, "raise exception 'TAG_LIMIT';")).toBe(1)
    expect(count(schemaSql, "perform pg_advisory_xact_lock(hashtext('timer_tags:' || auth.uid()::text));")).toBe(2)
  })

  it("lets one person have one live tag of a name, whatever the capitals (add and rename), and a rename of a tag to its own name is not a clash", () => {
    expect(count(schemaSql, "archived_at is null and lower(name) = lower(v_name)")).toBe(2)
    expect(schemaSql).toContain("and lower(name) = lower(v_name) and id <> t.id)")
    expect(count(schemaSql, "raise exception 'TAG_NAME_TAKEN';")).toBe(2)
  })

  it("add brings back the newest archived tag of that name instead of making a second one", () => {
    expect(schemaSql).toContain("where user_id = auth.uid() and archived_at is not null and lower(name) = lower(v_name)")
    expect(schemaSql).toContain("order by archived_at desc, id desc")
    expect(schemaSql).toContain("update public.timer_tags set name = v_name, archived_at = null where id = t.id returning * into t;")
  })

  it("never deletes a tag: archive sets archived_at, a rename or an archive of an archived tag is TAG_NOT_FOUND", () => {
    expect(schemaSql).not.toMatch(/delete\s+from\s+public\.timer_tags/i)
    expect(schemaSql).toContain("update public.timer_tags set archived_at = now()")
    expect(schemaSql).toContain("where id = p_id and user_id = auth.uid() and archived_at is null")
    expect(count(schemaSql, "raise exception 'TAG_NOT_FOUND';")).toBe(3)
  })

  it("raises the four tag error names, and the list DATABASE_ERRORS of the app has them", () => {
    for (const name of TAG_ERRORS) {
      expect(schemaSql).toContain("raise exception '" + name + "';")
      expect(DATABASE_ERRORS).toContain(name)
    }
  })

  it("has a verify file of 18 rows that checks the tag parts, the two-argument timer_start, the tag key of timer_row_json and the function timer_tag_use", () => {
    expect(verifySql).toContain("Expected result: 18 rows")
    expect(verifySql.match(/^select '/gm)?.length).toBe(18)
    for (const name of [
      "tag_table_with_row_level_security",
      "tag_id_columns",
      "tag_functions_exist",
      "one_start_function",
      "anonymous_cannot_add_tag",
      "signed_in_can_add_tag",
      "tag_name_unique_among_live_tags",
      "row_json_sends_tag",
      "tag_use_function_exists",
      "anonymous_cannot_read_tag_use",
      "signed_in_can_read_tag_use",
      "tag_use_answers_a_list",
    ]) {
      expect(verifySql).toContain("'" + name + "'")
    }
    expect(verifySql).toContain("'public.timer_start(text, uuid)'")
    expect(verifySql).not.toContain("'public.timer_start(text)'")
    expect(verifySql).toContain("select 'tag_use_function_exists', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_tag_use')::text, '1'")
    expect(verifySql).toContain("select 'anonymous_cannot_read_tag_use', has_function_privilege('anon', 'public.timer_tag_use()', 'execute')::text, 'false'")
    expect(verifySql).toContain("select 'signed_in_can_read_tag_use', has_function_privilege('authenticated', 'public.timer_tag_use()', 'execute')::text, 'true'")
    expect(verifySql).toContain("select 'tag_use_answers_a_list', jsonb_typeof(public.timer_tag_use()), 'array'")
  })

  it("has timer_tag_use (Packet 10E): it only reads, it runs with the rights of the caller, and only signed-in people may call it", () => {
    expect(schemaSql).toContain("create or replace function public.timer_tag_use()")
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("stable")
    expect(body).toContain("set search_path = ''")
    expect(body).not.toContain("security definer")
    expect(body).not.toMatch(/\b(insert|update|delete)\b/i)
    expect(schemaSql).toContain("revoke all on function public.timer_tag_use() from public, anon;")
    expect(schemaSql).toContain("grant execute on function public.timer_tag_use() to authenticated;")
  })

  it("timer_tag_use sums the active seconds of the saved sessions of the person that ended in the last 30 days, and nothing else (Packet 10E)", () => {
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("sum(s.active_seconds) as seconds")
    expect(body).toContain("from public.timer_sessions s")
    expect(body).toContain("s.user_id = (select auth.uid()) and s.tag_id is not null and s.ended_at >= now() - interval '30 days'")
    expect(count(body, "'30 days'")).toBe(1)
    expect(body).toContain("group by s.tag_id")
    expect(body).not.toContain("timer_running")
  })

  it("timer_tag_use lists the live tags of the person only, gives 0 to a tag that was not used, and answers {id, seconds} oldest first like timer_tag_list (Packet 10E)", () => {
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("from public.timer_tags t")
    expect(body).toContain("left join (")
    expect(body).toContain(") u on u.tag_id = t.id")
    expect(body).toContain("t.user_id = (select auth.uid()) and t.archived_at is null")
    expect(body).toContain("jsonb_build_object('id', t.id, 'seconds', coalesce(u.seconds, 0)) order by t.created_at, t.id")
    expect(body).toContain("'[]'::jsonb")
    const list = schemaSql.split("create or replace function public.timer_tag_list()")[1].split("$$;")[0]
    expect(list).toContain("order by created_at, id")
  })

  it("keeps the tag out of the day score, and tells the API layer to read the new functions", () => {
    expect(dayScoreSql).not.toContain("tag_id")
    expect(dayScoreSql).not.toContain("timer_tags")
    expect(schemaSql.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true)
  })
})
// AB:TIMER.TESTS:END
