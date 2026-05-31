import { SessionOptions } from "iron-session";

export interface SessionData {
  nonce?: string;
  address?: string;
  authenticated?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "chainvote_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  },
};
