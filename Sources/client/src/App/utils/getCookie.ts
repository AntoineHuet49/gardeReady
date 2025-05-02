export const getAllCookie = () => {
    const cookies = document.cookie.split('; ');
    const arrayCookie: Record<string, string> = {};
    cookies.map(cookie => {
        const [name, value] = cookie.split('=');
        arrayCookie[name] = value;
    });
    return arrayCookie;
}

export const removeCookie = (name: string) => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}