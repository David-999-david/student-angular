import { ApiResponseDTO, ApiResponseDTOList, CourseDTO } from '../student/student.dto';
import { MapCourse, MapStudent } from '../student/student.mappers';
import { ApiResponse, ApiResponseList, CourseM } from '../student/student.model';
import { JoinCourseDTO } from './course.dto';
import { JoinCourseM } from './course.model';

const toDate = (iso: string) => new Date(iso);

export function MapJCourse(dto: JoinCourseDTO): JoinCourseM {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    limit: dto.student_limit,
    current: dto.current_students,
    start_date: toDate(dto.start_date),
    end_date: toDate(dto.end_date),
    createdAt: toDate(dto.created_at),
    students: (dto.students ?? []).map(MapStudent),
  };
}

export function MapJoinCourses(
  dto: ApiResponseDTOList<JoinCourseDTO>
): ApiResponseList<JoinCourseM> {
  return {
    error: dto.error,
    success: dto.success,
    meta: dto.meta,
    data: dto.data.map(MapJCourse),
  };
}

export function MapJoinCourse(dto: ApiResponseDTO<JoinCourseDTO>): ApiResponse<JoinCourseM> {
  return {
    error: dto.error,
    success: dto.success,
    data: MapJCourse(dto.data),
  };
}


export function MapApiCourse(dto: ApiResponseDTO<CourseDTO>): ApiResponse<CourseM> {
  return {
    error: dto.error,
    success: dto.success,
    data: MapCourse(dto.data),
  };
}
