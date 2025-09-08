import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Student } from './students/student/student';
import { Course } from './courses/course/course';
import { NgIconsModule } from '@ng-icons/core';
import { heroArchiveBoxXMark, heroArrowPath, heroArrowUturnLeft, heroDocumentPlus, heroMagnifyingGlass, heroMinus, heroPencilSquare, heroPlus, heroUserPlus, heroXMark } from '@ng-icons/heroicons/outline';
import { akarPersonAdd } from '@ng-icons/akar-icons';
import { StudentAdd } from './students/student-add/student-add';
import { StudentEdit } from './students/student-edit/student-edit';
import { StudentDetail } from './students/student-detail/student-detail';
import { CourseAdd } from './courses/course-add/course-add';
import { CourseDetail } from './courses/course-detail/course-detail';

@NgModule({
  declarations: [App, Student, Course, StudentAdd, StudentEdit, StudentDetail, CourseAdd, CourseDetail],
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
      heroMinus
    }),
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
