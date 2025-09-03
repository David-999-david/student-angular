import { ApiResponseDTO, CourseDTO, StudentDTO } from './student.dto';
import { ApiResponse, CourseM, StudentM } from './student.model';

const toDate = (iso: string) => new Date(iso);

export function MapCourse(dto: CourseDTO): CourseM {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    limit: dto.student_limit,
    current: dto.current_students,
    startDate: toDate(dto.start_date),
    endDate: toDate(dto.end_date),
    createdAt: toDate(dto.created_at),
    courseStatus: dto.course_status,
  };
}

export function MapStudent(dto: StudentDTO): StudentM {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    address: dto.address,
    phone: dto.phone,
    status: dto.status,
    gender: dto.gender,
    createdAt: toDate(dto.created_at),
    courses: (dto.courses ?? []).map(MapCourse),
  };
}

export function MapJoinStudent(dto: ApiResponseDTO<StudentDTO>): ApiResponse<StudentM> {
  return {
    count: dto.count,
    error: dto.error,
    success: dto.success,
    data: dto.data.map(MapStudent),
  };
}
