/**
 * Ex5 Best2Watch
 * Aviv Eldad
 * This file is the routes file. Routes every request to the method and function
 */

const express = require("express"),
  mediaRoutes = require("./media"),
  { body } = require("express-validator");

let router = express.Router();

router.get("/media", mediaRoutes.read_media);
router.get("/media/:id", mediaRoutes.read_media_id);
router.post(
  "/media",
  body("id").notEmpty().isAlphanumeric(),
  body("name").notEmpty().isAlphanumeric("en-US", { ignore: " -:,'\"" }),
  body("picture").notEmpty().isURL(),
  body("director").notEmpty().isAlpha("en-US", { ignore: " -" }),
  body("date").notEmpty(),
  body("rating").notEmpty().isInt({ min: 1, max: 5 }),
  body("isSeries").notEmpty().isBoolean(),
  body("seriesDetails")
    .if((value, { req }) => {
      return req.body.isSeries;
    })
    .notEmpty(),
  mediaRoutes.create_media
);
router.put("/media/:id", mediaRoutes.update_media);
router.delete("/media/:id", mediaRoutes.delete_media);
router.post(
  "/actors",
  body("name").notEmpty().isAlpha("en-US", { ignore: " -" }),
  body("picture").notEmpty().isURL(),
  body("site").notEmpty().isURL(),
  mediaRoutes.create_actor
);
router.get("/actors", mediaRoutes.read_actors);
router.get("/actors/:_id", mediaRoutes.read_actor_id);
router.put("/media/:id/actors", mediaRoutes.add_actor_to_media);
router.delete("/media/:id/actors/:_id", mediaRoutes.delete_actor);

module.exports = router;
