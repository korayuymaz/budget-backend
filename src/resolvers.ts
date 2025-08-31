import { PrismaClient } from "@prisma/client";
import {
	transformEarningsData,
	transformExpensesData,
	getMonthDateRange,
	computedMonthlyBreakdown,
} from "./helpers";

const prisma = new PrismaClient();

// Helper function to validate and transform date

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

		earningsMonthly: async (
			_: any,
			{ month, userId }: { month: string; userId: string }
		) => {
			// month should be in format "01", "02", "03", etc.
			// We'll create a date range for the current year and specified month

			const { startDate, endDate } = getMonthDateRange(month);

			let data = await prisma.earnings.findMany({
				orderBy: { date: "desc" },
				where: {
					date: {
						gte: startDate,
						lte: endDate,
					},
					userId: {
						equals: userId,
					},
				},
			});
			return data.map((earning) => ({
				...earning,
				date: earning.date.toISOString() || "",
			}));
		},
		expensesMonthly: async (
			_: any,
			{ month, userId }: { month: string; userId: string }
		) => {
			// month should be in format "01", "02", "03", etc.
			// We'll create a date range for the current year and specified month
			const { startDate, endDate } = getMonthDateRange(month);

			let data = await prisma.expenses.findMany({
				orderBy: { date: "desc" },
				where: {
					date: {
						gte: startDate,
						lte: endDate,
					},
					userId: {
						equals: userId,
					},
				},
			});
			return data.map((expense) => ({
				...expense,
				date: expense.date.toISOString() || "",
			}));
		},

		summary: async (
			_: any,
			{ userId, currency }: { userId: string; currency: string }
		) => {
			const earnings = await prisma.earnings.findMany({
				where: {
					userId,
					date: { gte: new Date(new Date().getFullYear(), 0, 1) },
				},
			});

			const expenses = await prisma.expenses.findMany({
				where: {
					userId,
					date: { gte: new Date(new Date().getFullYear(), 0, 1) },
				},
			});

			const earningsTotal = earnings.reduce(
				(acc, earning) => acc + earning.amount,
				0
			);
			const expensesTotal = expenses.reduce(
				(acc, expense) => acc + expense.amount,
				0
			);
			const net = earningsTotal - expensesTotal;

			const monthlyBreakdown = computedMonthlyBreakdown(earnings, expenses);

			return {
				totalEarnings: earningsTotal,
				totalExpenses: expensesTotal,
				netAmount: net,
				currency: currency,
				monthlyBreakdown: monthlyBreakdown,
			};
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

		updateUser: async (_: any, { user }: any) => {
			return await prisma.user.update({
				where: { id: user.id },
				data: { preferredCurrency: user.preferredCurrency },
			});
		},
	},
};
