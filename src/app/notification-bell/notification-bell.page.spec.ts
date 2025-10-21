import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationBellPage } from './notification-bell.page';

describe('NotificationBellPage', () => {
  let component: NotificationBellPage;
  let fixture: ComponentFixture<NotificationBellPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationBellPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
