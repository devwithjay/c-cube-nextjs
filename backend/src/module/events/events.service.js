import {
  findPublishedEventsWithGlimpses,
  findPublishedEventById,
  findEventGlimpses
} from "./events.repository.js";


/*
|--------------------------------------------------------------------------
| Convert database row → API response
|--------------------------------------------------------------------------
*/

function mapEvent(
  event,
  glimpses = []
) {

  return {

    id:
      event.id,

    date:
      event.date_text,

    shortDate:
      event.short_date,

    title:
      event.title,

    description:
      event.description,

    objective:
      event.objective,

    accent:
      event.accent,

    image:
      event.image_url,

    sortOrder:
      event.sort_order,

    glimpses:
      glimpses.map(
        glimpse => ({
          id:
            glimpse.id,

          image:
            glimpse.image_url,

          sortOrder:
            glimpse.sort_order
        })
      )

  };

}


/*
|--------------------------------------------------------------------------
| Get all events
|--------------------------------------------------------------------------
*/

export async function getAllEvents() {

  const rows =
    await findPublishedEventsWithGlimpses();

  const eventsById = new Map();

  for (const row of rows) {
    let event = eventsById.get(row.id);

    if (!event) {
      event = {
        id: row.id,
        date_text: row.date_text,
        short_date: row.short_date,
        title: row.title,
        description: row.description,
        objective: row.objective,
        accent: row.accent,
        image_url: row.image_url,
        sort_order: row.sort_order,
        glimpses: []
      };

      eventsById.set(row.id, event);
    }

    if (row.glimpse_id) {
      event.glimpses.push({
        id: row.glimpse_id,
        image_url: row.glimpse_image_url,
        sort_order: row.glimpse_sort_order
      });
    }
  }

  return [...eventsById.values()].map((event) =>
    mapEvent(event, event.glimpses)
  );

}


/*
|--------------------------------------------------------------------------
| Get event by ID
|--------------------------------------------------------------------------
*/

export async function getEventById(
  eventId
) {

  const event =
    await findPublishedEventById(
      eventId
    );


  if (!event) {

    const error =
      new Error(
        "Event not found"
      );

    error.statusCode = 404;

    throw error;

  }


  const glimpses =
    await findEventGlimpses(
      event.id
    );


  return mapEvent(
    event,
    glimpses
  );

}