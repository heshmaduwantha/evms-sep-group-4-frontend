export enum EventStatus {
    UPCOMING = 'upcoming',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface User {
    id: string;
    email: string;
    role: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    volunteersNeeded: number;
    status: EventStatus;
    organizer: User;
    volunteers: User[];
    createdAt: string;
    updatedAt: string;
}

export interface EventStats {
    totalEvents: number;
    upcomingEvents: number;
    activeEvents: number;
    completedEvents: number;
}
