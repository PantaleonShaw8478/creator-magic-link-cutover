import assert from "node:assert/strict";
import test from "node:test";
import { InfraiError } from "./infrai_client.ts";
import { requestMagicLink } from "./magic_link_service.ts";

test("invalid creator email is rejected at the request boundary", async () => {
  const client = { request: async () => ({ message_id: "unused" }) } as never;
  await assert.rejects(
    () => requestMagicLink(client, { email: "creator", returnTo: "https://creator.example/sign-in" }),
    (error: unknown) => error instanceof InfraiError && error.status === 400 && error.code === "INVALID_ARGUMENT",
  );
});
