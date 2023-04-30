import { ApiProperty } from "@nestjs/swagger";

export class ActivationLink {
    @ApiProperty({ example: '06bf26a0-60be-41e6-98a0-1dccfd6b6a0c'
    , description: 'Activation link' })
    link: string;
}