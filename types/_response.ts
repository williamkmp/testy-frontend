import type { BlockDto, FilePreviewDto, ImageDto, PageDataDto, PagePreviewDto, TokenDto, UserDto } from './_dto';
import type { ServerResponseData } from './_server';

export type LoginResponse = ServerResponseData<
    UserDto
    &
    {
        token: TokenDto;
    }
>;

export type TokenResponse = ServerResponseData<TokenDto>;

export type UserResponse = ServerResponseData<UserDto>;

export type ImageResponse = ServerResponseData<ImageDto>;

export type PagePreviewResponse = ServerResponseData<Array<PagePreviewDto>>;

export type PageDataResponse = ServerResponseData<PageDataDto>;

export type PageBlockResponse = ServerResponseData<Array<BlockDto>>;

export type FileUploadResponse = ServerResponseData<FilePreviewDto>;

export type FilePreviewResponse = ServerResponseData<FilePreviewDto>;
