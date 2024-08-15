import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenuItemButtonComponent } from './add-menu-item-button.component';

describe('AddMenuItemButtonComponent', () => {
	let component: AddMenuItemButtonComponent;
	let fixture: ComponentFixture<AddMenuItemButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AddMenuItemButtonComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(AddMenuItemButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
