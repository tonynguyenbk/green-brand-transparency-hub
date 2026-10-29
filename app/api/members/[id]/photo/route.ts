import { getMember } from "@/lib/auth/member";
import { getPhoto } from "@/lib/community/profiles";
import { idSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** A member's uploaded photo. Private members' photos are visible only to themselves. */
export async function GET(_req: Request, ctx: RouteContext<"/api/members/[id]/photo">) {
  const id = idSchema.safeParse((await ctx.params).id);
  if (!id.success) return new Response(null, { status: 404 });
  const photo = await getPhoto(id.data);
  if (!photo) return new Response(null, { status: 404 });
  const isPublic = photo.member.isPublic;
  if (!isPublic && (await getMember())?.id !== id.data) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      // URLs carry a ?v=<timestamp>, so a new upload gets a new URL.
      "Cache-Control": isPublic ? "public, max-age=86400" : "private, max-age=3600",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
