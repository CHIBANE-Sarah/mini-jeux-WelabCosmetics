import { TestBed } from '@angular/core/testing';

import { Association } from './association';

describe('Association', () => {
  let service: Association;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Association);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
