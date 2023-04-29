import { ApiProperty } from "@nestjs/swagger";

export class Token {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBvc3QuY29tIiwiaWQiOjIsInJvbGVzIjpbeyJpZCI6Miwicm9sZU5hbWUiOiJhZG1pbiIsImRlc2NyaXB0aW9uIjoiQWRtaW4ifV0sImlhdCI6MTY4Mjc5MDg4MiwiZXhwIjoxNjgyNzkxNzgyfQ.CaWbfyO_P0TWB1yHsrgUPB3eZ4_VkDWI9ZZE1aJwJk4'
    , description: 'Access JWT-Token' })
    token: string;
}