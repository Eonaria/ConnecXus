/**
 * server/utils/init-db.ts
 * Auto seed initial communities if communities table is empty
 */
export async function ensureCommunitiesSeeded() {
  // Disabled: We no longer auto-seed communities when the table is empty
  // so that admins can delete all communities without them respawning.
}
