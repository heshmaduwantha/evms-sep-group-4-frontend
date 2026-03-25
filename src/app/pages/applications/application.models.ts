export enum ApplicationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    WAITLISTED = 'waitlisted'
}

export interface Application {
    id: string;
    user: any;
    event: any;
    status: ApplicationStatus;
    motivation: string;
    experience: string;
    skills: string;
    location?: string;
    gender?: string;
    experienceDetails?: string;
    reapplied?: boolean;
    appliedDate: Date;
    updatedAt: Date;
}

export interface CreateApplicationDto {
    eventId: string;
    motivation?: string;
    experience?: string;
    skills?: string;
    location?: string;
    gender?: string;
    experienceDetails?: string;
}

export interface UpdateApplicationDto {
    motivation?: string;
    experience?: string;
    skills?: string;
    location?: string;
    gender?: string;
    experienceDetails?: string;
}

export interface UpdateApplicationStatusDto {
    status: ApplicationStatus;
    notes?: string;
}

export interface ApplicationStats {
    totalApplications: number;
    approved: number;
    rejected: number;
    waitlisted: number;
    pending: number;
}
