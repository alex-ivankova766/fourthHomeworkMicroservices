export class UserOrRoleNotFound extends Error {
    constructor() {
        super();
        this.message = `Пользователь или роль не найдены`
    }    
}