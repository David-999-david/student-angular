import {
  ApiResponseDTO,
  ApiResponseDTOList,
  CourseDTO,
  GenderDTO,
  JoinStudentDTO,
  StudentDTO,
} from './student.dto';
import {
  ApiResponse,
  ApiResponseList,
  CourseM,
  Gender,
  StudentJM,
  StudentM,
} from './student.model';

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
    courseStatus: dto.status,
  };
}

export function MapJStudent(dto: JoinStudentDTO): StudentJM {
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

export function MapJoinStudents(
  dto: ApiResponseDTOList<JoinStudentDTO>
): ApiResponseList<StudentJM> {
  return {
    error: dto.error,
    success: dto.success,
    meta: dto.meta,
    data: dto.data.map(MapJStudent),
  };
}

export function MapJoinStudent(dto: ApiResponseDTO<JoinStudentDTO>): ApiResponse<StudentJM> {
  return {
    error: dto.error,
    success: dto.success,
    data: MapJStudent(dto.data),
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
  };
}

export function MapGender(dto: GenderDTO): Gender {
  return {
    id: dto.id,
    gender: dto.name,
  };
}

export function MapGResponse(dto: ApiResponseDTOList<GenderDTO>): ApiResponseList<Gender> {
  return {
    count: dto.count,
    error: dto.error,
    success: dto.success,
    meta: dto.meta,
    data: dto.data.map(MapGender),
  };
}

export function MapSResponse(dto: ApiResponseDTO<StudentDTO>): ApiResponse<StudentM> {
  return {
    error: dto.error,
    success: dto.success,
    data: MapStudent(dto.data),
  };
}
