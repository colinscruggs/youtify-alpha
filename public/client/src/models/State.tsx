import { TimeRange } from "./TimeRange";

export interface State {
  loggedIn: boolean
  userData: SpotifyApi.CurrentUsersProfileResponse,
  nowPlaying: { name: string, artists: string, albumArt: string },
  topArtists: SpotifyApi.ArtistObjectFull[]
  topTracks: SpotifyApi.TrackObjectFull[]
  artistRange: TimeRange,
  trackRange: TimeRange,
  topArtistsPage: number,
  topTracksPage: number,
  genreList: {},
  currentTopView: string
}