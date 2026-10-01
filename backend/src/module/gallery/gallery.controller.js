import {
  getGallery,
  getGalleryItem,
  getEventGallery
} from "./gallery.service.js";


/*
|--------------------------------------------------------------------------
| GET /api/gallery
|--------------------------------------------------------------------------
*/

export async function getGalleryImages(
  req,
  res,
  next
) {

  try {

    const gallery =
      await getGallery();


    res.status(200).json({

      success: true,

      count:
        gallery.length,

      data:
        gallery

    });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/gallery/:id
|--------------------------------------------------------------------------
*/

export async function getGalleryImage(
  req,
  res,
  next
) {

  try {

    const galleryId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        galleryId
      ) ||
      galleryId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid gallery ID"

        });

    }


    const gallery =
      await getGalleryItem(
        galleryId
      );


    res.status(200).json({

      success: true,

      data:
        gallery

    });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/gallery/event/:eventId
|--------------------------------------------------------------------------
*/

export async function getGalleryByEvent(
  req,
  res,
  next
) {

  try {

    const eventId =
      Number(
        req.params.eventId
      );


    if (
      !Number.isInteger(
        eventId
      ) ||
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


    const gallery =
      await getEventGallery(
        eventId
      );


    res.status(200).json({

      success: true,

      count:
        gallery.length,

      data:
        gallery

    });

  }
  catch (error) {

    next(error);

  }

}