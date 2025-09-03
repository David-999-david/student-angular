import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse, StudentM } from '../models/student/student.model';
import { ApiResponseDTO, StudentDTO } from '../models/student/student.dto';
import { MapJoinStudent } from '../models/student/student.mappers';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/students`;

  fetchAll(q?: string): Observable<ApiResponse<StudentM>> {
    let httpParmas = new HttpParams();
    if (q && q.trim()) httpParmas = httpParmas.set('q', q.trim());
    return this.http
      .get<ApiResponseDTO<StudentDTO>>(this.baseUrl, { params: httpParmas })
      .pipe(map(MapJoinStudent));
  }
}
