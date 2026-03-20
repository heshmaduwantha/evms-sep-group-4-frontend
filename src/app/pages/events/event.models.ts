export enum EventStatus {
    UPCOMING = 'upcoming',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
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
