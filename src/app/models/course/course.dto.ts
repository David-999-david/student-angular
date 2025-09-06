import { StudentDTO } from '../student/student.dto';

export interface JoinCourseDTO {
  id: number;
  name: string;
  description: string;
  status: boolean;
  student_limit: number;
  current_students: number;
  start_date: string;
  end_date: string;
  created_at: string;
  students: StudentDTO[];
}
