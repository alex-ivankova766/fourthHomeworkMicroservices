import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class Role {
    
    @IsNumber({}, {message: 'Должно быть числом'})
    @ApiProperty({example: '1', description: 'ID пользователя'})
    id: number;
    @IsString({message: 'Должно быть строкой'})
    @ApiProperty({example: 'admin', description: 'Роль пользователя'})
    roleName: string;
    @IsString({message: 'Должно быть строкой'})
    @ApiProperty({example: 'Главный по званию', description: 'Описание роли'})
    description: string;
    users: [any];

}

export class RoleCreationAttrs {

    @IsString({message: 'Должно быть строкой'})
    @ApiProperty({example: 'admin', description: 'Роль пользователя'})
    roleName: string;
    @IsString({message: 'Должно быть строкой'})
    @ApiProperty({example: 'Главный по званию', description: 'Описание роли'})
    description: string;

}

export class RoleName {
    @ApiProperty({ example: 'manager', description: 'Роль пользователя' })
    roleName: string;
}