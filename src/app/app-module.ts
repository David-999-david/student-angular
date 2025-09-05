import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Student } from './students/student/student';
import { Course } from './course/course';
import { NgIconsModule } from '@ng-icons/core';
import { heroArchiveBoxXMark, heroArrowPath, heroMagnifyingGlass, heroPencilSquare, heroPlus, heroUserPlus } from '@ng-icons/heroicons/outline';
import { akarPersonAdd } from '@ng-icons/akar-icons';
import { StudentAdd } from './students/student-add/student-add';
import { StudentEdit } from './students/student-edit/student-edit';
import { StudentDetail } from './students/student-detail/student-detail';

@NgModule({
  declarations: [App, Student, Course, StudentAdd, StudentEdit, StudentDetail],
  imports: [
    BrowserModule,
    NgIconsModule.withIcons({
      heroMagnifyingGlass,
      heroPlus,
      heroPencilSquare,
      akarPersonAdd,
      heroUserPlus,
      heroArchiveBoxXMark,
      heroArrowPath
    }),
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
