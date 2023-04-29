export class UserNotExists extends Error {
    constructor(email) {
        super();
        this.message = `Пользователь с e-mail ${email} не существует`
        
    }    
}