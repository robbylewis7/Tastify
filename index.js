const TASTEDIVE_SEARCH_URL = 'https://tastedive.com/api/similar';

function getDataFromApi(searchTerm, callback) {  
  var settings = {
    url: TASTEDIVE_SEARCH_URL,
    data: {
      q: searchTerm,
      type: 'music',
      k: '313446-Thinkful-GXCCVGV5',
      limit: 14,
      info: 1
    },
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}

function testSpotify(){
  var settings = {
    url: SPOTIFY_API,
    response_type: 'token',

  }
}

function renderResult(item) {
  return `
    <div class = "relatedArtistReturn">
    <div class = "row">
      <div class = "col-6">
        <h2>${item.Name}</h2>
      </div>
      </div>
    </div>
  `;
}

function displayTastediveSearchData(data) {
  const results = data.Similar.Results.map((item) => renderResult(item));
  $('.js-search-results').html(results);
}


function watchSubmit() {
   
  $('.js-search-form').submit(event => {
    console.log('clicked')
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('#search-username');
    const query = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    getDataFromApi(query, displayTastediveSearchData);
  });
}


$(watchSubmit);

