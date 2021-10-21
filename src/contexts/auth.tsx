import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * @param { string } name
 * @param { string } login
 * @param { string } avatar_url
 */
type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthProviderProps = {
  children: React.ReactNode;
}

type AuthContextProps = {
  user: User | null
  signInUrl: string
  singOut: () => void
}

type AuthResponseProps = {
  token: string;
  user: {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
  }
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider(props: AuthProviderProps) {

  const [user, setUser] = useState<User | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${'236aa6b2265c606afa68'}&redirect_uri=http://localhost:3001`;

  /**
   * 
   * @param gitHubCode Recuperado no useEffect apos o user fazer login no github
   * @return Promise<AuthResponseProps> 
   */
  async function signIn(gitHubCode: string) {
    const response = await api.post<AuthResponseProps>('/authenticate', {
      code: gitHubCode
    });
    
    const { token, user } = response.data;

    api.defaults.headers.common.authorization = `Bearer ${token}`;


    /** 
     * Salva os dados do user no state do contexto
     */
    setUser(user);

    localStorage.setItem('@dowhile:token', token);
    localStorage.setItem('@dowhile:user', JSON.stringify(user));
  }

  function singOut() {
    localStorage.removeItem('@dowhile:token');
    localStorage.removeItem('@dowhile:user');
    setUser(null);
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');
    const user = localStorage.getItem('@dowhile:user');

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get<User>('/user/info').then(response => {
        console.log('response', response.data);
        setUser(response.data);
      });
    }

  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    /**
     * Se o usuario tiver feito login no github, entao
     * recupera o code e chama a api para fazer o login no servidor node e recuperar o token
     */
    if (hasGithubCode) {
      const [urlWithoutCode, gitHubCode] = url.split('?code=');
      window.history.pushState(
        {}, '', urlWithoutCode
      );

      if (!user) {
        signIn(gitHubCode);
      }

    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, signInUrl, singOut }}>
      {props.children}
    </AuthContext.Provider>
  )
}