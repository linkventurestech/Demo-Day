-- O Supabase concede EXECUTE ao anon por padrão; o check de admin do Demo Day é só para logados.
revoke execute on function public.demoday_app_is_admin() from anon;
