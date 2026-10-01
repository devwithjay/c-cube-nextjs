import {
  all,
  get
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Get all published gallery items
|--------------------------------------------------------------------------
*/

export async function findPublishedGallery() {

  return all(
    `
    SELECT
      id,
      title,
      image_url,
      event_id,
      caption,
      sort_order,
      created_at

    FROM gallery

    WHERE is_published = 1

    ORDER BY
      sort_order ASC,
      id ASC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get gallery item by ID
|--------------------------------------------------------------------------
*/

export async function findGalleryById(
  galleryId
) {

  return get(
    `
    SELECT
      id,
      title,
      image_url,
      event_id,
      caption,
      sort_order,
      created_at

    FROM gallery

    WHERE id = ?

    AND is_published = 1
    `,
    [galleryId]
  );

}


/*
|--------------------------------------------------------------------------
| Get gallery by event
|--------------------------------------------------------------------------
*/

export async function findGalleryByEventId(
  eventId
) {

  return all(
    `
    SELECT
      id,
      title,
      image_url,
      event_id,
      caption,
      sort_order,
      created_at

    FROM gallery

    WHERE event_id = ?

    AND is_published = 1

    ORDER BY
      sort_order ASC,
      id ASC
    `,
    [eventId]
  );

}