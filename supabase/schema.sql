-- Categories table for grouping transactions
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT, -- Lucide React icon name
  bg_color TEXT, -- Tailwind background class
  text_color TEXT, -- Tailwind text color class
  type TEXT CHECK (type IN ('income', 'expense'))
);

-- Initial Category Data matching UI
INSERT INTO categories (name, icon, bg_color, text_color, type) VALUES
('Food & Groceries', 'ShoppingCart', 'bg-primary/10', 'text-primary', 'expense'),
('Education', 'GraduationCap', 'bg-teal-50', 'text-primary', 'expense'),
('Bills & Utilities', 'LayoutGrid', 'bg-slate-100', 'text-[#2B4C5F]', 'expense'),
('Food & Dining', 'Utensils', 'bg-orange-50', 'text-[#2B4C5F]', 'expense'),
('Entertainment', 'Theater', 'bg-purple-50', 'text-[#2B4C5F]', 'expense'),
('Income', 'Wallet', 'bg-cyan-50', 'text-primary', 'income'),
('Electronics', 'Laptop', 'bg-slate-50', 'text-[#2B4C5F]', 'expense');

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT CHECK (type IN ('income', 'expense'))
);

-- Budgets per category
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  target_amount NUMERIC NOT NULL,
  month DATE NOT NULL DEFAULT CURRENT_DATE, -- First day of month
  UNIQUE(category_id, month)
);

-- Financial Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  recommendation TEXT -- AI Suggestion text
);

-- Sample Goal for Dashboard
INSERT INTO goals (name, target_amount, current_amount, recommendation) VALUES
('New Car', 850000, 120000, 'Increase monthly allocation by P2,000.');

-- Enable Row Level Security (RLS) - Basic setup
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Note: You should configure policies for your authenticated users
-- for example: CREATE POLICY "Users can see own category" ON categories FOR SELECT USING (true);
