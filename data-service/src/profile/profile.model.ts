import { ApiProperty } from "@nestjs/swagger";
import {  AutoIncrement, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export class ProfileUpdatingAttrs { 
    name?: string;
    surname?: string;
    phone?: string;
}

@Table( {tableName: 'profiles', createdAt: false, updatedAt: false})
export class Profile extends Model<Profile> {

    @ApiProperty({example: '1', description: 'Unique identifier'})
    @AutoIncrement
    @Unique
    @PrimaryKey
    @Column( {type: DataType.INTEGER, primaryKey: true}) 
    id: number;
    
    @ApiProperty({example: 'Alex', description: 'Name'}) 
    @Column( {type: DataType.STRING})
    name:string;

    @ApiProperty({example: 'Ivankova', description: 'Surname'}) 
    @Column( {type: DataType.STRING})    
    surname: string;

    @ApiProperty({example: '2128506', description: 'Surname'}) 
    @Column( {type: DataType.STRING})  
    phone: string;

}