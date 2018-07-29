const TASTEDIVE_SEARCH_URL = 'https://tastedive.com/api/similar';

function getDataFromApi(searchTerm, callback) {  
  var settings = {
    url: TASTEDIVE_SEARCH_URL,
    data: {
      q: searchTerm,
      type: 'music',
      k: '313446-Thinkful-GXCCVGV5',
      limit: 16,
      info: 1
    },
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}

//Renders the results of related artists 
function renderResult(item) {
  return `
    <div class = "relatedArtistReturn">
    <div class = "row">
      <div class = "col-6">
      <a href = "${item.wUrl}"target="_blank">
        <h2>${item.Name}</h2>
      </a>
      </div>
      </div>
    </div>
  `;

}

//Generates listing of related artists
let artistSearch;
function displayTastediveSearchData(data) {
  const results = data.Similar.Results.map((item) => renderResult(item));
  $('.js-search-results').html(results);
  artistSearch = createArtistList(data);
}


//Create array of artitsts from user search 
function createArtistList(data) {
  var results = data.Similar.Results;
  var artistList = [];
  for (var i = 0; i < results.length; i++){
    artistList.push(results[i].Name);
  }
  spotifyAppInitiate(artistList);
}


//Access token info from Spotify user
function getParameterByName(name) {
  var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getAccessToken() {
  return getParameterByName('access_token');
}

const accessToken = getAccessToken();


//Get artists from spotify
const getArtistsFromSpotify = (artist) => {
	return new Promise(function (resolve, reject) {
		$.ajax({
			url: 'https://api.spotify.com/v1/search',
			method: 'GET',
			dataType: 'json',
			data: {
				type: 'artist',
				q: artist,
				limit: 1
			},
			headers: {
		        'Authorization': 'Bearer ' + accessToken
		    },
		    success: resolve,
		    error: reject
		});
	})

}
	

//Get top tracks for artist

const getArtistsTracksFromSpotify = (id) => {
	return new Promise(function (resolve, reject) {
		$.ajax({
			url: `https://api.spotify.com/v1/artists/${id}/top-tracks/`,
			method: 'GET',
			dataType: 'json',
			data: {
				country: 'US',
			},
			headers: {
				'Authorization': 'Bearer ' + accessToken
			},
			success: resolve,
			error: reject
		});
	})
}


let clientID;

function getClientInfoFromSpotify() {
	const settings = {
		url: 'https://api.spotify.com/v1/me',
		method: 'GET',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function getClientID(data) {
			clientID = data.id;
			createPlaylist(clientID);
		}
	}
	$.ajax(settings);
  console.log(clientID);
}


//Create playlist

let playlistID;
let today = new Date().toLocaleString("en-US").split(',')[0];


function createPlaylist(id) {
	const settings = {
		async: true,
		crossDomain: true,
		url: `https://api.spotify.com/v1/users/${id}/playlists`,
		method: 'POST',
		data: JSON.stringify({
				name: `Tastify Playlist: ${today}`,
				description: `Possible bands you'd like`,
				public: false
			}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(data) {
			playlistID = data.id;
			addTracksToPlaylist(spotifyArtistsSingleTopTracks);
		}
	}
	$.ajax(settings);
}

// function addTracksToPlaylist

function addTracksToPlaylist(array) {
	const settings = {
		async: true,
		crossDomain: true,
		url: `https://api.spotify.com/v1/users/${clientID}/playlists/${playlistID}/tracks`,
		method: 'POST',
		data: JSON.stringify({
			uris: array
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken
		},
		success: function() {
			displaySpotifyPlaylist();
		}  
	}
	$.ajax(settings);
}

// Display playlist in screen

function displaySpotifyPlaylist() {
	$('.results').html(`
		<iframe src="https://open.spotify.com/embed/user/${clientID}/playlist/${playlistID}" class="spotifyPlaylist" frameborder="0" allowtransparency="true" allow="encrypted-media" aria-label="Spotify Playlist"></iframe>
		</br>
		<button class="save-playlist">SAVE PLAYLIST</button>
		`);
	deletePlaylistFromSpotify();
}

// Unfollow Playlist in Spotify

function deletePlaylistFromSpotify() {
	const settings = {
		async: true,
		crossDomain: true,
		url: `https://api.spotify.com/v1/users/${clientID}/playlists/${playlistID}/followers`,
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken
		}
	}
	$.ajax(settings);
}

// Save Playlist in Spotify

function savePlaylistInSpotify() {
	const settings = {
		async: true,
		crossDomain: true,
		url: `https://api.spotify.com/v1/users/${clientID}/playlists/${playlistID}/followers`,
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken
		},
		success: function() {
			console.log('Playlist saved!')
		}
	}
	$.ajax(settings);
}


//Initiate Spotify app
let spotifyArtistsSingleTopTracks = [];

function spotifyAppInitiate(artistList) {
	const spotifyArtists = artistList.map(getArtistsFromSpotify);
	Promise.all(spotifyArtists)
		.then(data => {
			const filteredData = data.filter(a => a.artists.items.length > 0);
			const spotifyArtistsIDs = filteredData.map(a => a.artists.items[0].id);
			Promise.all(spotifyArtistsIDs.map(getArtistsTracksFromSpotify))
				.then(data => {
					const filteredTracks = data.filter(a => a.tracks.length > 0);
					spotifyArtistsSingleTopTracks = filteredTracks.map(a => "spotify:track:" + a.tracks[0].id);
					getClientInfoFromSpotify();
				})
		})
};




function watchSubmit() {
   
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('#search-username');
    const query = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    getDataFromApi(query, displayTastediveSearchData);
  });
}
	$('.main-container').on('click', '.save-playlist', function(e) {
		e.preventDefault();
		savePlaylistInSpotify();
	})

$(watchSubmit);



 

 

