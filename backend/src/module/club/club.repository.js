import {
  get,
  all
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Get club information
|--------------------------------------------------------------------------
*/

export async function findClub() {

  return get(
    `
    SELECT
      id,
      name,
      full_name,
      campus,
      audience,
      vision,
      mission,
      short_term_goal,
      long_term_goal,
      updated_at

    FROM club_info

    WHERE id = 1
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get club objectives
|--------------------------------------------------------------------------
*/

export async function findObjectives() {

  return all(
    `
    SELECT
      id,
      objective,
      sort_order

    FROM objectives

    ORDER BY
      sort_order ASC,
      id ASC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get faculty mentor
|--------------------------------------------------------------------------
*/

export async function findFacultyMentor() {

  return get(
    `
    SELECT
      id,
      name,
      role,
      department,
      intro,
      image_url,
      updated_at

    FROM faculty_mentor

    WHERE id = 1
    `
  );

}