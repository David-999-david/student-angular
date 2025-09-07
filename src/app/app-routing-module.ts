import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Student } from './students/student/student';
import { Course } from './courses/course/course';
import { StudentAdd } from './students/student-add/student-add';
import { StudentEdit } from './students/student-edit/student-edit';
import { StudentDetail } from './students/student-detail/student-detail';
import { CourseAdd } from './courses/course-add/course-add';
import { CourseDetail } from './courses/course-detail/course-detail';

const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  {
    path: 'students',
    children: [
      { path: '', component: Student },
      { path: 'new', component: StudentAdd },
      { path: ':id/detail', component: StudentDetail },
    ],
  },
  {
    path: 'courses',
    children: [
      { path: '', component: Course },
      { path: 'new', component: CourseAdd },
      { path: ':id/detail', component: CourseDetail },
    ],
  },
  { path: '**', redirectTo: 'students' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
