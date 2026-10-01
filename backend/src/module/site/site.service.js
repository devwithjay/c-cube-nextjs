import { env } from "../../config/env.js";
import {
  CACHE_KEYS,
  cacheGetOrSet
} from "../../utils/cache.js";

import { getClubInformation } from "../club/club.service.js";
import { getAllEvents } from "../events/events.service.js";
import { getAllTeamMembers } from "../team/team.service.js";

export async function getPublicSite() {
  const ttlMs = env.siteCacheTtlSeconds * 1000;

  return cacheGetOrSet(
    CACHE_KEYS.site,
    ttlMs,
    async () => {
      const [club, events, team] = await Promise.all([
        getClubInformation(),
        getAllEvents(),
        getAllTeamMembers()
      ]);

      return { club, events, team };
    }
  );
}
