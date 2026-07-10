DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'Diário' OR name = 'DIÁRIO' OR name = 'Diária' OR name = 'DIÁRIA') THEN
    INSERT INTO public.task_categories (name, start_time, end_time) VALUES
      ('DIÁRIO', '05:00:00', '23:00:00');
  END IF;
END $$;
