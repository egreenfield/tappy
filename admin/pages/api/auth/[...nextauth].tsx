import NextAuth, { Session, User } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
        authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
  callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.refresh_token;
            }
            return token;
        },
        async session(session:Session, user:User) {
            session.user = user;
            return session;
        },
    },
  secret: "LJ6zT7OV1Awp5fC5Tg7lkDiheNYkLE1gTu+VqdMcv5E=",
})