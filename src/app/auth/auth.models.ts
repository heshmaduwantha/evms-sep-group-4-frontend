export enum UserRole {
    VOLUNTEER = 'volunteer',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}
