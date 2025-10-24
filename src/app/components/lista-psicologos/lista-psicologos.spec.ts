import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPsicologos } from './lista-psicologos';

describe('ListaPsicologos', () => {
  let component: ListaPsicologos;
  let fixture: ComponentFixture<ListaPsicologos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPsicologos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPsicologos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
