import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Student } from './students/student/student';
import { Course } from './courses/course/course';
import { StudentAdd } from './students/student-add/student-add';
import { StudentEdit } from './students/student-edit/student-edit';
import { StudentDetail } from './students/student-detail/student-detail';
import { CourseAdd } from './courses/course-add/course-add';
import { CourseDetail } from './courses/course-detail/course-detail';
import { AuthGuard } from './auth/auth-guard';
import { RegisterComponent } from './register/register';
import { LoginComponent } from './login/login';
import { App } from './app';
import { AuthShell } from './auth-shell/auth-shell';
import { MainShell } from './main-shell/main-shell';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthShell,
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
    ],
  },
  {
    path: '',
    component: MainShell,
    children: [
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      {
        path: 'students',
        canMatch: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: Student },
          { path: 'new', component: StudentAdd },
          { path: ':id/detail', component: StudentDetail },
        ],
      },
      {
        path: 'courses',
        canMatch: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: Course },
          { path: 'new', component: CourseAdd },
          { path: ':id/detail', component: CourseDetail },
        ],
      },
      { path: '**', redirectTo: 'students' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
