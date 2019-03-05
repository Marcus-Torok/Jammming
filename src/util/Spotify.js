//jshint esversion:6

// Required parameters for getting an accessToken from Spotify API URL
const clientID = "--------------------------------";
const redirectURI = "https://------------.surge.sh";
// const redirectURI = "localhost:3000";

let accessToken;
let expiresIn;

// Not an onscreen component. Just an object for HTTP requests to Spotify API.
const Spotify = {
  getAccessToken() {
    // Case 1: accessToken is already defined
    if (accessToken) {
      return accessToken;
    }
    // Case 2: accessToken is not defined, but is available in window.location.href
    else if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
      expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];

      window.setTimeout(() => accessToken = "", expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    }
    // Case 3: User needs to generate an accessToken
    else {
      const authURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectURI}&scope=playlist-modify-public`;
      window.location = authURL;
    }
  },

  // GET request for tracks matching search term
  async search(term) {
    // Allows spaces in search term
    const apiURL = `https://api.spotify.com/v1/search?type=track&q=${term.replace(" ", "%20")}`;
    accessToken = await Spotify.getAccessToken();

    // Disallows requests without an accessToken
    if (!accessToken) {
      console.log("Couldn't get access token.");
      console.log(accessToken);
      return [];
    }

    // GET request. failure => [], success => [{},{},{},...,{}] array of track objects
    else {
      return fetch(apiURL, {
          headers: {Authorization: `Bearer ${accessToken}`}
        })
        .then(response => {
          if (response.ok) return response.json();
          else {
            console.log("Response not ok:");
            console.log(response);
            return [];
          };
        })
        .then(jsonResponse => {
          if (!jsonResponse || !jsonResponse.tracks.items) {
            return [];
          }
          else {
            console.log(jsonResponse);
            return jsonResponse.tracks.items.map(track => {
              return {
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
              };
            });
          }
        });
    }
  },

  // 2 POST requests: User Playlist --> Spotify account
  async savePlaylist(playlistName, trackUriArray) {
    if (!playlistName || !trackUriArray) return;
    accessToken = Spotify.getAccessToken();
    let headers = {Authorization: `Bearer ${accessToken}`};
    let userID;

    // Get userID
    return fetch('https://api.spotify.com/v1/me', {headers: headers})
      .then(response => response.json())
      .then(jsonResponse => {
        userID = jsonResponse.id;
      })

      // POST 1: User Playlist --> User Account
      .then(() => {
        const newPlaylistUrl = `https://api.spotify.com/v1/users/${userID}/playlists`;
        return fetch(newPlaylistUrl, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({
            name: playlistName
          })
        });
      })

      // POST 2: User tracks --> User Playlist
      .then(response => response.json())
      .then(jsonResponse => {
        const playlistID = jsonResponse.id;
        const newTracksUrl = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`;
        fetch(newTracksUrl, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
              uris: trackUriArray
            })
        });
      });
  }
};

export default Spotify;
