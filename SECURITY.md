# Admin security

Reference for the admin authentication hardening. **Read the "Required
environment variables" section before the next deploy** — three of these are
fail-closed, meaning admin sign-in stops working until they are set.

## Required environment variables (backend)

Set these on the backend Vercel project.

| Variable | Required | Effect if missing |
| --- | --- | --- |
| `ADMIN_SECURITY_PASSCODE` | **Yes** | **All admin logins are refused** with a 500. Must be at least 6 characters. There is deliberately no default — the old code fell back to a literal value committed in this repo. |
| `JWT_SECRET` | **Yes** | **All token issuing and verification is refused.** Must be at least 16 characters. |
| `CORS_ALLOWED_ORIGINS` | If the frontend is not on a URL already listed in `lib/cors.ts` | Browser calls from an unlisted frontend origin are blocked. Comma-separated, e.g. `https://brothersrealestate.vercel.app,https://www.brothersrealestate.com`. |
| `BREVO_API_KEY` | For alert emails | Lock alerts silently no-op (logged as a warning). Locks still apply. |
| `ADMIN_EMAIL` | Fallback recipient | Only used when a send has no explicit recipient. |
| `ADMIN_SETUP_KEY` | Only to bootstrap the first admin | The setup-key path for creating an admin is disabled. Must be at least 16 characters. |
| `ALLOW_LOGIN_WITHOUT_LOCATION` | No | Recovery flag, see below. Unset (or anything other than `true`) means location is mandatory. |

## Lockout behaviour

Two independent tiers, both **5 wrong attempts → 5 minute lock**, each sending
an alert email to the admin's own address on every lock:

- **Login password** — 5 wrong → account locked 5 minutes + email.
- **Security passcode** — 5 wrong → passcode locked 5 minutes + email.

After a lock expires, the next 5 failures lock again and send **another**
email. Each alert is stamped with a lock number (`#1`, `#2`, …) so repeated
rounds are visibly an attack rather than a typo.

Supporting rules:

- Failures older than **15 minutes** stop counting, so old typos don't
  accumulate into a lock.
- A separate **per-IP throttle** (20 failures / 15 min → 15 min block) covers
  attempts against email addresses that don't exist — the per-account counter
  can't see those, so email spraying was previously unlimited.
- Every attempt, success or failure, is written to login history with the
  server-derived IP, coordinates, and user agent.

The alert email now includes the IP, exact coordinates with a map link, the
device string, the email that was tried, and the lock number.

## Mandatory location

Admin sign-in requires coordinates from the browser Geolocation API. The login
page requests permission on load, blocks the submit button until a fix is
obtained, and explains exactly what to do when permission is denied.

Two things to know:

- **Geolocation only works over HTTPS.** On a plain-HTTP host the API is
  disabled outright and no one can sign in.
- **Accuracy varies.** Phone GPS is metres; desktop positioning comes from
  wifi/IP and is often several kilometres. The recorded accuracy radius is
  shown in the history table and the alert email.
- Coordinates are **self-reported** — someone driving the API directly can
  send any numbers. They are recorded as evidence, not proof; cross-check them
  against the server-derived IP, which a caller cannot forge.

### If you get locked out

Set `ALLOW_LOGIN_WITHOUT_LOCATION=true` on the backend Vercel project and
redeploy. Sign in, fix the underlying permission problem, then **remove the
variable again**.

## What changed and why

| Issue | Fix |
| --- | --- |
| `POST /api/admin/register` had no authorization at all — anyone could create an admin and receive a valid token | Now requires an existing admin's bearer token, or `x-admin-setup-key` matching `ADMIN_SETUP_KEY` |
| `requireAdmin()` fell back to the `User` collection, so any account created through the public `/api/users/signup` was an admin on every protected route | Fallback removed; only ids resolving in the `Admin` collection are accepted |
| The public auth modal logged in as admin on the hardcoded email `admin@gmail.com`, with no passcode and no location | That branch now redirects to the real admin login page |
| CORS middleware reflected any `Origin` back with `Allow-Credentials: true`, letting any website call the API from a logged-in browser. The allow-list in `lib/cors.ts` was dead code | Middleware uses the allow-list; unlisted origins get no CORS headers and preflights are refused |
| `ADMIN_SECURITY_PASSCODE` fell back to a literal `"31082004"` written in the source | Fails closed when unset |
| `location` and `ipAddress` were taken from the request body, so the audit log could be forged | IP comes from proxy headers; coordinates are validated; the client's coarse city string is stored separately and labelled unverified |
| `/api/admin/login-history` hand-rolled its JWT check and accepted any valid token | Uses `requireAdmin` |
| Passcode compared with `===`, leaking length/prefix through timing | Constant-time comparison |
| Lockout counters never expired | 15-minute attempt window |
| Login page logged the attempted email; auth context logged the full response including the freshly issued token | Both removed |
| Admin password minimum was 6 characters | Raised to 12 for newly set passwords |

## Known gaps, not addressed here

- **`seedAdmin.cjs` used to contain a live MongoDB connection string, a
  hardcoded admin email, and the password `123456`.** It now reads
  `MONGO_URI`, `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`
  from the environment and refuses to run without them. **This does not undo
  the exposure** — that credential is still in this repo's git history and
  must be treated as compromised. Rotate the MongoDB Atlas credential and
  change that admin's password if you haven't already.
- Tokens are 7-day JWTs held in `localStorage` with no revocation list; a
  stolen token stays valid until it expires.
- There is no password-reset flow, so the "Forgot Password?" link on the login
  page is inert.
- Lockout state is per-account, so an attacker can still lock a known admin
  out for 5 minutes at a time by failing on purpose.
