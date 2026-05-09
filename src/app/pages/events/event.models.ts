export enum EventStatus {
    UPCOMING = 'upcoming',
    ACTIVE = 'active',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    ON_HOLD = 'on hold',
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    volunteersNeeded: number;
    status: EventStatus;
    organizer?: any;
    volunteers?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EventStats {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalVolunteers: number;
}
