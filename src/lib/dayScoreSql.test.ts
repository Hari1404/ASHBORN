import { describe, expect, it } from "vitest"
import dayScoreSql from "../../supabase/day_score.sql?raw"
import dayScoreVerifySql from "../../supabase/day_score_verify.sql?raw"
import schemaSql from "../../supabase/timer_schema.sql?raw"

// AB:TIMER.TESTS:START

// Tests of the day score in the SQL files (Packet 09B). Run them with: npm test
// Like the tests of the pause log, these read the TEXT of the SQL files: npm test cannot run SQL.
// The behaviour itself (the seven worked days, the cap, the stop alert, the edges of the words) is checked by the owner with
// supabase/day_score_verify.sql in the Supabase SQL Editor, see CONNECTIONS.md C54.
// The rules are in DECISIONS_DAY_SCORE.md. A number written here must match that file and the SQL file.

const FUNCTIONS = [
  "timer_session_score(timestamptz, timestamptz, integer, jsonb)",
  "timer_usual_seconds(numeric[])",
  "timer_day_word(numeric, integer, numeric)",
  "timer_day_score(date)",
]

describe("the day score SQL file: what it makes and who may call it (Packet 09B)", () => {
  it("makes exactly the four functions of the day score", () => {
    const made = [...dayScoreSql.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1])
    expect(made).toEqual(["timer_session_score", "timer_usual_seconds", "timer_day_word", "timer_day_score"])
  })

  it("does not change any table and does not replace any function of the timer", () => {
    expect(dayScoreSql).not.toMatch(/create table|alter table|drop |insert into|update public|delete from/i)
    expect(dayScoreSql).not.toMatch(/create or replace function public\.timer_(start|pause|resume|end|state|day_total|cap_at|row_json)\b/)
    expect(dayScoreSql).not.toContain("timer_running")
  })

  it("lets only signed-in people call each function, never the anonymous role", () => {
    for (const signature of FUNCTIONS) {
      expect(dayScoreSql).toContain("revoke all on function public." + signature + " from public, anon;")
      expect(dayScoreSql).toContain("grant execute on function public." + signature + " to authenticated;")
    }
  })

  it("keeps the three helpers pure (immutable) and the day function read-only (stable, not security definer)", () => {
    const body = (name: string) => dayScoreSql.split("create or replace function public." + name + "(")[1].split("$$;")[0]
    for (const name of ["timer_session_score", "timer_usual_seconds", "timer_day_word"]) {
      expect(body(name)).toContain("immutable")
      expect(body(name)).not.toContain("public.timer_sessions")
    }
    expect(body("timer_day_score")).toContain("stable")
    expect(body("timer_day_score")).not.toContain("security definer")
    expect(body("timer_day_score")).toContain("where user_id = (select auth.uid()) and day < p_day")
    expect(body("timer_day_score")).toContain("where t.user_id = (select auth.uid())")
  })
})

describe("the day score SQL file: the rules of DECISIONS_DAY_SCORE.md (Packet 09B)", () => {
  it("reads the pause log with the keys from and to that timer_schema.sql writes, and tells NULL (not known) from [] (no pause)", () => {
    expect(schemaSql).toContain("jsonb_build_object('from', r.paused_at, 'to', now())")
    expect(dayScoreSql).toContain("(e.value ->> 'from')::timestamptz")
    expect(dayScoreSql).toContain("(e.value ->> 'to')::timestamptz")
    expect(dayScoreSql).toContain("coalesce(p_pauses, '[]'::jsonb)")
    expect(dayScoreSql).toContain("case when p_pauses is null then least(p_active, 10800)::numeric")
  })

  it("gives a stretch a credit from 0.75 up to 1.0 at 45 minutes, with the division last so that it stays exact", () => {
    expect(dayScoreSql).toContain("kept * 0.75 + kept * least(kept, 2700) / 10800 as credit")
  })

  it("cuts a session at 180 counted minutes, stretch by stretch in time order, and never credits more than was counted", () => {
    expect(dayScoreSql).toContain("least(len, 10800 - coalesce(sum(len) over (order by s rows between unbounded preceding and 1 preceding), 0))")
    expect(dayScoreSql).toContain("least((select credit from totals), least(p_active, 10800)::numeric)")
    expect(dayScoreSql).toContain("greatest(0, p_active - 10800)::numeric")
  })

  it("makes a stretch end where the last pause begins when that pause is the stop alert at the end", () => {
    expect(dayScoreSql).toContain("select a.pt, p_ended from pz a where a.n = a.total and a.pt < p_ended")
  })

  it("takes the usual from the middle of exactly 7 earlier days, and the stand-in 60 minutes otherwise", () => {
    expect(dayScoreSql).toContain("when cardinality(p_recent) = 7")
    expect(dayScoreSql).toContain("order by v offset 3 limit 1")
    expect(dayScoreSql).toContain("else 3600")
    expect(dayScoreSql).toContain("where user_id = (select auth.uid()) and day < p_day")
    expect(dayScoreSql).toContain("limit 7")
  })

  it("chooses the word of a day from the exact seconds with the edges 50%, 80%, 120% and 150%", () => {
    expect(dayScoreSql).toContain("when p_sessions = 0 then 'NO SESSION'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 2 < p_usual_seconds then 'LIGHT'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 5 < p_usual_seconds * 4 then 'BELOW USUAL'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 5 < p_usual_seconds * 6 then 'USUAL'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 2 < p_usual_seconds * 3 then 'ABOVE USUAL'")
    expect(dayScoreSql).toContain("else 'BIG'")
  })

  it("counts a session under 10 minutes as short, for the readout only", () => {
    expect(dayScoreSql).toContain("count(*) filter (where active_seconds < 600)")
  })

  it("answers with the twelve keys, and says 0 unconfirmed minutes until unconfirmed sessions are built", () => {
    for (const key of [
      "day",
      "credited_minutes",
      "word",
      "usual_minutes",
      "usual_is_stand_in",
      "sessions",
      "short_sessions",
      "longest_stretch_minutes",
      "counted_minutes",
      "counted_over_elapsed",
      "unconfirmed_minutes",
      "over_cap_minutes",
    ]) {
      expect(dayScoreSql).toContain("'" + key + "',")
    }
    expect(dayScoreSql).toContain("'unconfirmed_minutes', 0,")
  })
})

describe("the day score verify file (Packet 09B)", () => {
  it("has 19 rows and says so", () => {
    expect(dayScoreVerifySql).toContain("Expected result: 19 rows.")
    expect(dayScoreVerifySql.match(/^select '/gm)).toHaveLength(19)
    expect(dayScoreVerifySql.match(/^union all$/gm)).toHaveLength(18)
  })

  it("carries the worked days of the decisions file, in seconds", () => {
    for (const expected of ["'3300.000'", "'2833.333'", "'4533.333'", "'1380.000'", "'5400.000'", "'1650.000'", "'483.333'", "'10800.000'", "'3600.000'"]) {
      expect(dayScoreVerifySql).toContain(expected)
    }
    expect(dayScoreVerifySql).toContain("'ABOVE USUAL|USUAL|BELOW USUAL|LIGHT|BIG|LIGHT'")
    expect(dayScoreVerifySql).toContain("'LIGHT|BELOW USUAL|BELOW USUAL|USUAL|USUAL|ABOVE USUAL|ABOVE USUAL|BIG'")
  })
})
// AB:TIMER.TESTS:END
