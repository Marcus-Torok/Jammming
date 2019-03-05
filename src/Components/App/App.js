//jshint esversion:6
import React, { Component } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar.js';
import '../SearchBar/SearchBar.css';
import SearchResults from '../SearchResults/SearchResults.js';
import '../SearchResults/SearchResults.css';
import Playlist from '../Playlist/Playlist.js';
import '../Playlist/Playlist.css';
import Spotify from '../../util/Spotify.js';

class App extends Component {
  constructor(props) {
    super(props);
    // Default state. No search results or user playlist, yet.
    this.state = {
      searchResults: [],
      playlistName: "New Playlist",
      playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  // Results --> Playlist upon clicking "+" sign
  addTrack(track) {
    let playlistTracks = this.state.playlistTracks;
    // Prevents duplicates. User Playlist can only have one of each track
    if (playlistTracks.find(alreadyTrack => alreadyTrack.id === track.id)) {
      return;
    } else {
      playlistTracks.push(track);
      this.setState({playlistTracks: playlistTracks}); ///
    }
  }

  // Removes track from Playlist upon clicking "-" sign
  removeTrack(track) {
    let playlistTracks = this.state.playlistTracks;
    this.setState({playlistTracks: playlistTracks.filter(alreadyTrack => alreadyTrack.id !== track.id)});
    return;
  }

  // Allows user to rename Playlist
  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  // Saves the user's Playlist to their Spotify account using method .savePlaylist(arg1, arg2) from Spotify.js
  async savePlaylist() {
    // Gets URIs to define arg2
    const trackURIs = this.state.playlistTracks.map(playlistTrack => playlistTrack.uri);
    // Passes in arg1 & arg2.
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);
    // Resets User Playlist
    this.setState({
      playlistName: "New Playlist",
      playlistTracks: []
    });
  }

  // Uses Spotify.js search method, then updates search results.
  async search(userSearchTerm) {
    const newSearchResults = await Spotify.search(userSearchTerm);
    this.setState( {searchResults: newSearchResults} );
  }

  // Render major components; Start passing info down to components as props.
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack} />
            <Playlist
              playlistName={this.state.playlistName}
              onNameChange={this.updatePlaylistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
