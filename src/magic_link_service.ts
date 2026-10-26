import { InfraiClient, InfraiError } from "./infrai_client.ts";
import { z } from "zod";

export type MagicLinkInput = { email: string; returnTo: string };
export type MagicLinkResult = { status: "sent"; messageId: string; signInUrl: string };
const magicLinkBody = z.object({ email: z.string().email(), returnTo: z.string().url() });

export async function requestMagicLink(infrai: InfraiClient, input: MagicLinkInput): Promise<MagicLinkResult> {
  const parsed = magicLinkBody.safeParse(input);
  if (!parsed.success) throw new InfraiError("INVALID_ARGUMENT", "email and returnTo must be valid", 400);
  const requestId = crypto.randomUUID();
  const signInUrl = `${parsed.data.returnTo}?request=${encodeURIComponent(requestId)}`;
  const data = await infrai.request<{ message_id: string }>("POST", "/v1/email/send", {
    to: parsed.data.email,
    subject: "Your creator sign-in link",
    body: `Open this link to continue: ${signInUrl}`,
  });
  return { status: "sent", messageId: data.message_id, signInUrl };
}

export async function sendSubscriberUpdate(infrai: InfraiClient, email: string, assetName: string): Promise<string> {
  const data = await infrai.request<{ message_id: string }>("POST", "/v1/email/send", {
    to: email,
    subject: `New asset: ${assetName}`,
    body: `Your new digital asset is ready: ${assetName}`,
  });
  return data.message_id;
}
