export interface State {
  loggedIn: boolean
  userData: SpotifyApi.CurrentUsersProfileResponse,
  nowPlaying: { name: string, artists: string, albumArt: string },
  topArtists: SpotifyApi.ArtistObjectFull[]
}