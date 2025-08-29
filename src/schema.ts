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
		amount: Float
		currency: String
		date: String
		userId: String
		isFixed: Boolean
	}

	input UserInput {
		googleId: String
		name: String
		email: String
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
		date: String
		userId: String
		isFixed: Boolean
	}

	type Query {
		earnings(userId: ID!): [Earnings]
		expenses(userId: ID!): [Expenses]
		user(email: String!): User
	}

	type Mutation {
		createUser(user: UserInput!): User!
		createEarnings(earnings: EarningsInput!): Earnings
		createExpenses(expenses: ExpensesInput!): Expenses
		deleteEarnings(id: ID!): Boolean
		deleteExpenses(id: ID!): Boolean
	}
`;
