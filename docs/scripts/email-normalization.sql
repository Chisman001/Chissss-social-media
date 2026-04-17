-- Run ONCE per environment after deploying code that lowercases emails on register/login.
-- If this fails with a unique violation, resolve duplicate lower(email) rows manually first.

UPDATE "User"
SET email = lower(trim(email))
WHERE email IS NOT NULL;

-- Optional: enforce case-insensitive uniqueness at the DB (coordinate with Prisma @unique on email).
-- CREATE UNIQUE INDEX IF NOT EXISTS "User_email_lower_key" ON "User" (lower(trim(email)));
