-- ASHBORN day score (Packet 09B): check that day_score.sql was run. Run in the Supabase SQL Editor AFTER day_score.sql.
-- Expected result: 19 rows. In every row the "result" column must equal the "expect" column.
-- The numbers are the worked days of DECISIONS_DAY_SCORE.md section 7, in seconds (60 minutes = 3600 seconds).
select 'functions_exist' as check_name, (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_session_score', 'timer_usual_seconds', 'timer_day_word', 'timer_day_score'))::text as result, '4' as expect
union all
select 'anonymous_cannot_score', has_function_privilege('anon', 'public.timer_day_score(date)', 'execute')::text, 'false'
union all
select 'signed_in_can_score', has_function_privilege('authenticated', 'public.timer_day_score(date)', 'execute')::text, 'true'
union all
select 'old_session_full_credit', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:20:00+00', 1200, null))::text, '1200.000'
union all
select 'day6_one_2min_pause', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:02:00+00', 3600, '[{"from": "2026-10-01T10:30:00+00:00", "to": "2026-10-01T10:32:00+00:00"}]'::jsonb))::text, '3300.000'
union all
select 'day7_eight_5min_pauses', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:40:00+00', 3600, (select jsonb_agg(jsonb_build_object('from', timestamptz '2026-10-01 10:00:00+00' + make_interval(secs => i * 400 + (i - 1) * 300), 'to', timestamptz '2026-10-01 10:00:00+00' + make_interval(secs => i * 400 + i * 300)) order by i) from generate_series(1, 8) as i)))::text, '2833.333'
union all
select 'day4_four_5min_and_one_60min', round(4 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:05:00+00', 300, '[]'::jsonb)) + (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:00:00+00', 3600, '[]'::jsonb)), 3)::text, '4533.333'
union all
select 'dayB_ten_3min', round(10 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:03:00+00', 180, '[]'::jsonb)), 3)::text, '1380.000'
union all
select 'dayC_two_45min', round(2 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:45:00+00', 2700, '[]'::jsonb)), 3)::text, '5400.000'
union all
select 'dayD_one_30min', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:30:00+00', 1800, '[]'::jsonb))::text, '1650.000'
union all
select 'stop_alert_is_not_a_break', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:15:00+00', 600, '[{"from": "2026-10-01T10:10:00+00:00", "to": "2026-10-01T10:15:00+00:00"}]'::jsonb))::text, '483.333'
union all
select 'cap_credit_4_hours', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 14:00:00+00', 14400, '[]'::jsonb))::text, '10800.000'
union all
select 'cap_over_4_hours', (select round(over_cap_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 14:00:00+00', 14400, '[]'::jsonb))::text, '3600.000'
union all
select 'words_of_the_seven_days', (select string_agg(public.timer_day_word(v, 1, 3600), '|' order by o) from unnest(array[4533.333, 3300, 2833.333, 1380, 5400, 1650]::numeric[]) with ordinality as t(v, o)), 'ABOVE USUAL|USUAL|BELOW USUAL|LIGHT|BIG|LIGHT'
union all
select 'words_at_the_edges', (select string_agg(public.timer_day_word(v, 1, 3600), '|' order by o) from unnest(array[1799.99, 1800, 2879.99, 2880, 4319.99, 4320, 5399.99, 5400]::numeric[]) with ordinality as t(v, o)), 'LIGHT|BELOW USUAL|BELOW USUAL|USUAL|USUAL|ABOVE USUAL|ABOVE USUAL|BIG'
union all
select 'word_no_session', public.timer_day_word(0, 0, 3600), 'NO SESSION'
union all
select 'usual_is_the_middle_of_seven', public.timer_usual_seconds(array[7200, 600, 3000, 3300, 5400, 100, 10800]::numeric[])::text, '3300'
union all
select 'usual_stand_in_under_seven', public.timer_usual_seconds(array[1, 2, 3]::numeric[])::text, '3600'
union all
select 'day_score_runs_without_sign_in', public.timer_day_score(date '2026-10-01') ->> 'word', 'NO SESSION';
