import {
  get,
  run
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Find admin by email
|--------------------------------------------------------------------------
*/

export async function findAdminByEmail(
  email
) {

  return get(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active,
      last_login_at,
      created_at,
      updated_at

    FROM admin_users

    WHERE email = ?

    LIMIT 1
    `,
    [email]
  );

}


/*
|--------------------------------------------------------------------------
| Find admin by ID
|--------------------------------------------------------------------------
*/

export async function findAdminById(
  adminId
) {

  return get(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active,
      last_login_at,
      created_at,
      updated_at

    FROM admin_users

    WHERE id = ?

    LIMIT 1
    `,
    [adminId]
  );

}


/*
|--------------------------------------------------------------------------
| Create admin
|--------------------------------------------------------------------------
*/

export async function createAdmin(
  admin
) {

  const result =
    await run(
      `
      INSERT INTO admin_users
      (
        name,
        email,
        password_hash,
        role
      )

      VALUES (?, ?, ?, ?)
      `,
      [
        admin.name,
        admin.email,
        admin.passwordHash,
        admin.role
      ]
    );


  return findAdminById(
    result.id
  );

}


/*
|--------------------------------------------------------------------------
| Update last login
|--------------------------------------------------------------------------
*/

export async function updateAdminLastLogin(
  adminId
) {

  await run(
    `
    UPDATE admin_users

    SET
      last_login_at =
        CURRENT_TIMESTAMP,

      updated_at =
        CURRENT_TIMESTAMP

    WHERE id = ?
    `,
    [adminId]
  );

  return findAdminById(
    adminId
  );

}


export async function updateAdminPassword(
  adminId,
  passwordHash
) {
  await run(
    `
      UPDATE admin_users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [passwordHash, adminId]
  );

  return findAdminById(
    adminId
  );
}

export async function updateAdminEmail(
  adminId,
  email
) {
  await run(
    `
      UPDATE admin_users
      SET
        email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [email, adminId]
  );

  return findAdminById(
    adminId
  );
}