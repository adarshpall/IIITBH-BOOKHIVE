import crypto from "crypto";
const generateRandomPassword = (length=8) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(characters.length);
      password += characters.charAt(randomIndex);
    }
    return password;   
}

export default generateRandomPassword;