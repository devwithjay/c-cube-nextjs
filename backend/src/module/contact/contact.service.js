import {
  createContactMessage,
  findAllContacts,
  findContactById
} from "./contact.repository.js";


/*
|--------------------------------------------------------------------------
| Create message
|--------------------------------------------------------------------------
*/

export async function submitContactMessage(
  data
) {

  return createContactMessage(
    data
  );

}


/*
|--------------------------------------------------------------------------
| Get all messages
|--------------------------------------------------------------------------
|
| This will eventually be ADMIN ONLY.
|
*/

export async function getAllContacts() {

  return findAllContacts();

}


/*
|--------------------------------------------------------------------------
| Get message by ID
|--------------------------------------------------------------------------
|
| This will eventually be ADMIN ONLY.
|
*/

export async function getContactById(
  contactId
) {

  const contact =
    await findContactById(
      contactId
    );


  if (!contact) {

    const error =
      new Error(
        "Contact message not found"
      );

    error.statusCode = 404;

    throw error;

  }


  return contact;

}