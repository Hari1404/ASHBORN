-- ASHBORN Pro Timer: check that the database was set up. Run in the Supabase SQL Editor AFTER timer_schema.sql.
-- Expected result: 5 rows, exactly as the "expect" column says.
select 'tables_exist' as check_name, (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('timer_sessions', 'timer_running'))::text as result, '2' as expect
union all
select 'row_level_security_on', (select count(*) from pg_tables where schemaname = 'public' and tablename in ('timer_sessions', 'timer_running') and rowsecurity)::text, '2'
union all
select 'functions_exist', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_cap_at', 'timer_row_json', 'timer_state', 'timer_day_total', 'timer_start', 'timer_pause', 'timer_resume', 'timer_end'))::text, '8'
union all
select 'anonymous_can_start', has_function_privilege('anon', 'public.timer_start(text)', 'execute')::text, 'false'
union all
select 'signed_in_can_start', has_function_privilege('authenticated', 'public.timer_start(text)', 'execute')::text, 'true';
