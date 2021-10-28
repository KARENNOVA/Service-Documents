import { IAuditTrail } from './../interfaces';

export const newAuditTrail = (token: string = ''): IAuditTrail => {
	if (token === '') {
		let auditTrail: IAuditTrail = {
			created_by: 'UABI',
			created_on: String(new Date().getTime()),
			updated_by: null,
			updated_on: null,
			updated_values: null,
		};
		return auditTrail;
	}
	return {
		created_by: 'UABI',
		created_on: String(new Date().getTime()),
		updated_by: null,
		updated_on: null,
		updated_values: null,
	};
};
