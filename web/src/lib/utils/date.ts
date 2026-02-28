export interface FormattedPythonData {
	dia: number;
	mesAno: string;
	fullDate?: Date;
}

export function parsePythonDate(dateStr: string): FormattedPythonData {
	if (!dateStr) throw new Error('Data vazia?');

	const isoFixed = dateStr.replace(' ', 'T');
	const date = new Date(isoFixed);

	if (isNaN(date.getTime())) {
		throw new Error(`Data iválida do Python ${dateStr}`);
	}

	const dia = date.getDate();
	const mesAno = new Intl.DateTimeFormat('pt-BR', {
		month: 'short',
		year: 'numeric'
	})
		.format(date)
		.replace(' de ', '/')
		.replace('.', '');

	return { dia, mesAno, fullDate: date };
}

export const getDia = (dateStr: string) => parsePythonDate(dateStr).dia;
export const getMesAno = (dateStr: string) => parsePythonDate(dateStr).mesAno;
