import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Student } from './student/student';
import { Course } from './course/course';
import { StudentAdd } from './student-add/student-add';

const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  {
    path: 'students',
    children: [
      { path: '', component: Student },
      { path: 'new', component: StudentAdd },
    ],
  },
  { path: 'courses', component: Course },
  { path: '**', redirectTo: 'students' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
