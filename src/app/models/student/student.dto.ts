export interface JoinStudentDTO {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  status: boolean;
  gender: string;
  created_at: string;
  courses: CourseDTO[];
}

export interface CourseDTO {
  id: number;
  name: string;
  description: string;
  student_limit: number;
  current_students: number;
  start_date: string;
  end_date: string;
  created_at: string;
  status: boolean;
}

export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  status: boolean;
  gender: string;
  created_at: string;
}

export interface ApiResponseDTOList<T> {
  count: number;
  error: boolean;
  success: boolean;
  data: T[];
}

export interface ApiResponseDTO<T> {
  error: boolean;
  success: boolean;
  data: T;
}


export interface GenderDTO {
  id: number;
  name: string
}