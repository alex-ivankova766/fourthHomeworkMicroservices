import { ApiProperty } from '@nestjs/swagger';
import { Blob } from 'buffer';
import {  AutoIncrement, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

interface DbFilesCreationAttrs {
    filename: string;
    path: string;
    content: Blob; 
}
 
@Table( {tableName: 'files'}) 
export class DatabaseFile extends Model<DatabaseFile, DbFilesCreationAttrs> {
    
    @ApiProperty({example: '1', description: 'Unique identifier'})
    @AutoIncrement
    @Unique
    @PrimaryKey
    @Column( {type: DataType.INTEGER, primaryKey: true}) 
    id: number;
    
    @ApiProperty({example: 'Avatar', description: 'File name'}) 
    @Column( {type: DataType.STRING, allowNull: false})    
    filename: string;

    @ApiProperty({example: 'textblock', description: 'Essence table'}) 
    @Column( {type: DataType.STRING, allowNull: true})    
    essenceTable: string;

    @ApiProperty({example: '17', description: 'Element ID in the essence table'}) 
    @Column({ type: DataType.INTEGER, allowNull: true })
    essenceID: number;
    
    @ApiProperty({description: 'File'}) 
    @Column({ type: DataType.BLOB})
    content: Blob;
}