import {
  loginAdmin,
  createInitialAdmin,
  getAuthenticatedAdmin,
  changeAdminPassword,
  changeAdminEmail
} from "./admin.auth.service.js";


/*
|--------------------------------------------------------------------------
| POST /api/admin/auth/login
|--------------------------------------------------------------------------
*/

export async function login(
  req,
  res,
  next
) {

  try {

    const {
      email,
      password
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Basic validation
    |--------------------------------------------------------------------------
    */

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Email and password are required."

        });

    }


    const result =
      await loginAdmin(
        email
          .trim()
          .toLowerCase(),

        password
      );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Admin login successful.",

        data:
          result

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/admin/auth/me
|--------------------------------------------------------------------------
*/

export async function me(
  req,
  res,
  next
) {

  try {

    const admin =
      await getAuthenticatedAdmin(
        req.admin.id
      );


    return res
      .status(200)
      .json({

        success: true,

        data:
          admin

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| POST /api/admin/auth/setup
|--------------------------------------------------------------------------
|
| Temporary initial-admin creation endpoint.
|
| We will lock/remove this after the first admin is created.
|--------------------------------------------------------------------------
*/

export async function setupAdmin(
  req,
  res,
  next
) {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;


    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Name, email and password are required."

        });

    }


    if (
      password.length < 8
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Password must be at least 8 characters long."

        });

    }

    const admin =
      await createInitialAdmin({

        name:
          name.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        password,

        role

      });


    return res
      .status(201)
      .json({

        success: true,

        message:
          "Initial admin created successfully.",

        data:
          admin

      });

  }
  catch (error) {

    next(error);

  }

}


export async function changePassword(
  req,
  res,
  next
) {
  try {
    const adminId = req.admin.id;

    const {
      currentPassword,
      newPassword
    } = req.body;

    await changeAdminPassword(
      adminId,
      currentPassword,
      newPassword
    );

    return res.json({
      success: true,
      message:
        "Password changed successfully."
    });
  } catch (error) {
    next(error);
  }
}

export async function changeEmail(
  req,
  res,
  next
) {
  try {
    const {
      currentPassword,
      newEmail
    } = req.body;

    const result = await changeAdminEmail(
      req.admin.id,
      currentPassword,
      newEmail
    );

    return res.json({
      success: true,
      message: "Email address changed successfully.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}