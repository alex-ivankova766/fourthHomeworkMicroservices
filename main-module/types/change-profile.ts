import { ApiProperty } from "@nestjs/swagger";

export class ProfileUpdatingAttrs { 
    @ApiProperty({example: 'Александра', description: 'Имя'})
    name?: string;
    @ApiProperty({example: 'Иванкова', description: 'Фамилия'})
    surname?: string;
    @ApiProperty({example: '3128506', description: 'Телефон'})
    phone?: string;
}