import React, { useState, useEffect, useContext } from 'react'
import * as commentoApi from '../../utils/commentoApi'
import { initializeAxiosInstance } from '../../utils/axios'
import { UserDetails } from '../../interfaces'

interface CommentoAuthProviderProps {
  sso?: boolean
  ssoToken?: string
  username?: string
  password?: string
  ssoProvider?: string
  ssoIdToken?: string
  commentoOrigin: string
}

interface CommentoAuthContextValue {
  isAuthenticated: boolean
  commenterToken: string | null
  userDetails: UserDetails
  isAuthenticating: boolean
  commentoOrigin: string
}

const CommentoAuthContext = React.createContext<CommentoAuthContextValue>({
  isAuthenticated: false,
  commenterToken: null,
  userDetails: {} as UserDetails,
  isAuthenticating: false,
  commentoOrigin: ''
})

export const useCommentoAuthContext = () => useContext(CommentoAuthContext)
export const CommnetoAuthProvider: React.FC<CommentoAuthProviderProps> = ({
  children,
  sso,
  ssoToken,
  commentoOrigin,
  ssoIdToken
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [commenterToken, setCommenterToken] = useState<string>('')
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (sso) {
      setIsAuthenticating(true)
      const doSSOAuthentication = async (ssoToken: string) => {
        try {
          const {
            commenterToken,
            success,
            userDetails
          } = await commentoApi.ssoAuth(
            commentoOrigin,
            ssoToken,
            ssoIdToken as string
          )
          if (success) {
            const domain =
              (userDetails as UserDetails).provider.split(':')[1] + '/'
            await initializeAxiosInstance(
              commentoOrigin,
              commenterToken as string,
              domain,
              ssoToken
            )
            setCommenterToken(commenterToken as string)
            setUserDetails(userDetails as UserDetails)
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
          }
        } catch (error) {
          setIsAuthenticated(false)
        }
        setIsAuthenticating(false)
      }
      doSSOAuthentication(ssoToken as string)
    }
  }, [sso, ssoToken, commentoOrigin])

  return (
    <CommentoAuthContext.Provider
      value={{
        isAuthenticated,
        commenterToken,
        userDetails,
        isAuthenticating,
        commentoOrigin
      }}
    >
      {children}
    </CommentoAuthContext.Provider>
  )
}

export default CommentoAuthContext
