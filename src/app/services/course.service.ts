import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse, ApiResponseList, CourseM } from '../models/student/student.model';
import { JoinCourseDTO } from '../models/course/course.dto';
import { ApiResponseDTO, ApiResponseDTOList, CourseDTO } from '../models/student/student.dto';
import { createC, JoinCourseM, updateC } from '../models/course/course.model';
import { MapJCourse, MapJoinCourse, MapJoinCourses } from '../models/course/course.mappers';
import { MapApiCourse, MapCourse } from '../models/student/student.mappers';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private cBaseUrl = `${environment.apiUrl}/courses`;
  private http = inject(HttpClient);

  fetchAllC(q: string, page: number): Observable<ApiResponseList<JoinCourseM>> {
    let httpParmas = new HttpParams();
    if (q && q.trim()) httpParmas = httpParmas.set('q', q.trim());
    if (page) httpParmas = httpParmas.set('p', page.toString());
    return this.http
      .get<ApiResponseDTOList<JoinCourseDTO>>(this.cBaseUrl, { params: httpParmas })
      .pipe(map(MapJoinCourses));
  }

  createC(course: createC): Observable<ApiResponse<CourseM>> {
    return this.http.post<ApiResponseDTO<CourseDTO>>(this.cBaseUrl, course).pipe(map(MapApiCourse));
  }

  getIdC(id: number): Observable<ApiResponse<JoinCourseM>> {
    return this.http
      .get<ApiResponseDTO<JoinCourseDTO>>(`${this.cBaseUrl}/${id}`)
      .pipe(map(MapJoinCourse));
  }

  updateC(id: number, course: updateC): Observable<ApiResponse<CourseM>> {
    return this.http
      .put<ApiResponseDTO<CourseDTO>>(`${this.cBaseUrl}/${id}`, course)
      .pipe(map(MapApiCourse));
  }

  deleteC(id: number) {
    return this.http.delete(`${this.cBaseUrl}/${id}`);
  }
}
