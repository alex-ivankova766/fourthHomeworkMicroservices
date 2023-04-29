export class UnInitialized extends Error {
    constructor() {
        super();
        this.message = "Необходимо выполнение инициализации сервера"
        
    }    
}