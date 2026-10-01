import {
  findClub,
  findObjectives,
  findFacultyMentor
} from "./club.repository.js";


export async function getClubInformation() {

  const club =
    await findClub();


  if (!club) {

    const error =
      new Error(
        "Club information not found"
      );

    error.statusCode = 404;

    throw error;

  }


  const objectives =
    await findObjectives();


  const facultyMentor =
    await findFacultyMentor();


  return {

    id:
      club.id,

    name:
      club.name,

    fullName:
      club.full_name,

    campus:
      club.campus,

    audience:
      club.audience,

    vision:
      club.vision,

    mission:
      club.mission,

    shortTermGoal:
      club.short_term_goal,

    longTermGoal:
      club.long_term_goal,

    objectives:
      objectives.map(
        item => ({

          id:
            item.id,

          text:
            item.objective,

          order:
            item.sort_order

        })
      ),

    facultyMentor:
      facultyMentor
        ? {

            id:
              facultyMentor.id,

            name:
              facultyMentor.name,

            role:
              facultyMentor.role,

            department:
              facultyMentor.department,

            intro:
              facultyMentor.intro,

            image:
              facultyMentor.image_url

          }

        : null

  };

}