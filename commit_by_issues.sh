#!/bin/bash

REPO_PATH="/Users/truongquocbao/Code/PersonalFinanceManagementApp"
cd $REPO_PATH

git checkout main 2>/dev/null || git checkout master 2>/dev/null

create_branch_and_commit() {
  local branch="$1"
  local commit_msg="$2"
  local folder="$3"

  echo ""
  echo "=== Processing: $commit_msg ==="

  git checkout main 2>/dev/null || git checkout master 2>/dev/null
  git checkout -b "$branch"

  if [ -d "$folder" ]; then
    git add "$folder"
  else
    git add "$folder" 2>/dev/null || echo "No files found: $folder"
  fi

  git commit -m "$commit_msg" --allow-empty
  git push origin "$branch"
  echo "✓ Done: $branch"
}

# === BE-01: Setup monorepo ===
create_branch_and_commit \
  "feature/BE-01-setup-monorepo" \
  "feat: BE-01 Setup monorepo structure" \
  "docker-compose.yml"

# === BE-02: Docker Compose ===
create_branch_and_commit \
  "feature/BE-02-docker-compose" \
  "feat: BE-02 Setup Docker Compose for local development" \
  "docker-compose.yml"

# === BE-04: RabbitMQ ===
create_branch_and_commit \
  "feature/BE-04-rabbitmq" \
  "feat: BE-04 Setup RabbitMQ for message broker" \
  "backend/shared"

# === BE-06: Auth schema ===
create_branch_and_commit \
  "feature/BE-06-auth-schema" \
  "feat: BE-06 Create Auth table schema for sessions" \
  "backend/auth_service"

# === BE-07: User registration ===
create_branch_and_commit \
  "feature/BE-07-user-registration" \
  "feat: BE-07 Implement user registration endpoint (POST /api/auth/register)" \
  "backend/auth_service"

# === BE-08: JWT ===
create_branch_and_commit \
  "feature/BE-08-jwt" \
  "feat: BE-08 Implement JWT token generation and verification" \
  "backend/auth_service"

# === BE-09: Login ===
create_branch_and_commit \
  "feature/BE-09-login" \
  "feat: BE-09 Implement login endpoint (POST /api/auth/login)" \
  "backend/auth_service"

# === BE-17: User Service ===
create_branch_and_commit \
  "feature/BE-17-user-service" \
  "feat: BE-17 Create User Service boilerplate" \
  "backend/user_service"

# === BE-18: Get profile ===
create_branch_and_commit \
  "feature/BE-18-get-profile" \
  "feat: BE-18 Implement get profile endpoint (GET /api/users/profile)" \
  "backend/user_service"

# === BE-19: Update profile ===
create_branch_and_commit \
  "feature/BE-19-update-profile" \
  "feat: BE-19 Implement update profile endpoint (PUT /api/users/profile)" \
  "backend/user_service"

# === BE-21: Account schema ===
create_branch_and_commit \
  "feature/BE-21-account-schema" \
  "feat: BE-21 Create Account table schema" \
  "backend/account_service"

# === BE-22: Create account ===
create_branch_and_commit \
  "feature/BE-22-create-account" \
  "feat: BE-22 Implement create account endpoint (POST /api/accounts)" \
  "backend/account_service"

# === BE-23: List accounts ===
create_branch_and_commit \
  "feature/BE-23-list-accounts" \
  "feat: BE-23 Implement list accounts endpoint (GET /api/accounts)" \
  "backend/account_service"

# === BE-24: Update account ===
create_branch_and_commit \
  "feature/BE-24-update-account" \
  "feat: BE-24 Implement update account endpoint (PUT /api/accounts/:id)" \
  "backend/account_service"

# === BE-25: Delete account ===
create_branch_and_commit \
  "feature/BE-25-delete-account" \
  "feat: BE-25 Implement delete account endpoint (DELETE /api/accounts/:id)" \
  "backend/account_service"

# === BE-26: Total balance ===
create_branch_and_commit \
  "feature/BE-26-total-balance" \
  "feat: BE-26 Implement total balance endpoint (GET /api/accounts/total-balance)" \
  "backend/account_service"

# === BE-27: RabbitMQ Account ===
create_branch_and_commit \
  "feature/BE-27-rabbitmq-account" \
  "feat: BE-27 Setup RabbitMQ consumer in Account Service" \
  "backend/account_service"

# === BE-28: Category table ===
create_branch_and_commit \
  "feature/BE-28-category-schema" \
  "feat: BE-28 Create Category table with system categories" \
  "backend/category_service"

# === BE-29: List categories ===
create_branch_and_commit \
  "feature/BE-29-list-categories" \
  "feat: BE-29 Implement list categories endpoint (GET /api/categories)" \
  "backend/category_service"

# === BE-30: Create category ===
create_branch_and_commit \
  "feature/BE-30-create-category" \
  "feat: BE-30 Implement create category endpoint (POST /api/categories)" \
  "backend/category_service"

# === BE-31: Update category ===
create_branch_and_commit \
  "feature/BE-31-update-category" \
  "feat: BE-31 Implement update category endpoint (PUT /api/categories/:id)" \
  "backend/category_service"

# === BE-32: Delete category ===
create_branch_and_commit \
  "feature/BE-32-delete-category" \
  "feat: BE-32 Implement delete category endpoint (DELETE /api/categories/:id)" \
  "backend/category_service"

# === BE-33: Transaction schema ===
create_branch_and_commit \
  "feature/BE-33-transaction-schema" \
  "feat: BE-33 Create Transaction table schema" \
  "backend/transaction_service"

# === BE-34: Create transaction ===
create_branch_and_commit \
  "feature/BE-34-create-transaction" \
  "feat: BE-34 Implement create transaction endpoint (POST /api/transactions)" \
  "backend/transaction_service"

# === BE-35: List transactions ===
create_branch_and_commit \
  "feature/BE-35-list-transactions" \
  "feat: BE-35 Implement list transactions with filters (GET /api/transactions)" \
  "backend/transaction_service"

# === BE-36: Get transaction ===
create_branch_and_commit \
  "feature/BE-36-get-transaction" \
  "feat: BE-36 Implement get transaction detail (GET /api/transactions/:id)" \
  "backend/transaction_service"

# === BE-37: Update transaction ===
create_branch_and_commit \
  "feature/BE-37-update-transaction" \
  "feat: BE-37 Implement update transaction endpoint (PUT /api/transactions/:id)" \
  "backend/transaction_service"

# === BE-38: Delete transaction ===
create_branch_and_commit \
  "feature/BE-38-delete-transaction" \
  "feat: BE-38 Implement delete transaction endpoint (DELETE /api/transactions/:id)" \
  "backend/transaction_service"

# === BE-40: RabbitMQ Transaction ===
create_branch_and_commit \
  "feature/BE-40-rabbitmq-transaction" \
  "feat: BE-40 Setup RabbitMQ event publisher in Transaction Service" \
  "backend/transaction_service"

# === BE-41: Publish created event ===
create_branch_and_commit \
  "feature/BE-41-publish-created" \
  "feat: BE-41 Publish transaction.created event" \
  "backend/transaction_service"

# === BE-42: Publish updated event ===
create_branch_and_commit \
  "feature/BE-42-publish-updated" \
  "feat: BE-42 Publish transaction.updated event" \
  "backend/transaction_service"

# === BE-43: Publish deleted event ===
create_branch_and_commit \
  "feature/BE-43-publish-deleted" \
  "feat: BE-43 Publish transaction.deleted event" \
  "backend/transaction_service"

# === BE-44-45-46: Handle events ===
create_branch_and_commit \
  "feature/BE-44-handle-created-event" \
  "feat: BE-44 Handle transaction.created event to update balance" \
  "backend/account_service"

create_branch_and_commit \
  "feature/BE-45-handle-updated-event" \
  "feat: BE-45 Handle transaction.updated event to recalculate balance" \
  "backend/account_service"

create_branch_and_commit \
  "feature/BE-46-handle-deleted-event" \
  "feat: BE-46 Handle transaction.deleted event to rollback balance" \
  "backend/account_service"

# === BE-57-58-59: API Gateway ===
create_branch_and_commit \
  "feature/BE-57-api-gateway" \
  "feat: BE-57 Setup API Gateway with Express Gateway" \
  "backend/gateway"

create_branch_and_commit \
  "feature/BE-58-routing" \
  "feat: BE-58 Configure routing to all microservices" \
  "backend/gateway"

create_branch_and_commit \
  "feature/BE-59-jwt-gateway" \
  "feat: BE-59 Implement JWT verification in API Gateway" \
  "backend/gateway"

# === BE-68-69-70-71: Analytics ===
create_branch_and_commit \
  "feature/BE-68-analytics-schema" \
  "feat: BE-68 Design MongoDB schema for analytics service" \
  "backend/analytics_service"

create_branch_and_commit \
  "feature/BE-69-connect-analytics" \
  "feat: BE-69 Connect Analytics service successfull" \
  "backend/analytics_service"

create_branch_and_commit \
  "feature/BE-70-seed-analytics" \
  "feat: BE-70 Create data seed analytics service" \
  "backend/analytics_service"

create_branch_and_commit \
  "feature/BE-71-analytics-endpoint" \
  "feat: BE-71 Implement get user analytics transaction (GET api/analytics/)" \
  "backend/analytics_service"

# === BE-73-79: Budget ===
create_branch_and_commit \
  "feature/BE-73-budget-service" \
  "feat: BE-73 Add budget service" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-74-budget-schema" \
  "feat: BE-74 Create table budget schema" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-75-create-budget" \
  "feat: BE-75 Implement create budget endpoint (GET /api/budgets)" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-76-get-budget" \
  "feat: BE-76 Implement get budget endpoint (GET /api/budgets/:id)" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-77-post-budget" \
  "feat: BE-77 Implement create budget endpoint (POST /api/budgets)" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-78-update-budget" \
  "feat: BE-78 Implement update budget endpoint (PUT /api/budgets/:id)" \
  "backend/budget_service"

create_branch_and_commit \
  "feature/BE-79-delete-budget" \
  "feat: BE-79 Implement delete budget endpoint (DELETE /api/budgets/:id)" \
  "backend/budget_service"

# === BE-90: Notification ===
create_branch_and_commit \
  "feature/BE-90-notification" \
  "feat: BE-90 Notification Service" \
  "backend/notification_service"

# === BE-93-95: gRPC ===
create_branch_and_commit \
  "feature/BE-93-grpc-account" \
  "feat: BE-93 Setup gRPC Account Service" \
  "backend/account_service"

create_branch_and_commit \
  "feature/BE-94-grpc-category" \
  "feat: BE-94 Setup gRPC Category Service" \
  "backend/category_service"

create_branch_and_commit \
  "feature/BE-95-grpc-transaction" \
  "feat: BE-95 Setup gRPC call from Transaction Service" \
  "backend/transaction_service"

# === BE-96-97: Analytics events ===
create_branch_and_commit \
  "feature/BE-96-analytics-created" \
  "feat: BE-96 Handle event transaction.created Analytics Service" \
  "backend/analytics_service"

create_branch_and_commit \
  "feature/BE-97-analytics-updated" \
  "feat: BE-97 Handle event transaction.updated Analytics Service" \
  "backend/analytics_service"

# === BE-99-101: AI Service ===
create_branch_and_commit \
  "feature/BE-99-ai-setup" \
  "feat: BE-99 AI Service setup" \
  "backend/ai_service"

create_branch_and_commit \
  "feature/BE-100-ai-supabase" \
  "feat: BE-100 Fix AI Service connect Supabase" \
  "backend/ai_service"

create_branch_and_commit \
  "feature/BE-101-run-ai" \
  "feat: BE-101 Run AI Service" \
  "backend/ai_service"

# === FE branches ===
create_branch_and_commit \
  "feature/FE-01-config-fe" \
  "feat: FE-01 Config FE for call API from gateway" \
  "frontend"

create_branch_and_commit \
  "feature/FE-03-auth-fe" \
  "feat: FE-03 Auth FE" \
  "frontend"

create_branch_and_commit \
  "feature/FE-04-user-fe" \
  "feat: FE-04 User FE" \
  "frontend"

create_branch_and_commit \
  "feature/FE-05-account-fe" \
  "feat: FE-05 Account FE" \
  "frontend"

create_branch_and_commit \
  "feature/FE-06-category-fe" \
  "feat: FE-06 Category FE" \
  "frontend"

create_branch_and_commit \
  "feature/FE-07-transaction-fe" \
  "feat: FE-07 Transaction FE" \
  "frontend"

create_branch_and_commit \
  "feature/FE-08-analytics-fe" \
  "feat: FE-08 Analytics FE" \
  "frontend"

git checkout main 2>/dev/null || git checkout master 2>/dev/null
echo ""
echo "=== DONE! Tất cả branches và commits đã được tạo 🎉 ==="
echo "Vào GitHub tạo PR cho từng branch rồi merge vào main nhé!"