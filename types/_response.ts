import type { ImageDto, PagePreviewDto, TokenDto, UserDto } from './_dto';
import type { ServerResponseData } from './_server';

export type LoginResponse = ServerResponseData<
    UserDto
    &
    {
        token: TokenDto
    }
>;

export type TokenResponse = ServerResponseData<TokenDto>;

export type UserResponse = ServerResponseData<UserDto>;

export type ImageResponse = ServerResponseData<ImageDto>;

export type PagePreviewResponse = ServerResponseData<Array<PagePreviewDto>>;
