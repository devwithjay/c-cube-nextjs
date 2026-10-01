import {
  get,
  all
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Get all published events
|--------------------------------------------------------------------------
*/

export async function findPublishedEvents() {

  return all(
    `
    SELECT

      id,

      date_text,

      short_date,

      title,

      description,

      objective,

      accent,

      image_url,

      sort_order,

      created_at,

      updated_at

    FROM events

    WHERE is_published = 1

    ORDER BY
      sort_order ASC,
      id ASC
    `
  );

}


export async function findPublishedEventsWithGlimpses() {

  return all(
    `
    SELECT
      e.id,
      e.date_text,
      e.short_date,
      e.title,
      e.description,
      e.objective,
      e.accent,
      e.image_url,
      e.sort_order,
      e.created_at,
      e.updated_at,
      g.id AS glimpse_id,
      g.image_url AS glimpse_image_url,
      g.sort_order AS glimpse_sort_order
    FROM events e
    LEFT JOIN event_glimpses g
      ON g.event_id = e.id
    WHERE e.is_published = 1
    ORDER BY
      e.sort_order ASC,
      e.id ASC,
      g.sort_order ASC,
      g.id ASC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get one published event
|--------------------------------------------------------------------------
*/

export async function findPublishedEventById(
  eventId
) {

  return get(
    `
    SELECT

      id,

      date_text,

      short_date,

      title,

      description,

      objective,

      accent,

      image_url,

      sort_order,

      created_at,

      updated_at

    FROM events

    WHERE id = ?

    AND is_published = 1
    `,

    [eventId]
  );

}


/*
|--------------------------------------------------------------------------
| Get event glimpses
|--------------------------------------------------------------------------
*/

export async function findEventGlimpses(
  eventId
) {

  return all(
    `
    SELECT

      id,

      image_url,

      sort_order

    FROM event_glimpses

    WHERE event_id = ?

    ORDER BY
      sort_order ASC,
      id ASC
    `,

    [eventId]
  );

}