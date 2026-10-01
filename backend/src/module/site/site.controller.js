import { getPublicSite } from "./site.service.js";

export async function getSite(req, res, next) {
  try {
    const data = await getPublicSite();

    res.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=60"
    );

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}
