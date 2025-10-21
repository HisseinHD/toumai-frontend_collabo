import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignMembersModalPage } from './assign-members-modal.page';

describe('AssignMembersModalPage', () => {
  let component: AssignMembersModalPage;
  let fixture: ComponentFixture<AssignMembersModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignMembersModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
