$(document).ready(function () {
  getMedia();
});

/**
 * The function invoke an Ajax call to get all the media from the server.
 * From it, it's build the table to display
 */
function getMedia() {
  $.ajax({
    url: "http://localhost:3001/media",
    type: "GET",
    success: function (response) {
      let mediaRes = "";
      for (let i = 0; i < response.length; i++) {
        mediaRes += `
                <tr>
                <th scope="row">${response[i].id}</th>
                <td>${response[i].name}</td>
                <td> <img src="${response[i].picture}" alt="media pic" class="icon"></td>
                <td>${response[i].rating}</td>
                <td>${response[i].date}</td>
                
                <td><button class="operationsDel" id="delete_media${i}">Delete media</button>
                <button class="operationsUp" id="update_media${i}">Update details</button>
                <button class="operationsAdd" id="add_actor${i}">Add actor</button>
                <button class="operationsAct" id="watch_actors${i}">Actors list</button></td>
              </tr>`;
      }
      $("#table_id > tbody").html(mediaRes);

      setTable();
      deleteMedia();
      updateDetails();
      addActor();
      watchList();
    },
    error: function (error) {
      console.log(error.responseText);
    },
  });
}

/**
 * The function handle the rules of the tables
 */
function setTable() {
  $("#table_id").DataTable({
    searching: false,
    paging: false,
    info: false,
    order: [[4, "desc"]],
    columnDefs: [
      { orderable: false, targets: 0 },
      { orderable: false, targets: 2 },
      { orderable: false, targets: 5 },
    ],
  });
}

/**
 * The function invoke an Ajax call to delete specific media from the server
 */
function deleteMedia() {
  $(".operationsDel").click(function () {
    let id = $(this).parent().parent().find("th").text();

    $.ajax({
      url: `http://localhost:3001/media/${id}`,
      type: "DELETE",

      success: function (response) {
        console.log(response);
        location.href = "/list";
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
}

/**
 * The function save an id on the local storage to send it to the update form
 */
function updateDetails() {
  $(".operationsUp").click(function () {
    let id = $(this).parent().parent().find("th").text();
    localStorage.setItem("mediaId", id);
    location.href = "/updateForm";
  });
}

/**
 * The function display a form to add a new actor to a media.
 * After submit, the function invoke an Ajax call to add the actor to the media
 */
function addActor() {
  $(".operationsAdd").click(function () {
    let id = $(this).parent().parent().find("th").text();
    Swal.fire({
      title:
        "<h4 style='background-color:white;color:black'> Add Actor Form</h4>",
      html: `<input type="text" id="name" class="swal2-input" style="background-color:white" placeholder="Name">
        <input type="url" id="picture" class="swal2-input" style="background-color:white" placeholder="Image(url)">
        <input type="url" id="site" class="swal2-input" style="background-color:white" placeholder="fan site">`,
      confirmButtonText: "Add actor",
      focusConfirm: false,
      customClass: {
        title: "title-class",
        htmlContainer: "htmlContainer-class",
        actions: "actions-class",
      },
      preConfirm: () => {
        const name = Swal.getPopup().querySelector("#name").value;
        const picture = Swal.getPopup().querySelector("#picture").value;
        const site = Swal.getPopup().querySelector("#site").value;
        if (!name || !picture || !site) {
          Swal.showValidationMessage(`Please enter all details`);
        }
        else if(!/^[a-zA-Z, ,-]*$/.test(name)){
          Swal.showValidationMessage(`Please enter valid name`);
        }
         else {
          try {
            let myURL = new URL(picture);
            let myURL2 = new URL(site);
          } catch (e) {
            Swal.showValidationMessage(`Invalid url`);
          }
        }

        return { name: name, picture: picture, site: site };
      },
    }).then((result) => {
      if (!result.isDismissed) {
        res = `{
                "name": "${result.value.name}",
                "picture" : "${result.value.picture}",
                "site": "${result.value.site}"
            }`;
        console.log(res);
        $.ajax({
          url: `/media/${id}/actors`,
          contentType: "application/json",
          type: "PUT",
          datatype: "json",
          data: res,
          encode: true,
          success: function (response) {
            location.href = "/list";
          },
          error: function (error) {
            console.log(error.responseText);
          },
        });
      }
    });
  });
}

/**
 * The function invoke an Ajax call to get all the actors from specific media
 * Than, it's display a popup with a table of all the actors
 */
function watchList() {
  $(".operationsAct").click(function () {
    let id = $(this).parent().parent().find("th").text();
    $.ajax({
      url: `http://localhost:3001/media/${id}`,
      type: "GET",
      success: function (response) {
        let actorsTable = `<table class='table' id='actorsTable'>
                          <thead>
                            <tr>
                            <th scope="col">Name</th>
                           <th scope="col">Image</th>
                           <th scope="col">Delete</th>
                          </tr>
                          </thead>
                          <tbody>`;
        if (response.actors) {
          for (actor in response.actors) {
            actorsTable += `<tr>
            <th scope="row">${response.actors[actor].name}</th>
            <td> <img src="${response.actors[actor].picture}" alt="actor pic" class="icon"></td>
            <td> <button class="deleteAct" style="border:solid 2px rgb(255, 255, 255);  border-radius: 4px; padding:2px" id="delete_actor${response.actors[actor].name}">Delete</button></td>
          </tr>`;
          }
        }
        actorsTable += `</tbody>
        </table>`;
        Swal.fire({
          title: "Actors List",
          html: actorsTable,
          confirmButtonText: "Ok",
          focusConfirm: false,
          customClass: {
            title: "title-class",
            htmlContainer: "htmlContainer-class",
            actions: "actions-class",
          },
        });
        deleteActor(id);
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
}

/**
 * The function invoke an Ajax call to delete an actorsfrom specific media
 * @param {} id The id of the media
 */
function deleteActor(id) {
  $(".deleteAct").click(function () {
    let name = $(this).parent().parent().find("th").text();
    $.ajax({
      url: `http://localhost:3001/media/${id}/actors/${name}`,
      type: "DELETE",

      success: function (response) {
        console.log(response);
        location.href = "/list";
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
}
