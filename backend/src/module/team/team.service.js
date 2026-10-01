import {
  findActiveTeamMembers,
  findActiveTeamMemberById
} from "./team.repository.js";


function mapTeamMember(
  member
) {

  return {

    id:
      member.id,

    name:
      member.name,

    branch:
      member.branch,

    year:
      member.year,

    position:
      member.position,

    image:
      member.image_url,

    color:
      member.color,

    intro:
      member.intro,

    sortOrder:
      member.sort_order

  };

}


/*
|--------------------------------------------------------------------------
| Get all team members
|--------------------------------------------------------------------------
*/

export async function getAllTeamMembers() {

  const members =
    await findActiveTeamMembers();


  return members.map(
    mapTeamMember
  );

}


/*
|--------------------------------------------------------------------------
| Get team member
|--------------------------------------------------------------------------
*/

export async function getTeamMemberById(
  memberId
) {

  const member =
    await findActiveTeamMemberById(
      memberId
    );


  if (!member) {

    const error =
      new Error(
        "Team member not found"
      );

    error.statusCode = 404;

    throw error;

  }


  return mapTeamMember(
    member
  );

}