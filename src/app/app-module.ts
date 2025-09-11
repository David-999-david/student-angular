import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Student } from './students/student/student';
import { Course } from './courses/course/course';
import { NgIconsModule } from '@ng-icons/core';
import {
  heroArchiveBoxXMark,
  heroArrowPath,
  heroArrowUturnLeft,
  heroDocumentPlus,
  heroMagnifyingGlass,
  heroMinus,
  heroPencilSquare,
  heroPlus,
  heroUserPlus,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { akarPersonAdd } from '@ng-icons/akar-icons';
import { StudentAdd } from './students/student-add/student-add';
import { StudentEdit } from './students/student-edit/student-edit';
import { StudentDetail } from './students/student-detail/student-detail';
import { CourseAdd } from './courses/course-add/course-add';
import { CourseDetail } from './courses/course-detail/course-detail';
import { DialogModule } from '@angular/cdk/dialog';
import { ConfirmDialog } from './ui/confirm-dialog/confirm-dialog';
import { AuthInterceptorProvider } from './auth/auth-interceptor';
import { RegisterComponent } from './register/register';
import { LoginComponent } from './login/login';
import { AuthShell } from './auth-shell/auth-shell';
import { MainShell } from './main-shell/main-shell';

@NgModule({
  declarations: [
    App,
    Student,
    Course,
    StudentAdd,
    StudentEdit,
    StudentDetail,
    CourseAdd,
    CourseDetail,
    ConfirmDialog,
    RegisterComponent,
    LoginComponent,
    AuthShell,
    MainShell,
  ],
  imports: [
    BrowserModule,
    NgIconsModule.withIcons({
      heroMagnifyingGlass,
      heroPlus,
      heroPencilSquare,
      akarPersonAdd,
      heroUserPlus,
      heroArchiveBoxXMark,
      heroArrowPath,
      heroDocumentPlus,
      heroArrowUturnLeft,
      heroXMark,
      heroMinus,
    }),
    AppRoutingModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    AuthInterceptorProvider,
  ],
  bootstrap: [App],
})
export class AppModule {}
