
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _roles text[];
  _role text;
BEGIN
  _full_name := NEW.raw_user_meta_data ->> 'full_name';
  _roles := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data ->> 'roles')::json));

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, _full_name);

  FOREACH _role IN ARRAY _roles
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
