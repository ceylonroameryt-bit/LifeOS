import "server-only";

export type OwnerAccess =
  "allowed" | "configuration" | "authentication" | "access";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The owner identifier is read only on the server, never from browser input. */
export function ownerId(): string | null {
  const value = process.env.LIFEOS_OWNER_ID?.trim();
  return value && uuid.test(value) ? value.toLowerCase() : null;
}

/** Call with a user returned by auth.getUser(), rather than a decoded session. */
export function ownerAccess(user: { id: string } | null): OwnerAccess {
  const owner = ownerId();
  if (!owner) return "configuration";
  if (!user) return "authentication";
  return user.id.toLowerCase() === owner ? "allowed" : "access";
}
