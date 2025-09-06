import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponseList } from '../models/student/student.model';
import { JoinCourseDTO } from '../models/course/course.dto';
import { ApiResponseDTOList } from '../models/student/student.dto';
import { JoinCourseM } from '../models/course/course.model';
import { MapJoinCourses } from '../models/course/course.mappers';

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
}
