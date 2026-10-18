-- ASHBORN Pro Timer: check that the database was set up. Run in the Supabase SQL Editor AFTER timer_schema.sql.
-- Expected result: 18 rows, exactly as the "expect" column says.
select 'tables_exist' as check_name, (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('timer_sessions', 'timer_running'))::text as result, '2' as expect
union all
select 'row_level_security_on', (select count(*) from pg_tables where schemaname = 'public' and tablename in ('timer_sessions', 'timer_running') and rowsecurity)::text, '2'
union all
select 'functions_exist', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_cap_at', 'timer_row_json', 'timer_state', 'timer_day_total', 'timer_start', 'timer_pause', 'timer_resume', 'timer_end'))::text, '8'
union all
select 'anonymous_can_start', has_function_privilege('anon', 'public.timer_start(text, uuid)', 'execute')::text, 'false'
union all
select 'signed_in_can_start', has_function_privilege('authenticated', 'public.timer_start(text, uuid)', 'execute')::text, 'true'
union all
select 'pause_log_columns', (select count(*) from information_schema.columns where table_schema = 'public' and ((table_name = 'timer_running' and column_name = 'pauses') or (table_name = 'timer_sessions' and column_name in ('pauses', 'tz'))))::text, '3'
union all
select 'tag_table_with_row_level_security', (select count(*) from pg_tables where schemaname = 'public' and tablename = 'timer_tags' and rowsecurity)::text, '1'
union all
select 'tag_id_columns', (select count(*) from information_schema.columns where table_schema = 'public' and column_name = 'tag_id' and table_name in ('timer_running', 'timer_sessions'))::text, '2'
union all
select 'tag_functions_exist', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_tag_list', 'timer_tag_add', 'timer_tag_rename', 'timer_tag_archive'))::text, '4'
union all
select 'one_start_function', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_start')::text, '1'
union all
select 'anonymous_cannot_add_tag', has_function_privilege('anon', 'public.timer_tag_add(text)', 'execute')::text, 'false'
union all
select 'signed_in_can_add_tag', has_function_privilege('authenticated', 'public.timer_tag_add(text)', 'execute')::text, 'true'
union all
select 'tag_name_unique_among_live_tags', (select count(*) from pg_indexes where schemaname = 'public' and tablename = 'timer_tags' and indexname = 'timer_tags_user_name_live_idx')::text, '1'
union all
select 'row_json_sends_tag', (position('''tag''' in pg_get_functiondef('public.timer_row_json(public.timer_running)'::regprocedure)) > 0)::text, 'true'
union all
select 'tag_use_function_exists', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_tag_use')::text, '1'
union all
select 'anonymous_cannot_read_tag_use', has_function_privilege('anon', 'public.timer_tag_use()', 'execute')::text, 'false'
union all
select 'signed_in_can_read_tag_use', has_function_privilege('authenticated', 'public.timer_tag_use()', 'execute')::text, 'true'
union all
select 'tag_use_answers_a_list', jsonb_typeof(public.timer_tag_use()), 'array';
