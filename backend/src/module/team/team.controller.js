import {
  getAllTeamMembers,
  getTeamMemberById
} from "./team.service.js";


/*
|--------------------------------------------------------------------------
| GET /api/team
|--------------------------------------------------------------------------
*/

export async function getTeam(
  req,
  res,
  next
) {

  try {

    const team =
      await getAllTeamMembers();


    res.status(200).json({

      success: true,

      count:
        team.length,

      data:
        team

    });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/team/:id
|--------------------------------------------------------------------------
*/

export async function getTeamMember(
  req,
  res,
  next
) {

  try {

    const memberId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid team member ID"

        });

    }


    const member =
      await getTeamMemberById(
        memberId
      );


    res.status(200).json({

      success: true,

      data:
        member

    });

  }
  catch (error) {

    next(error);

  }

}