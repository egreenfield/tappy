import React, { useEffect, useState } from "react";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "token"
const SCOPES = "user-read-email,playlist-read-private,user-library-read,user-follow-read,user-library-modify,user-follow-modify"

export interface DefaultSession extends Record<string, unknown> {
    token:string;
}
export interface UseSessionOptions<R extends boolean> {
    required: R
    onUnauthenticated?: () => void
}
export interface Session extends Record<string, unknown>, DefaultSession {}
export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { data: Session; status: "authenticated" }
      | { data: null; status: "loading" }
  :
      | { data: Session; status: "authenticated" }
      | { data: null; status: "unauthenticated" | "loading" }


const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined
)


export interface SessionProviderProps {
    children: React.ReactNode
}

export function SessionProvider({children}: SessionProviderProps) {
    const [session,setSession] = useState<Session | undefined>(undefined);

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")
    
        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))!.split("=")[1]
    
            console.log("Getting token, hash is ",hash)
            window.location.hash = ""
            window.localStorage.setItem("token", token);
        }    
        if(token)
            setSession({token})
    }, [])  
    const value: any = React.useMemo(
        () => ({
          data: session,
          status: "authenticated"
        }),
        [session]
      )
    
    return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    )
}

      
export function useSession<R extends boolean>(options?: UseSessionOptions<R>) {
    // @ts-expect-error Satisfy TS if branch on line below
    const value: SessionContextValue<R> = React.useContext(SessionContext)
    if (!value && process.env.NODE_ENV !== "production") {
        throw new Error(
        "[next-auth]: `useSession` must be wrapped in a <SessionProvider />"
        )
    }
    
    const { required, onUnauthenticated } = options ?? {}
    
    const requiredAndNotLoading = required && value.status === "unauthenticated"
    
    React.useEffect(() => {
        if (requiredAndNotLoading) {
        if (onUnauthenticated) onUnauthenticated()
        else signIn()
        }
    }, [requiredAndNotLoading, onUnauthenticated])
    
    if (requiredAndNotLoading) {
        return { data: value.data, status: "loading" } as const
    }
    
    return value
    }
    
    export function getToken() {
    return "";
}

export function signIn() {
    let loc = window.location;
    let redirectUrl = `${loc.protocol}//${loc.host}`
    console.log(`redirect: ${redirectUrl}`)
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`
}
export function signOut() {
    window.localStorage.removeItem("token")
    window.location.reload()
}


interface AuthProps {
    children:any[] | any
}
