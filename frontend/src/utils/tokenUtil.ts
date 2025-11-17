import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token: string | null) => {
  if (!token) return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    if (!decoded.exp) return false;

    // exp is in seconds, Date.now() in ms
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
