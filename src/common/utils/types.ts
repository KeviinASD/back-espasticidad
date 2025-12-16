import { ApiProperty } from "@nestjs/swagger";
import { RoleTier } from "../enums/role.enum";

export type SignInParams = {
    email: string;
    password: string;
};

export type SignUpParams = {
    username: string;
    email: string;
    password?: string;
}

// JWT 

export type JwtPayloadParams = {
    sub: number;
}

export class resultAndTokenParams {
    user: {
        id: number;
        username: string;
        email: string;
    }
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
    acces_token: string;
}

