import { InfraiClient } from "./infrai_client.ts";
import { requestMagicLink, sendSubscriberUpdate } from "./magic_link_service.ts";

const email = process.argv[2] ?? "creator@example.com";
const infrai = new InfraiClient();
const link = await requestMagicLink(infrai, { email, returnTo: "https://creator.example/sign-in" });
const updateId = await sendSubscriberUpdate(infrai, email, "studio-notes.pdf");
console.log(JSON.stringify({ signIn: link.status, signInMessageId: link.messageId, updateMessageId: updateId }, null, 2));
