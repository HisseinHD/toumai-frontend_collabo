import { TestBed } from '@angular/core/testing';

import { Dasboard } from './dasboard';

describe('Dasboard', () => {
  let service: Dasboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dasboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
