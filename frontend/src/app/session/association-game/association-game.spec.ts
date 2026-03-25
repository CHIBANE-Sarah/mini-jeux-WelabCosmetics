import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssociationGameComponent } from './association-game';

describe('AssociationGameComponent', () => {
  let component: AssociationGameComponent;
  let fixture: ComponentFixture<AssociationGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationGameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationGameComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});