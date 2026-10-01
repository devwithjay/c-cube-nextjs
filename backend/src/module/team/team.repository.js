import {
  get,
  all
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Get active team members
|--------------------------------------------------------------------------
*/

export async function findActiveTeamMembers() {

  return all(
    `
    SELECT

      id,

      name,

      branch,

      year,

      position,

      image_url,

      color,

      intro,

      sort_order

    FROM team_members

    WHERE is_active = 1

    ORDER BY
      sort_order ASC,
      id ASC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get one team member
|--------------------------------------------------------------------------
*/

export async function findActiveTeamMemberById(
  memberId
) {

  return get(
    `
    SELECT

      id,

      name,

      branch,

      year,

      position,

      image_url,

      color,

      intro,

      sort_order

    FROM team_members

    WHERE id = ?

    AND is_active = 1
    `,

    [memberId]
  );

}