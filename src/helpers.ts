const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const transformDate = (dateInput: string | Date): Date => {
	if (dateInput instanceof Date) {
		return dateInput;
	}

	// If it's a date string like "2025-08-27", convert it to full ISO format
	if (typeof dateInput === "string") {
		// If it's just a date (YYYY-MM-DD), add time to make it a full datetime
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
			return new Date(`${dateInput}T00:00:00.000Z`);
		}

		// If it's already a valid ISO string, parse it
		const parsedDate = new Date(dateInput);
		if (isNaN(parsedDate.getTime())) {
			throw new Error(
				`Invalid date format: ${dateInput}. Expected ISO-8601 DateTime or YYYY-MM-DD format.`
			);
		}
		return parsedDate;
	}

	throw new Error(`Invalid date input: ${dateInput}`);
};

// Helper function to validate and transform earnings data
export const transformEarningsData = (data: any) => {
	const transformed = { ...data };

	// Transform date if present
	if (transformed.date) {
		transformed.date = transformDate(transformed.date);
	}

	// Ensure amount is a number
	if (transformed.amount !== undefined) {
		transformed.amount = Number(transformed.amount);
		if (isNaN(transformed.amount)) {
			throw new Error("Amount must be a valid number");
		}
	}

	return transformed;
};

// Helper function to validate and transform expenses data
export const transformExpensesData = (data: any) => {
	const transformed = { ...data };

	// Transform date if present
	if (transformed.date) {
		transformed.date = transformDate(transformed.date);
	}

	// Ensure amount is a number
	if (transformed.amount !== undefined) {
		transformed.amount = Number(transformed.amount);
		if (isNaN(transformed.amount)) {
			throw new Error("Amount must be a valid number");
		}
	}

	return transformed;
};

export const getMonthDateRange = (month: string) => {
	const currentYear = new Date().getFullYear();
	const monthNumber = parseInt(month, 10);

	const startDate = new Date(currentYear, monthNumber - 1, 1); // First day of month
	const endDate = new Date(currentYear, monthNumber, 0); // Last day of month
	endDate.setHours(23, 59, 59, 999); // Set to end of day

	return { startDate, endDate };
};

export const computedMonthlyBreakdown = (earnings: any, expenses: any) => {
	console.log("earnings", earnings);
	console.log("expenses", expenses);
	let monthlyBreakdown: any[] = [];
	for (const earning of earnings) {
		const month = months[earning.date.getMonth()];
		const monthBreakdown = monthlyBreakdown.find((m) => m.month === month);
		if (monthBreakdown) {
			monthBreakdown.earnings += earning.amount;
		} else {
			monthlyBreakdown.push({
				month,
				earnings: earning.amount,
				expenses: 0,
				net: earning.amount,
				currency: earning.currency,
			});
		}
	}
	for (const expense of expenses) {
		const month = months[expense.date.getMonth()];
		const monthBreakdown = monthlyBreakdown.find((m) => m.month === month);
		if (monthBreakdown) {
			monthBreakdown.expenses += expense.amount;
		} else {
			monthlyBreakdown.push({
				month,
				earnings: 0,
				expenses: expense.amount,
				net: expense.amount,
				currency: expense.currency,
			});
		}
	}
	for (const monthlyBreakdownItem of monthlyBreakdown) {
		monthlyBreakdownItem.net =
			monthlyBreakdownItem.earnings - monthlyBreakdownItem.expenses;
	}

	return monthlyBreakdown;
};
