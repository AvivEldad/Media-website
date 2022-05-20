/**
 * Ex3 Best2Watch
 * Aviv Eldad
 * This file is the logic file of the server.
 */


const fs = require("fs"),
  { validationResult } = require("express-validator");

// variables
const dataPath = "./server/data/media.json";

// helper methods
const readFile = (
  callback,
  returnJson = false,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (!data) data = "{}";
    callback(returnJson ? JSON.parse(data) : data);
  });
};

const writeFile = (
  fileData,
  callback,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) {
      console.log(err);
    }

    callback();
  });
};

/**
 * The function sort a JSON object by the date field in every item, in descending order
 * @param {} data The JSON object that holsd all the information
 * @returns String of the JSON that sort by date in descending order
 */
function sortByDate(data) {
  var sort_array =[];
  let jsonData = JSON.parse(data);
  for (let media in jsonData) {
    sort_array.push(jsonData[media]);
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
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else
        res
          .status(200)
          .send(!data ? JSON.parse("{}") : JSON.parse(sortByDate(data)));
    });
  },
    /**
   * The function handle GET request for a specific media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   * @returns the specific media id
   */
  read_media_id: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (data[mediaId]) {
        res.status(200).send(data[mediaId]);
      } else res.status(400).sendStatus(400);
    }, true);
  },

   /**
   * The function handle POST request to create new media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  create_media: function (req, res) {
    readFile((data) => {
      //check for errors that happend in the fields of the request, by the parameters that decided in the route
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        
        return res.status(400).json({ errors: errors.array() });
      }
      //check if media is not already exist
      if (data[req.body.id]) {
        return res.status(400).send("Media already exist");
      }
      //If media is series, checks the validation of details
      if (req.body.isSeries) {
        if (req.body.series_details.length === 0) {
          
          return res.status(400).send("bad request");
        }
        for (let i = 0; i < req.body.series_details.length; i++) {
          if (isNaN(req.body.series_details[i])) {
            
            return res.status(400).send("bad request");
          }
        }
      }

      data[req.body.id] = req.body;
      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send("new media added");
      });
    }, true);
  },

   /**
   * The function handle PUT request to update media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  update_media: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID not exist");
      }
      //check if id already exist
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
        data[mediaId].name = req.body.name;
      }
      //check if director is need to be updated
      if (req.body.director) {
        if (
          req.body.director.length === 0 ||
          !/^[A-Za-z\s-]*$/.test(req.body.director)
        )
          return res.status(400).send("bad request - director");
        data[mediaId].director = req.body.director;
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
        data[mediaId].picture = req.body.picture;
      }
      //check if date is need to be updated
      if (req.body.date) {
        if (req.body.date.length === 0)
          return res.status(400).send("bad request - date");
        data[mediaId].date = req.body.date;
      }
      if (req.body.rating) {
        if (
          isNaN(req.body.rating) ||
          !(req.body.rating >= 1 && req.body.rating <= 5)
        )
          return res.status(400).send("bad request - rating");
        data[mediaId].rating = req.body.rating;
      }
      //check if series is need to be updated
      if(req.body.hasOwnProperty("isSeries")){
        const isSeries = String(req.body.isSeries);
        if (isSeries === "true" || isSeries === "false") {
          data[mediaId].isSeries = req.body.isSeries;
          if (req.body.series_details) {
            if (req.body.series_details.length === 0) {
              return res.status(400).send("bad request");
            }
            for (let i = 0; i < req.body.series_details.length; i++) {
              if (isNaN(req.body.series_details[i])) {
                return res.status(400).send("bad request");
              }
            }
            data[mediaId].series_details = req.body.series_details;
          }
          else{
            delete data[mediaId].series_details;
          }
        }
        else{
          return res.status(400).send("bad request");
        }
      }
      

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`media id:${mediaId} updated`);
      });
    }, true);
  },
  
  /**
   * The function handle DELETE request to delete media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  delete_media: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID not exist");
      }
      delete data[mediaId];

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`media id:${mediaId} removed`);
      });
    }, true);
  },
  
  
  /**
   * The function handle PUT request to add actor to media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
   add_actor: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID not exist");
      }
      //check for errors that happend in the fields of the request, by the parameters that decided in the route
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if(data[mediaId].actors){
        
        if (data[mediaId].actors[req.body.name]) {
          return res.status(400).send("Actor already exist");
        }
      }
      else{
        data[mediaId].actors = {};
      }
      
      
      data[mediaId].actors[req.body.name] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`actor:${req.body.name} added`);
      });
    }, true);
  },
  
  /**
   * The function handle DELETE request to delete actor from media
   * @param {*} req The request from the user
   * @param {*} res The responseto the user
   */
  delete_actor: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID not exist");
      }
      const actor = req.params["name"];
      if (!data[mediaId].actors[actor]) {
        return res.status(400).send("actor not exist");
      }
      delete data[mediaId].actors[actor];

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`actor:${actor} removed`);
      });
    }, true);
  },
};
