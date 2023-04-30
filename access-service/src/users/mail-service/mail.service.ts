import * as nodemailer from 'nodemailer';

class MailService {
    private static instance: MailService;
    private transporter: nodemailer.Transporter;

    constructor() {}
    static getInstance() {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    async createConnection() {
        this.transporter = nodemailer.createTransport( {
            host: process.env.MAIL_HOST,
            port: +process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }
        async sendActivationMail(to, link) {
            await this.createConnection();
        await this.transporter.sendMail( {
            from: process.env.MAIL_USER,
            to: to, 
            subject: `Activation code ${process.env.API_URL}`,
            text: '',
            html: 
            `
            <div>
            <h1>To activate follow the link</h1>
            <a href="${link}">${link}</a>
            </div>`
        })
    }
}

export const mailService = new MailService();