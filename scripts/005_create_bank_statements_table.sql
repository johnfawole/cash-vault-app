-- Create bank_statements table to store file metadata
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  total_transactions INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create bank_transactions table to store parsed transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  transaction_type TEXT, -- 'debit', 'credit', 'expense', 'income'
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_bank_statements_user_email ON bank_statements(user_email);
CREATE INDEX idx_bank_transactions_statement_id ON bank_transactions(statement_id);
CREATE INDEX idx_bank_transactions_user_email ON bank_transactions(user_email);
CREATE INDEX idx_bank_transactions_category ON bank_transactions(category);
