export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  joined_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  paid_by: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
  created_by: string;
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  owed_to: string;
};
