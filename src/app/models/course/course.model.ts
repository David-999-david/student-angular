import { StudentDTO } from '../student/student.dto';
import { StudentM } from '../student/student.model';

export interface JoinCourseM {
  id: number;
  name: string;
  description: string;
  status: boolean;
  limit: number;
  current: number;
  start_date: string;
  end_date: string;
  createdAt: Date;
  students: StudentM[];
}

export interface createC {
  name: string;
  description: string;
  status: boolean;
  student_limit: number;
  start_date: string;
  end_date: string;
}

export interface updateC {
  name: string;
  description: string;
  status: boolean;
  student_limit: number;
  start_date: string;
  end_date: string;
}
