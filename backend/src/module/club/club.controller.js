import {
  getClubInformation
} from "./club.service.js";


export async function getClub(
  req,
  res,
  next
) {

  try {

    const club =
      await getClubInformation();


    res.status(200).json({

      success: true,

      data: club

    });

  }
  catch (error) {

    next(error);

  }

}