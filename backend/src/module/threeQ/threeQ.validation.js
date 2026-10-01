import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Allowed Branches
|--------------------------------------------------------------------------
*/

export const BRANCHES = [
  "Computer Engineering",

  "Information Technology",

  "Computer Science & Engineering (AI)",

  "Computer Science & Engineering (AIML)",

  "Artificial Intelligence and Data Science",

  "Computer Engineering (Software Engineering)",

  "Computer Science & Engineering (DS)",

  "Computer Science & Engineering (IoT & Cybersecurity including Blockchain Technology)",

  "Electronics & Tele Communication Engineering",

  "Instrumentation & Control Engineering",

  "Mechanical Engineering",

  "Civil Engineering"
];


/*
|--------------------------------------------------------------------------
| Allowed Divisions
|--------------------------------------------------------------------------
*/

export const DIVISIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L"
];


/*
|--------------------------------------------------------------------------
| Allowed Campuses
|--------------------------------------------------------------------------
*/

export const CAMPUSES = [
  "VIT Bibwewadi",
  "VIT Kondhwa"
];


/*
|--------------------------------------------------------------------------
| Allowed Living Options
|--------------------------------------------------------------------------
*/

export const LIVING_OPTIONS = [
  "Hostel",
  "PG/flat",
  "Native"
];


/*
|--------------------------------------------------------------------------
| Start Test Schema
|--------------------------------------------------------------------------
*/

export const startTestSchema = z.object({

  /*
  |--------------------------------------------------------------------------
  | Student Name
  |--------------------------------------------------------------------------
  */

  name:
    z.string()
      .trim()
      .min(
        2,
        "Name must contain at least 2 characters"
      )
      .max(
        100,
        "Name cannot exceed 100 characters"
      ),


  /*
  |--------------------------------------------------------------------------
  | Branch
  |--------------------------------------------------------------------------
  */

  branch:
    z.enum(
      BRANCHES,
      {
        error:
          "Please select a valid branch"
      }
    ),


  /*
  |--------------------------------------------------------------------------
  | Division
  |--------------------------------------------------------------------------
  */

  division:
    z.enum(
      DIVISIONS,
      {
        error:
          "Please select a valid division"
      }
    ),


  /*
  |--------------------------------------------------------------------------
  | PRN
  |--------------------------------------------------------------------------
  */

  prn:
    z.string()
      .trim()
      .min(
        3,
        "Invalid PRN"
      )
      .max(
        30,
        "PRN cannot exceed 30 characters"
      )
      .transform(
        value =>
          value.toUpperCase()
      ),


  /*
  |--------------------------------------------------------------------------
  | College Email
  |--------------------------------------------------------------------------
  */

  collegeEmail:
    z.string()
      .trim()
      .toLowerCase()
      .email(
        "Please enter a valid email address"
      )
      .refine(
        email =>
          email.endsWith("@vit.edu"),
        {
          message:
            "Only official @vit.edu email addresses are allowed"
        }
      ),


  /*
  |--------------------------------------------------------------------------
  | Mobile Number
  |--------------------------------------------------------------------------
  */

  mobileNumber:
    z.string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit mobile number"
      ),


  /*
  |--------------------------------------------------------------------------
  | Campus
  |--------------------------------------------------------------------------
  */

  campus:
    z.enum(
      CAMPUSES,
      {
        error:
          "Please select a valid campus"
      }
    ),


  /*
  |--------------------------------------------------------------------------
  | Living At
  |--------------------------------------------------------------------------
  */

  livingAt:
    z.enum(
      LIVING_OPTIONS,
      {
        error:
          "Please select a valid living option"
      }
    )

});


/*
|--------------------------------------------------------------------------
| Export Individual Validation Constants
|--------------------------------------------------------------------------
*/

export const VALID_BRANCHES = BRANCHES;

export const VALID_DIVISIONS = DIVISIONS;

export const VALID_CAMPUSES = CAMPUSES;

export const VALID_LIVING_OPTIONS = LIVING_OPTIONS;