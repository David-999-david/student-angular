import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAdd } from './course-add';

describe('CourseAdd', () => {
  let component: CourseAdd;
  let fixture: ComponentFixture<CourseAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
