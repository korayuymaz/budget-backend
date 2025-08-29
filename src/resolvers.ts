import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to validate and transform date
const transformDate = (dateInput: string | Date): Date => {
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
const transformEarningsData = (data: any) => {
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
const transformExpensesData = (data: any) => {
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

export const resolvers = {
	Query: {
		user: async (_: any, { email }: { email: string }) => {
			return prisma.user.findUnique({
				where: { email },
			});
		},
		earnings: async (_: any, { userId }: { userId: string }) => {
			let data = await prisma.earnings.findMany({
				orderBy: { date: "desc" },
				where: { userId },
			});
			return data.map((earning) => ({
				...earning,
				date: earning.date.toISOString() || "",
			}));
		},
		expenses: async (_: any, { userId }: { userId: string }) => {
			let data = await prisma.expenses.findMany({
				orderBy: { date: "desc" },
				where: { userId },
			});
			return data.map((expense) => ({
				...expense,
				date: expense.date.toISOString() || "",
			}));
		},
	},
	Mutation: {
		createUser: async (_: any, { user }: any) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: user.email },
			});
			if (existingUser) {
				throw new Error("User with this email already exists");
			}
			return prisma.user.create({
				data: user,
			});
		},

		createEarnings: async (_: any, { earnings }: any) => {
			try {
				const transformedData = transformEarningsData(earnings);
				return await prisma.earnings.create({
					data: transformedData,
				});
			} catch (error) {
				throw new Error(
					`Failed to create earnings: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		},
		createExpenses: async (_: any, { expenses }: any) => {
			try {
				const transformedData = transformExpensesData(expenses);
				return await prisma.expenses.create({
					data: transformedData,
				});
			} catch (error) {
				throw new Error(
					`Failed to create expenses: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		},
		deleteEarnings: async (_: any, { id }: { id: string }) => {
			const earnings = await prisma.earnings.findUnique({
				where: { id },
			});
			if (!earnings) throw new Error("Earnings not found");

			await prisma.earnings.delete({ where: { id } });
			return true;
		},
		deleteExpenses: async (_: any, { id }: { id: string }) => {
			const expenses = await prisma.expenses.findUnique({
				where: { id },
			});
			if (!expenses) throw new Error("Expenses not found");

			await prisma.expenses.delete({ where: { id } });
			return true;
		},
	},
};
