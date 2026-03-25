export interface Role {
  id: string;
  name: string;
  description: string;
  requiredVolunteers: number;
  event: any;
  assignedVolunteers: VolunteerSummary[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VolunteerSummary {
  id: string;
  name: string;
  email: string;
  skills?: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  requiredVolunteers: number;
  eventId: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  requiredVolunteers?: number;
}

export interface AssignVolunteerDto {
  userId: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalRoles: number;
  volunteersAssigned: number;
  eventStats: EventRoleStat[];
}

export interface EventRoleStat {
  eventId: string;
  eventTitle: string;
  date: Date;
  location: string;
  totalRoles: number;
  totalRequired: number;
  totalAssigned: number;
  coveragePercent: number;
}
