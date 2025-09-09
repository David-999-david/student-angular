import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { map, Observable } from 'rxjs';
import {
  ApiResponse,
  ApiResponseList,
  createS,
  Gender,
  StudentJM,
  StudentM,
  updateS,
} from '../models/student/student.model';
import {
  ApiResponseDTO,
  ApiResponseDTOList,
  GenderDTO,
  JoinStudentDTO,
  StudentDTO,
} from '../models/student/student.dto';
import {
  MapGResponse,
  MapJoinStudent,
  MapJoinStudents,
  MapSResponse,
} from '../models/student/student.mappers';
import { JoinCResultDTO } from '../models/course/course.dto';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  private sBaseUrl = `${environment.apiUrl}/students`;

  fetchAll(q?: string, page?: number): Observable<ApiResponseList<StudentJM>> {
    let httpParmas = new HttpParams();
    if (q && q.trim()) httpParmas = httpParmas.set('q', q.trim());
    if (page) httpParmas = httpParmas.set('p', page.toString());
    return this.http
      .get<ApiResponseDTOList<JoinStudentDTO>>(this.sBaseUrl, { params: httpParmas })
      .pipe(map(MapJoinStudents));
  }

  getSById(id: number): Observable<ApiResponse<StudentJM>> {
    return this.http
      .get<ApiResponseDTO<JoinStudentDTO>>(`${this.sBaseUrl}/${id}`)
      .pipe(map(MapJoinStudent));
  }

  editSById(id: number, student: updateS): Observable<ApiResponse<StudentM>> {
    return this.http
      .put<ApiResponseDTO<StudentDTO>>(`${this.sBaseUrl}/${id}`, student)
      .pipe(map(MapSResponse));
  }

  fetchGender(): Observable<ApiResponseList<Gender>> {
    return this.http
      .get<ApiResponseDTOList<GenderDTO>>(`${this.sBaseUrl}/genders`)
      .pipe(map(MapGResponse));
  }

  create(student: createS): Observable<ApiResponse<StudentM>> {
    return this.http
      .post<ApiResponseDTO<StudentDTO>>(this.sBaseUrl, student)
      .pipe(map(MapSResponse));
  }

  delete(id: number) {
    return this.http.delete(`${this.sBaseUrl}/${id}`);
  }

  joinCourses(id: number, cIds: number[]): Observable<ApiResponse<JoinCResultDTO>> {
    return this.http.post<ApiResponse<JoinCResultDTO>>(`${this.sBaseUrl}/${id}/join`, {
      courseIds: cIds,
    });
  }

  cancelJoinS(sId: number, cId: number) {
    return this.http.delete(`${this.sBaseUrl}/${sId}/join/cancel`, {
      body: { courseId: cId },
    });
  }
}
