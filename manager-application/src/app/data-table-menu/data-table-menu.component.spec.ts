import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableMenuComponent } from './data-table-menu.component';

describe('DataTableMenuComponent', () => {
	let component: DataTableMenuComponent;
	let fixture: ComponentFixture<DataTableMenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DataTableMenuComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(DataTableMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
