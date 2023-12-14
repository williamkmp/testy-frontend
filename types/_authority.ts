export const AUTHORITY = {
    FULL_ACCESS: 'FULL_ACCESS',
    COLLABORATORS: 'COLLABORATORS',
    VIEWERS: 'VIEWERS',
} as const;

export type Authority = keyof typeof AUTHORITY;
