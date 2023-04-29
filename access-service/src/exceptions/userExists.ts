export class UserExists extends Error {
    constructor(email) {
        super();
        this.message = `Пользователь с e-mail ${email} уже существует`
        
    }    
}