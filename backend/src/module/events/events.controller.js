import {
  getAllEvents,
  getEventById
} from "./events.service.js";


/*
|--------------------------------------------------------------------------
| GET /api/events
|--------------------------------------------------------------------------
*/

export async function getEvents(
  req,
  res,
  next
) {

  try {

    const events =
      await getAllEvents();


    res.status(200).json({

      success: true,

      count:
        events.length,

      data:
        events

    });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/events/:id
|--------------------------------------------------------------------------
*/

export async function getEvent(
  req,
  res,
  next
) {

  try {

    const eventId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(eventId) ||
      eventId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid event ID"

        });

    }


    const event =
      await getEventById(
        eventId
      );


    res.status(200).json({

      success: true,

      data:
        event

    });

  }
  catch (error) {

    next(error);

  }

}