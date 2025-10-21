import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailsModalPage } from './project-details-modal.page';

describe('ProjectDetailsModalPage', () => {
  let component: ProjectDetailsModalPage;
  let fixture: ComponentFixture<ProjectDetailsModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
