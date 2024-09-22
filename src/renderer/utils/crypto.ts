import * as CryptoJS from 'crypto-js';

// const SECRET_KEY = process.env.SECRET_KEY || 'Default#Nowf@6699';
const SECRET_KEY = 'Default#Nowf@6699';


export const encrypt = (str: string): string => {
    return CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
}

export const decrypt = (str: string): string => {
    const bytes = CryptoJS.AES.decrypt(str, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}