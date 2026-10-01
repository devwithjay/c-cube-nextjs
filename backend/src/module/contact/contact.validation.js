import { z } from "zod";


export const contactSchema =
  z.object({

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


    email:
      z.string()
        .trim()
        .email(
          "Please provide a valid email address"
        )
        .max(
          150,
          "Email cannot exceed 150 characters"
        ),


    subject:
      z.string()
        .trim()
        .max(
          200,
          "Subject cannot exceed 200 characters"
        )
        .optional()
        .default(""),


    message:
      z.string()
        .trim()
        .min(
          5,
          "Message must contain at least 5 characters"
        )
        .max(
          5000,
          "Message cannot exceed 5000 characters"
        )

  });