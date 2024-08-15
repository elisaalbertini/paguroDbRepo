import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestockButtonComponent } from './restock-button.component';

describe('DeleteButtonComponent', () => {
	let component: RestockButtonComponent;
	let fixture: ComponentFixture<RestockButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RestockButtonComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(RestockButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
