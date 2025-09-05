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
import { MapGResponse, MapJoinStudent, MapJoinStudents, MapSResponse } from '../models/student/student.mappers';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/students`;

  fetchAll(q?: string): Observable<ApiResponseList<StudentJM>> {
    let httpParmas = new HttpParams();
    if (q && q.trim()) httpParmas = httpParmas.set('q', q.trim());
    return this.http
      .get<ApiResponseDTOList<JoinStudentDTO>>(this.baseUrl, { params: httpParmas })
      .pipe(map(MapJoinStudents));
  }

  getSById(id: number): Observable<ApiResponse<StudentJM>> {
    return this.http
    .get<ApiResponseDTO<JoinStudentDTO>>(`${this.baseUrl}/${id}`)
    .pipe(map(MapJoinStudent));
  }

  editSById(id: number, student: updateS): Observable<ApiResponse<StudentM>> {
    return this.http
    .put<ApiResponseDTO<StudentDTO>>(`${this.baseUrl}/${id}`, student)
    .pipe(map(MapSResponse));
  }

  fetchGender(): Observable<ApiResponseList<Gender>> {
    return this.http
      .get<ApiResponseDTOList<GenderDTO>>(`${this.baseUrl}/genders`)
      .pipe(map(MapGResponse));
  }

  create(student: createS): Observable<ApiResponse<StudentM>> {
    return this.http
      .post<ApiResponseDTO<StudentDTO>>(this.baseUrl, student)
      .pipe(map(MapSResponse));
  }
}
