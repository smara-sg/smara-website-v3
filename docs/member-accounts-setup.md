# SMARA member accounts — draft, not activated

Prepared 25 November 2026. Existing public sample camera and the owner's Basic-auth working page remain separate from customer accounts. No production account database or provider application has been created, no migrations have been applied, and no purchases have been granted. This draft must not be presented as working live authentication.

## Included

- `/account/`: email/password registration, confirmation, login, reset, recovery, sign-out; Google and Facebook OAuth appear only when enabled in configuration.
- `/my-filters/`: private collection read from verified server-side access grants.
- `/my-filters/camera/?filter=moonlit-mandala` and `mountain-mandala`: account and entitlement check before mounting the existing camera; backing MP4s are protected again at the edge.
- Cookie bridge: Supabase verifies the access token before an HttpOnly, Secure, host-only, SameSite=Lax cookie is set. POST/DELETE require the exact SMARA Origin. JWT expiry limits cookie duration; auth refresh events update the cookie.
- No browser insert/update permission on purchase grants. Database row policies limit customers to their own unexpired, unrevoked filters. Server reads also explicitly scope by verified user ID. Owner working tools remain owner-only even for paid customers.
- Auth SDK is a separate lazy chunk. AR video originals stay on existing hosting, not in Supabase storage.

## Required owner setup before activation

1. Create or select a Supabase **Free** project, preferably in Singapore. Creating the account, accepting terms and entering database credentials must be completed by the owner. Do not commit any credentials.
2. Run `supabase/migrations/202611250001_member_filter_access.sql` in its SQL editor. Confirm RLS is enabled and that anonymous/authenticated users cannot insert, update or delete grants.
3. Set Supabase Auth Site URL to `https://smara.online`; allow `https://smara.online/account/` as the callback URL. Preserve the callback query string. Enable email confirmation. Set minimum password length to at least 10 on the server too.
4. Configure custom SMTP, e.g. the existing Resend service and a verified `smara.online` sender. Supabase's default sender is only for testing and cannot deliver public sign-ups. Test confirmations and password recovery to an external address.
5. Google: create an OAuth web client in the owner's Google Cloud project; use the project's exact Supabase `/auth/v1/callback` URL. Enable the provider in Supabase with its client ID and secret. Publish the Google consent configuration for the intended audience. Request only basic identity/email scope.
6. Facebook: configure a Facebook Login application in the owner's Meta developer account, with the exact Supabase callback. Supply required public privacy/data-deletion information and complete any Meta requirements for a live application. Add its app ID and app secret in Supabase. Instagram is not equivalent to Facebook identity login.
7. Set these variables in Netlify (Functions **and Edge Functions** scopes): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `AUTH_GOOGLE_ENABLED=true`, `AUTH_FACEBOOK_ENABLED=true`. Provider flags must remain false until actually working. Use a public publishable/legacy anon key, never a secret/service-role key. Provider secrets belong only in Supabase provider settings. No service-role key is needed by this website for login or reading grants.
8. Verify the build/deploy against this branch in a controlled environment. The session endpoint currently allows production Origin `https://smara.online`; local layout previews deliberately cannot create real media sessions.

## Required real-project validation

Create two test accounts. Grant only account A one filter in the owner's database. A must see/open that filter, and B must receive no rows and be denied direct MP4 access even with A's shared URL. Verify anonymous requests, revoked grants, expired grants, expired sessions, login refresh, sign-out, Range requests, Google, Facebook, email confirmation, and password recovery. Automated mocks validate failure handling but cannot prove a project's live RLS/provider/SMTP settings.

## Purchase integration remains separate

No checkout is active yet. Connect verified payment-provider webhooks only after products/prices are decided. Associate each purchase with a verified SMARA user ID, verify webhook authenticity, make grants idempotent, and handle refunds/revocations server-side. Do not trust customer-supplied filter slugs or a successful-return URL as proof of payment. Waterfall is only a static placeholder; do not sell working access until its camera/video exists. Before activation, establish the store's privacy, refund, access-duration and account-deletion practices.

## Plan limits checked

Supabase Free includes 50,000 monthly active users and a 500 MB database. Free projects pause after one week of inactivity. Video-hosting bandwidth still belongs to the existing website plan. SMTP and payment providers have their own quotas/fees. Do not upgrade or enable paid add-ons without the owner's approval.

References: https://supabase.com/pricing ; https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/docs/guides/auth/social-sign-in/auth-google ; https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook
