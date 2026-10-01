import {
  run,
  get,
  all
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Create contact message
|--------------------------------------------------------------------------
*/

export async function createContactMessage(
  contact
) {

  const result =
    await run(
      `
      INSERT INTO contacts
      (
        name,
        email,
        subject,
        message,
        status
      )

      VALUES (?, ?, ?, ?, ?)
      `,

      [
        contact.name,
        contact.email,
        contact.subject,
        contact.message,
        "new"
      ]
    );


  return get(
    `
    SELECT
      id,
      name,
      email,
      subject,
      message,
      status,
      created_at

    FROM contacts

    WHERE id = ?
    `,

    [result.id]
  );

}


/*
|--------------------------------------------------------------------------
| Get all contact messages
|--------------------------------------------------------------------------
*/

export async function findAllContacts() {

  return all(
    `
    SELECT
      id,
      name,
      email,
      subject,
      message,
      status,
      created_at

    FROM contacts

    ORDER BY
      created_at DESC,
      id DESC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Get contact by ID
|--------------------------------------------------------------------------
*/

export async function findContactById(
  contactId
) {

  return get(
    `
    SELECT
      id,
      name,
      email,
      subject,
      message,
      status,
      created_at

    FROM contacts

    WHERE id = ?
    `,

    [contactId]
  );

}