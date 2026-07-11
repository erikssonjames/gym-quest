import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "@/env";

const socketClaimsSchema = z.object({
  sub: z.string().uuid(),
  purpose: z.literal("socket"),
});

export function createSocketToken(userId: string) {
  return jwt.sign(
    { purpose: "socket" },
    env.SERVER_SOCKET_KEY,
    { subject: userId, expiresIn: "10m" },
  );
}

export function verifySocketToken(token: string) {
  const claims = socketClaimsSchema.parse(
    jwt.verify(token, env.SERVER_SOCKET_KEY),
  );
  return claims.sub;
}
