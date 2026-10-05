import { SCORABLE_STATUSES } from "./config";

/** True when a claim/source status allows the record to affect public scores. */
export function isScorableStatus(status: string): boolean {
  return (SCORABLE_STATUSES as readonly string[]).includes(status);
}
