import {
  findPublishedGallery,
  findGalleryById,
  findGalleryByEventId
} from "./gallery.repository.js";


/*
|--------------------------------------------------------------------------
| Convert DB record into API format
|--------------------------------------------------------------------------
*/

function mapGalleryItem(
  item
) {

  return {

    id:
      item.id,

    title:
      item.title,

    image:
      item.image_url,

    eventId:
      item.event_id,

    caption:
      item.caption,

    sortOrder:
      item.sort_order,

    createdAt:
      item.created_at

  };

}


/*
|--------------------------------------------------------------------------
| Get all gallery items
|--------------------------------------------------------------------------
*/

export async function getGallery() {

  const items =
    await findPublishedGallery();


  return items.map(
    mapGalleryItem
  );

}


/*
|--------------------------------------------------------------------------
| Get one gallery item
|--------------------------------------------------------------------------
*/

export async function getGalleryItem(
  galleryId
) {

  const item =
    await findGalleryById(
      galleryId
    );


  if (!item) {

    const error =
      new Error(
        "Gallery item not found"
      );

    error.statusCode = 404;

    throw error;

  }


  return mapGalleryItem(
    item
  );

}


/*
|--------------------------------------------------------------------------
| Get gallery for an event
|--------------------------------------------------------------------------
*/

export async function getEventGallery(
  eventId
) {

  const items =
    await findGalleryByEventId(
      eventId
    );


  return items.map(
    mapGalleryItem
  );

}