if (!sessionStorage.getItem('tabId')) {
  sessionStorage.setItem('tabId', crypto.randomUUID());
}
const tabId = sessionStorage.getItem('tabId');

export const tokenKey = `token_${tabId}`;
export const getToken = () => localStorage.getItem(tokenKey);
export const setToken = (token) => localStorage.setItem(tokenKey, token);
export const removeToken = () => localStorage.removeItem(tokenKey);