-- USERS (Domain)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(100),
    email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACCOUNT
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    account_name VARCHAR(100),
    type VARCHAR(50),
    balance DECIMAL(15,2),
    currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORY
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    category_name VARCHAR(100),
    type VARCHAR(50),
    icon VARCHAR(100),
    color VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRANSACTION
CREATE TABLE transactions (
    trans_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    category_id UUID REFERENCES categories(category_id),
    amount DECIMAL(15,2),
    transaction_type VARCHAR(50),
    description VARCHAR(255),
    date DATE,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (user_id, user_name, email)
VALUES
('5324c950-d209-44b7-9e1b-2c3d859a17af', 'Bảo', 'bao0704@gmail.com'),
('e67f2863-5f03-4dff-b247-478b140ab6c4', 'Tâm', 'tamthan@gmail.com'),
('cd83a6d0-8422-417d-845f-f9633cd6099e', 'Phúc', 'phuc0312@gmail.com'),
('901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Đạt', 'dat1607@gmail.com');


INSERT INTO accounts (account_id, user_id, account_name, type, balance, currency)
VALUES
('e8217da4-46b7-434f-ba84-69aab89f0dd0', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Bank', 'bank', 500000, 'VND'),
('7dc770af-615f-48a7-9c24-8baa3caf5571', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Tiền mặt', 'cash', 100000, 'VND'),
('e5217da4-46b7-434f-ba84-69aab89f0dd2', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Momo', 'ewallet', 600000, 'VND'),

('a534f72c-cac3-4387-8ec6-358438385953', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'Tiền mặt', 'cash', 80000, 'VND'),
('a834f72c-cac3-4387-8ec6-358438385954', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'ACB Bank', 'bank', 300000, 'VND'),
('a934f72c-cac3-4387-8ec6-358438385955', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'VCB', 'credit', 300000, 'VND'),

('92408ebb-8c11-4bdf-a008-8ad2fcbc3686', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'Tiền mặt', 'cash', 120000, 'VND'),
('93408ebb-8c11-4bdf-a008-8ad2fcbc3687', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'ViettinBank', 'bank', 3200000, 'VND'),

('d722044d-7259-4a95-9a9f-930935073828', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Tiền mặt', 'cash', 60000, 'VND'),
('d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'TP Bank', 'bank', 200000, 'VND'),
('d922044d-7259-4a95-9a9f-930935073821', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'MB Bank', 'bank', 700000, 'VND');

INSERT INTO categories (category_id, user_id, category_name, type, icon, color, is_system)
VALUES

('d8588605-fa23-4b66-a81a-babc39f54ab8', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Salary', 'income', '💰', 'green', FALSE),
('970eb25c-2af8-44f3-a762-a4b9a218668e', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Food', 'expense', '🍔', 'red', FALSE),
('7b926e06-f682-4e15-a412-554daa9b012d', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Transport', 'expense', '🚗', 'blue', FALSE),
('87880d53-4827-4f06-8b0c-9c62de6692d9', '5324c950-d209-44b7-9e1b-2c3d859a17af', 'Shopping', 'expense', '🛍️', 'purple', FALSE),

('9dec18f6-2f93-4ee9-a402-9e6ae2cce8f8', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'Freelance', 'income', '💻', 'green', FALSE),
('13a008d9-04c7-498f-9557-8dcbed643cb1', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'Coffee', 'expense', '☕', 'brown', FALSE),
('bc0f56d8-1a77-4024-93d8-ae709d297cc7', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'Gaming', 'expense', '🎮', 'black', FALSE),
('1117481a-dd27-4615-9201-9a1cfec45c0e', 'e67f2863-5f03-4dff-b247-478b140ab6c4', 'Bills', 'expense', '📄', 'orange', FALSE),

('18af69dc-a994-4213-aef1-a0c3e51ce711', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'Salary', 'income', '📈', 'green', FALSE),
('c8798f26-d478-4bd7-a1bc-7335850d8dd0', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'Food', 'expense', '🍜', 'red', FALSE),
('a7b488f0-14bb-4fb0-9aff-3296ebd9ec9b', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'Travel', 'expense', '✈️', 'blue', FALSE),
('d990a4a7-a436-4a6c-895e-0e71c2bbe88e', 'cd83a6d0-8422-417d-845f-f9633cd6099e', 'Shopping', 'expense', '🛍️', 'purple', FALSE),

('cf4dfdab-3dda-4ae1-a1b2-09364b6c5d01', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Salary', 'income', '🎁', 'green', FALSE),
('c6e31bec-9e96-4981-832d-e8a38feaa9e6', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Transport', 'expense', '🚕', 'blue', FALSE),
('615b0d7a-5ace-4297-a404-0d67b7b0087a', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Food', 'expense', '🍕', 'red', FALSE),
('9b870dba-7323-4dfe-9da5-54dfef366f52', '901ce87f-db7d-4ab2-a644-5b529b8a790b', 'Entertainment', 'expense', '🎬', 'pink', FALSE);