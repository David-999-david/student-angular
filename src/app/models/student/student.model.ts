export interface StudentM {
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

export interface ApiResponse<T> {
  count: number;
  error: boolean;
  success: boolean;
  data: T[];
}
