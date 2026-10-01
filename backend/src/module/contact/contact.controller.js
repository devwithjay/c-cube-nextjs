import {
  contactSchema
} from "./contact.validation.js";


import {
  submitContactMessage,
  getAllContacts,
  getContactById
} from "./contact.service.js";


/*
|--------------------------------------------------------------------------
| POST /api/contact
|--------------------------------------------------------------------------
*/

export async function createContact(
  req,
  res,
  next
) {

  try {

    const validation =
      contactSchema.safeParse(
        req.body
      );


    if (!validation.success) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid contact form data",

          errors:
            validation.error.issues.map(
              issue => ({
                field:
                  issue.path.join("."),
                message:
                  issue.message
              })
            )

        });

    }


    const contact =
      await submitContactMessage(
        validation.data
      );


    res
      .status(201)
      .json({

        success: true,

        message:
          "Your message has been received successfully.",

        data: {

          id:
            contact.id,

          createdAt:
            contact.created_at

        }

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/contact
|--------------------------------------------------------------------------
|
| Later: ADMIN ONLY
|
*/

export async function getContacts(
  req,
  res,
  next
) {

  try {

    const contacts =
      await getAllContacts();


    res.status(200).json({

      success: true,

      count:
        contacts.length,

      data:
        contacts

    });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/contact/:id
|--------------------------------------------------------------------------
|
| Later: ADMIN ONLY
|
*/

export async function getContact(
  req,
  res,
  next
) {

  try {

    const contactId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        contactId
      ) ||
      contactId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid contact ID"

        });

    }


    const contact =
      await getContactById(
        contactId
      );


    res.status(200).json({

      success: true,

      data:
        contact

    });

  }
  catch (error) {

    next(error);

  }

}