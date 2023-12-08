import type { ServerResponseOkay } from './_server';
import type { TokenDto, UserDto } from './_dto';

export type LoginResponse = ServerResponseOkay<
    UserDto
    &
    {
        token: TokenDto
    }
>;

export type TokenResponse = ServerResponseOkay<TokenDto>;

export type UserResponse = ServerResponseOkay<UserDto>;

export type ImageResponse = ServerResponseOkay<{
    id: string
    src: string
}>;
