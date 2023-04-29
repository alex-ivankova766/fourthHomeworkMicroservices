export class UnAuthorized extends Error {
    constructor() {
        super();
        this.message = "Пользователь не авторизован"
        
    }    
}