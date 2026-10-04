import { createClient } from "@supabase/supabase-js"

// AB:AUTH.CLIENT:START
// The one connection to Supabase. The three settings come from the file .env (it is never committed to git).
// The rule that turns a User ID into an email is linked to the user created in the Supabase dashboard (see CONNECTIONS.md).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const emailTemplate = import.meta.env.VITE_LOGIN_EMAIL_TEMPLATE as string | undefined

export const authReady = Boolean(
  url &&
    url.startsWith("https://") &&
    key &&
    !key.includes("PASTE") &&
    emailTemplate &&
    emailTemplate.includes("{id}") &&
    emailTemplate.includes("@")
)

export const supabase = authReady ? createClient(url as string, key as string) : null

export function userIdToEmail(userId: string): string | null {
  const id = userId.trim().toLowerCase()
  if (!/^[a-z0-9]{2,20}$/.test(id)) return null
  if (!emailTemplate) return null
  return emailTemplate.replace("{id}", id)
}
// AB:AUTH.CLIENT:END
