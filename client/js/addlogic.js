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
    
    sendReq();

    event.preventDefault();
  });
});

//The function get all input and send an Ajax call to the server
function sendReq() {
  res = `{
    "id": "${$("#IdInput").val()}",
    "name": "${$("#nameInput").val()}",
    "picture" : "${$("#picInput").val()}",
    "director": "${$("#directorInput").val()}",
    "date": "${$("#rdateInput").val()}",
    "rating": ${$("#ratingInput").val()},
    `;
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
    url: "/media",
    contentType: "application/json",
    type: "POST",
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
