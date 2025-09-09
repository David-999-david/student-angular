export interface StudentJM {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  status: boolean;
  gender: string;
  createdAt: Date;
  courses: CourseM[];
}

export interface CourseM {
  id: number;
  name: string;
  description: string;
  limit: number;
  current: number;
  startDate: string;
  endDate: string;
  createdAt: Date;
  courseStatus: boolean;
}

export interface StudentM {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  status: boolean;
  gender: string;
  createdAt: Date;
}

export interface Meta {
  count: number;
  totalPages: number;
}

export interface ApiResponseList<T> {
  count?: number | null;
  error: boolean;
  success: boolean;
  meta: Meta,
  data: T[];
}

export interface ApiResponse<T> {
  error: boolean;
  success: boolean;
  data: T;
}

export interface Gender {
  id: number;
  gender: string;
}

export interface createS {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender_id: number;
  status: boolean;
}

export interface updateS {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gender_id?: number | null;
  status?: boolean | null;
}

