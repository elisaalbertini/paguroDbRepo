import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMenuItemButtonComponent } from './update-menu-item-button.component';

describe('UpdateMenuItemButtonComponent', () => {
	let component: UpdateMenuItemButtonComponent;
	let fixture: ComponentFixture<UpdateMenuItemButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [UpdateMenuItemButtonComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(UpdateMenuItemButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
