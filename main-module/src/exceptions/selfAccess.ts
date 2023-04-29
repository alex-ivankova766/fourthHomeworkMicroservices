export class SelfAccess extends Error {
    constructor() {
        super();
        this.message = `Доступ только для самого пользователя или владельца ресурса`
        
    }    
}