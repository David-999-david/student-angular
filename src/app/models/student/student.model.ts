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
  startDate: Date;
  endDate: Date;
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

export interface ApiResponseList<T> {
  count: number;
  error: boolean;
  success: boolean;
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

export type updateS = Partial<createS>;
