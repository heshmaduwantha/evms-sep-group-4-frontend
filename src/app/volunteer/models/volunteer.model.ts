export interface Volunteer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  status: 'active' | 'inactive';
}