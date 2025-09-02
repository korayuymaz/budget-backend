import { gql } from "apollo-server";

export const typeDefs = gql`
	type User {
		id: ID!
		googleId: String
		name: String
		email: String
		preferredCurrency: String
	}

	type Earnings {
		id: ID!
		description: String
		amount: Float
		currency: String
		date: String
		userId: String
	}

	type Expenses {
		id: ID!
		description: String
		category: String
		amount: Float
		currency: String
		date: String
		userId: String
		isFixed: Boolean
	}
	type MonthlyBreakdown {
		month: String
		earnings: Float
		expenses: Float
		net: Float
		currency: String
	}

	type Summary {
		totalEarnings: Float
		totalExpenses: Float
		netAmount: Float
		currency: String
		monthlyBreakdown: [MonthlyBreakdown]
	}

	input UserInput {
		googleId: String
		name: String
		email: String
		preferredCurrency: String
	}

	input UpdateUserInput {
		id: ID!
		preferredCurrency: String
	}

	input EarningsInput {
		description: String
		amount: Float
		currency: String
		date: String
		userId: String
	}

	input ExpensesInput {
		description: String
		amount: Float
		currency: String
		category: String
		date: String
		userId: String
		isFixed: Boolean
	}

	type Query {
		earnings(userId: ID!): [Earnings]
		expenses(userId: ID!): [Expenses]
		user(email: String!): User
		earningsMonthly(month: String!, userId: ID!): [Earnings]
		expensesMonthly(month: String!, userId: ID!): [Expenses]
		summary(userId: ID!, currency: String!): Summary
		totalBalance(userId: ID!): Float
	}

	type Mutation {
		createUser(user: UserInput!): User!
		createEarnings(earnings: EarningsInput!): Earnings
		createExpenses(expenses: ExpensesInput!): Expenses
		deleteEarnings(id: ID!): Boolean
		deleteExpenses(id: ID!): Boolean
		updateUser(user: UpdateUserInput!): User!
	}
`;
