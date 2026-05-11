insert into public.amcs (name)
values
  ('CAMS'),
  ('KFintech'),
  ('SBI MF'),
  ('ICICI Prudential MF'),
  ('Franklin')
on conflict (name) do nothing;

insert into public.task_types (name, default_sla_hours)
values
  ('SIP Start', 24),
  ('SIP Stop', 24),
  ('SIP Modify', 24),
  ('SIP Pause', 24),
  ('SIP Step-Up', 24),
  ('SWP Setup', 24),
  ('STP Setup', 24),
  ('Redemption', 24),
  ('Nominee Update', 48),
  ('KYC', 48),
  ('Re-KYC', 48),
  ('CKYC Update', 48),
  ('FATCA Update', 48),
  ('Bank Detail Change', 48),
  ('Address Change', 48),
  ('Mobile Email Update', 24),
  ('Transmission Request', 72),
  ('Joint Holder Addition Removal', 72),
  ('Folio Consolidation', 72),
  ('ARN Mapping', 24),
  ('EUIN Correction', 24),
  ('NACH Registration', 48),
  ('Financial Transaction', 24),
  ('Non Financial Transaction', 24)
on conflict (name) do update
set default_sla_hours = excluded.default_sla_hours;
