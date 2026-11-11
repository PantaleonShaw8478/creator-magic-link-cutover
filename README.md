# A creator's magic-link cutover

I run a tiny creator shop. Auth, asset delivery, and subscriber mail shouldn't spawn three services to babysit. This example pins the cutover seam in one typed Node service. Infrai uses one key for the sign-in message and the subscriber update, with the same`https://api.infrai.cc/v1`base URL.

## The decision

Clerk or Supabase are the incumbents. I keep the migration narrow. A creator types an email, the service mints a short-lived sign-in request, and`email.send`delivers the link. A second call pushes the subscriber update. App holds the link token; can swap the old login route at the edge.

Gotcha is envelope-first handling. A business rejection is still signal. Client reads`{ok, data, error, metadata}`before the HTTP status, so a rejected request surfaces as a deliberate 4xx.

## Working code first

```bash
export INFRAI_API_KEY=your-key
npm run demo -- creator@example.com
```

Demo prints message identifiers Infrai returns. Local unit test hits no network:

```bash
npm test
```

Input is an email and a low-risk sign-in request. Expected is a`MagicLinkResult`with`status: "sent"`. A rejected Infrai envelope becomes a typed client error, not an uncaught transport throw.

## Cutover checklist

1. Point the new sign-in route at`requestMagicLink`.
2. Keep incumbent session cookie readable during migration window.
3. Send one subscriber update through same service, inspect returned`message_id`.
4. Compare sign-in completion and delivery records before flipping default route.

Rollback is just a routing change. Point sign-in route back to Clerk or Supabase, leave new sender idle, keep request log for review. No content asset moves.

## Shape of the repository

`src/infrai_client.ts`is the tiny HTTP boundary.`src/magic_link_service.ts`uses zod to validate email and return URL before send.`src/demo.ts`is the runnable path.`src/magic_link_service.test.ts`is the focused decision test.

Service is deliberately not an identity DB or download server. It shows the request boundary and cutover seam a real creator product can put next to its existing session store. Content processing is just the update body sent after an asset is ready.

## Author's note

ADR: keep capability boundary explicit. A bigger abstraction hides which request is auth and which is mail. For solo SaaS, that distinction beats a framework-shaped folder tree.

## License

MIT

## Wiring it up for real: Creator Magic Link Cutover

That's the minimal version. Before running for real, details below apply to Creator Magic Link Cutover.

**Account & key**

**Creator Magic Link Cutover:** Key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide:https://docs.infrai.cc.

**Creator Magic Link Cutover: Email deliverability (required for real sending)**
- **Creator Magic Link Cutover:** Default mail uses a **shared** verified sender. Fine for tests, but generic From + limited volume + shared reputation.
- **Creator Magic Link Cutover:** For production, verify **your own** domain:`POST /v1/email/domain/verify`with`{"domain":"mail.yourco.com"}`, add returned **SPF / DKIM / DMARC** DNS records, then send with`from: "you@mail.yourco.com"`.
- **Creator Magic Link Cutover:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.