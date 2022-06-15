$(document).ready(function () {
  //handle the series option
  $("#seriesCheck").change(function () {
    if (this.checked) {
      $("#res").show();
      $("#seasonInput").attr("required", true);
    } else {
      $("#res").hide();
      $("#seasonInput").attr("required", false);
      $("#episodes").html("");
    }
  });
  //give the user fields for episodes
  $("#seasonInput").on("input", function () {
    let seasons = $(this).val(),
      seasonInput = "";
    for (let i = 0; i < seasons; i++) {
      seasonInput += `<label for="season${
        i + 1
      }">Number of episodes in season ${i + 1}</label>
            <input type="number" class="form-control episodes" id="season${
              i + 1
            }" min="1" required>`;
    }
    $("#episodes").html(seasonInput);
  });

  $("#target").submit(function (event) {
   
    const id = localStorage['mediaId'];
    localStorage.removeItem( 'mediaId' );
    sendReq(id);

    event.preventDefault();
  });
});

//The function get all input and send an Ajax call to the server
function sendReq(id) {
    res = `{
        `;
            if ($("#nameInput").val() !== "") {
              res += `"name": "${$("#nameInput").val()}",
        `;
            }
            if ($("#picInput").val() !== "") {
              res += `"picture": "${$("#picInput").val()}",
          `;
            }
            if ($("#directorInput").val() !== "") {
              res += `"director": "${$("#directorInput").val()}",
          `;
            }
            if ($("#rdateInput").val() !== "") {
              res += `"date": "${$("#rdateInput").val()}",
          `;
            }
            if ($("#ratingInput").val() !== "") {
              res += `"rating": "${$("#ratingInput").val()}",
          `;
            }
            let isSeries;
            if ($("#seriesCheck").is(":checked")) {
              isSeries = true;
              let num = $("#seasonInput").val();
              episodes = [];
              for (let i = 0; i < num; i++) {
                episodes.push($(`#season${i + 1}`).val());
              }
              res += `"isSeries": ${isSeries},
              "series_details": [${episodes}]
              }`;
            } else {
              isSeries = false;
              res += `"isSeries": ${isSeries}
              }`;
            }
            
  $.ajax({
    url: "/media/"+id,
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
      Swal.fire({
        title:  "<h4 style='background-color:white;color:black'> ERROR</h4>",
        html: `<h6 style='background-color:white;color:black'> ${error.responseText}</h6>`,
        confirmButtonText: 'Ok',
      }).then((result) => {
        if (result.isConfirmed) {
          location.href = "/list"
        } else if (result.isDenied) {
          location.href = "/list"
        }
      })
    },
  });
}
