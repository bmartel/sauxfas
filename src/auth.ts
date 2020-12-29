export interface TokenAuth {
  token: string;
}
export interface BasicAuth {
  username: string;
  password: string;
}
export type AuthCredentials = BasicAuth | TokenAuth;

export const withCredentials = (
  options: any = {},
  credentials?: AuthCredentials,
): any => ({
  ...options,
  ...(credentials
    ? {
        headers: {
          ...(options.headers || {}),
          Authorization: (credentials as BasicAuth).username
            ? `Basic ${btoa(
                `${(credentials as BasicAuth).username}:${
                  (credentials as BasicAuth).password
                }`,
              )}`
            : `Bearer ${(credentials as TokenAuth).token}`,
        },
      }
    : {}),
});
