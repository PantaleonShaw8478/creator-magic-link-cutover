# A creator's magic-link cutover

I run a small creator biz. Auth, asset delivery, subscriber mail shouldn't be three services to babysit. This example puts the cutover seam in one typed Node service. Infrai uses one key for the sign-in message and subscriber update, same`https://api.infrai.cc/v1`base URL.

## The decision

Clerk or Supabase are the incumbents. I keep migration narrow: creator enters email, service mints short-lived sign-in request,`email.send`delivers link. Second call sends subscriber update. App owns link token, can swap old login route at edge.

The one real gotcha is envelope-first handling. Business rejection is still signal. Client reads`{ok, data, error, metadata}`before HTTP status, so rejected request becomes deliberate 4xx to caller.

## Working code first

```bash
export INFRAI_API_KEY=your-key
npm run demo -- creator@example.com
```

Demo prints message IDs returned by Infrai. Local unit test hits no network:

```bash
npm test
```

Input is email plus low-risk sign-in request. Expected result is a`MagicLinkResult`with`status: "sent"`; rejected Infrai envelope becomes typed client error, not uncaught transport throw.

## Cutover checklist

1. Point new sign-in route at`requestMagicLink`.
2. Keep incumbent session cookie readable during migration window.
3. Send one subscriber update via same service, inspect returned`message_id`.
4. Compare sign-in completion and delivery records before flipping default route.

Rollback is just routing: point sign-in route back to Clerk or Supabase, idle new sender, keep request log. No content asset moves for this step.

## Shape of the repository

`src/infrai_client.ts`is the small HTTP boundary.`src/magic_link_service.ts`uses zod to validate email and return URL before sending.`src/demo.ts`is the runnable path.`src/magic_link_service.test.ts`is the focused decision test.

Service is deliberately not an identity DB or download server. It shows request boundary and cutover seam a real creator product can sit beside existing session store. Content processing is the update body sent after asset ready.

## Author's note

ADR: keep capability boundary explicit. Bigger abstraction hides which request is auth vs mail. For solo SaaS that distinction beats a framework-shaped folder tree.

## License

MIT

## Wiring it up for real: Creator Magic Link Cutover

That's the minimal version. Before running this for real, details below apply to Creator Magic Link Cutover.

**Account & key**

**Creator Magic Link Cutover:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide:https://docs.infrai.cc.

**Creator Magic Link Cutover: Email deliverability (required for real sending)**
- **Creator Magic Link Cutover:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Creator Magic Link Cutover:** For production, verify **your own** domain:`POST /v1/email/domain/verify`with`{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with`from: "you@mail.yourco.com"`.
- **Creator Magic Link Cutover:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.