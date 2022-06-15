/**
 * Ex5 Best2Watch
 * Aviv Eldad
 * This file is the logic file of the server.
 */

const { validationResult } = require("express-validator"),
  Media = require("../models/medias"),
  Actor = require("../models/actors");

/**
 * The function sort a JSON object by the date field in every item, in descending order
 * @param {} data The JSON object that holsd all the information
 * @returns String of the JSON that sort by date in descending order
 */
function sortByDate(data) {
  var sort_array = [];
  for (let media in data) {
    sort_array.push(data[media]);
  }
  sort_array.sort(function (a, b) {
    let splitedA = a.date.split("-");
    let splitedB = b.date.split("-");
    let aDate = new Date(+splitedA[0], splitedA[1] - 1, +splitedA[2]);
    let bDate = new Date(+splitedB[0], splitedB[1] - 1, +splitedB[2]);

    if (aDate > bDate) return -1;
    else if (bDate > aDate) return 1;
    return 0;
  });

  return JSON.stringify(sort_array);
}

module.exports = {
  /**
   * The function handle GET request for all the media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   * @returns send a json that sorted by date. if there isnt media, return empty json
   */
  read_media: function (req, res) {
    Media.find()
      .then((medias) =>
        res
          .status(200)
          .send(medias ? JSON.parse(sortByDate(medias)) : JSON.parse("{}"))
      )
      .catch((e) => res.status(500).send(e));
  },
  /**
   * The function handle GET request for a specific media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   * @returns the specific media id
   */
  read_media_id: function (req, res) {
    Media.findOne({ id: req.params["id"] })
      .then((media) => {
        if (media !== null) {
          res.status(200).send(media);
        } else {
          res.status(400).send("media doesn't exist");
        }
      })
      .catch((e) => res.status(400).send(e));
  },

  /**
   * The function handle POST request to create new media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  create_media: async function (req, res) {
    //check for errors that happend in the fields of the request, by the parameters that decided in the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //check if media is not already exist
    let exist = await Media.exists({ id: req.body.id });
    if (exist) {
      return res.status(400).send("media already exist");
    }

    //If media is series, checks the validation of details
    if (String(req.body.isSeries) === "true") {
      if (req.body.seriesDetails.length === 0) {
        return res.status(400).send("bad request");
      }
      for (let i = 0; i < req.body.seriesDetails.length; i++) {
        if (isNaN(req.body.seriesDetails[i])) {
          return res.status(400).send("bad request");
        }
      }
    }

    const media = new Media(req.body);
    media
      .save()
      .then((media) => {
        console.log(`media ${media.id} saved to the DB`);
        res.status(201).send("new media added");
      })
      .catch((e) => {
        res.status(400).send(e);
      });
  },

  /**
   * The function handle PUT request to update media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  update_media: function (req, res) {
    const mediaId = req.params["id"];
    Media.findOne({ id: mediaId })
      .then((media) => {
        if (media === null) {
          res.status(400).send("media doesn't exist");
        } else {
          //check if id in request
          if (req.body.id) {
            return res.status(400).send("cannot change ID");
          }
          //check if name is need to be updated
          if (req.body.name) {
            if (
              req.body.name.length === 0 ||
              !/^[A-Za-z0-9-:'"\s]*$/.test(req.body.name)
            )
              return res.status(400).send("bad request - name");
          }
          //check if director is need to be updated
          if (req.body.director) {
            if (
              req.body.director.length === 0 ||
              !/^[A-Za-z\s-]*$/.test(req.body.director)
            )
              return res.status(400).send("bad request - director");
          }
          //check if picture is need to be updated
          if (req.body.picture) {
            const matchpattern = /\.(jpeg|jpg|gif|png)$/;
            if (
              req.body.picture.length === 0 ||
              (!matchpattern.test(req.body.picture) &&
                !req.body.picture.startsWith("data:image"))
            )
              return res.status(400).send("bad request - picture");
          }
          //check if date is need to be updated
          if (req.body.date) {
            if (req.body.date.length === 0)
              return res.status(400).send("bad request - date");
          }
          if (req.body.rating) {
            if (
              isNaN(req.body.rating) ||
              !(req.body.rating >= 1 && req.body.rating <= 5)
            )
              return res.status(400).send("bad request - rating");
          }
          //check if series is need to be updated
          if (req.body.hasOwnProperty("isSeries")) {
            const isSeries = String(req.body.isSeries);
            if (isSeries === "true" || isSeries === "false") {
              if (req.body.seriesDetails) {
                if (req.body.seriesDetails.length === 0) {
                  return res.status(400).send("bad request");
                }
                for (let i = 0; i < req.body.seriesDetails.length; i++) {
                  if (isNaN(req.body.seriesDetails[i])) {
                    return res.status(400).send("bad request");
                  }
                }
              } else {
                Media.updateOne({ id: mediaId }, { seriesDetails: null });
              }
            } else {
              return res.status(400).send("bad request");
            }
          }
          Media.findOneAndUpdate({ id: mediaId }, req.body)
            .then((media) => {
              if (!media) {
                return res.status(404).send();
              } else {
                res.status(200).send("media updated");
              }
            })
            .catch((e) => res.status(400).send(e));
        }
      })
      .catch((e) => res.status(400).send(e));
  },

  /**
   * The function handle DELETE request to delete media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  delete_media: function (req, res) {
    const mediaId = req.params["id"];
    Media.findOne({ id: mediaId })
      .then((media) => {
        if (media === null) {
          res.status(400).send("media doesn't exist");
        } else {
          Media.findOneAndDelete({ id: mediaId })
            .then((media) => {
              if (!media) {
                return res.status(404).send();
              } else {
                res.status(200).send("media deleted");
              }
            })
            .catch((e) => res.status(400).send(e));
        }
      })
      .catch((e) => res.status(400).send(e));
  },

  /**
   * The function handle POST request to add actor
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  create_actor: async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //check if actor is not already exist
    let exist = await Actor.exists({ name: req.body.name });
    if (exist) {
      return res.status(400).send("actor already exist");
    }

    const actor = new Actor(req.body);
    actor
      .save()
      .then((actor) => {
        console.log(`actor ${actor.name} saved to the DB`);
        res.status(201).send("new actor added");
      })
      .catch((e) => {
        res.status(400).send(e);
      });
  },

  /**
   * The function handle GET request for all the actors
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   * @returns send a json. if there isnt actors, return empty json
   */
  read_actors: function (req, res) {
    Actor.find()
      .then((actors) => res.status(200).send(actors ? actors : {}))
      .catch((e) => res.status(500).send(e));
  },

    /**
   * The function handle GET request for a specific actor
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   * @returns the specific actor
   */
  read_actor_id: function (req, res){
    Actor.findOne({ _id: req.params["_id"] })
    .then((actor) => {
      if (actor !== null) {
        res.status(200).send(actor);
      } else {
        res.status(400).send("actor doesn't exist");
      }
    })
    .catch((e) => res.status(400).send(e));
  },
  /**
   * The function handle PUT request to add actor to media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  add_actor_to_media: function (req, res) {
    const mediaId = req.params["id"];
    Media.findOne({ id: mediaId })
      .then((media) => {
        if (media === null) {
          res.status(400).send("media doesn't exist");
        } else {
          const actorId = req.body._id;
          if (Object.keys(media.actors).length !== 0) {
            if (Object.values(media.actors).includes(actorId)) {
              res.status(400).send("actor already in media");
            } else {
              Media.findOneAndUpdate(
                { id: mediaId },
                { $push: { actors: actorId } }
              )
                .then((actor) => {
                  if (!actor) {
                    return res.status(404).send();
                  } else {
                    res.status(200).send("actor added to media");
                  }
                })
                .catch((e) => res.status(400).send(e));
            }
          } else {
            Media.findOne({ id: mediaId })
              .updateOne({}, { $set: { actors: [actorId] } })
              .then(res.status(200).send("actor added to media"))
              .catch((e) => res.status(500).send(e));
          }
        }
      })
      .catch((e) => res.status(500).send(e));
  },

  /**
   * The function handle DELETE request to delete actor from media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  delete_actor: function (req, res) {
    const mediaId = req.params["id"];
    Media.findOne({ id: mediaId })
      .then((media) => {
        if (media === null) {
          res.status(400).send("media doesn't exist");
        } else {
          const actorId = req.params["_id"];
          if (Object.keys(media.actors).length === 0) {
            res.status(400).send("the actor not in the media");
          } else if (!Object.values(media.actors).includes(actorId)) {
            res.status(400).send("the actor not in the media");
          } else {
            Media.findOneAndUpdate({ id: mediaId }, { $pull: { actors: actorId } })
              .then((actor) => {
                if (!actor) {
                  return res.status(404).send();
                } else {
                  res.status(200).send("actor deleted");
                }
              })
              .catch((e) => res.status(400).send(e));
          }
        }
      })
      .catch((e) => res.status(500).send(e));
  },
};
