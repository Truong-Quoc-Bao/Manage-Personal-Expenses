#!/bin/bash

REPO="Truong-Quoc-Bao/Manage-Personal-Expenses"

echo "=== Xóa tất cả issues cũ ==="
gh issue list --repo $REPO --state all --limit 200 --json number --jq '.[].number' | while read number; do
  gh issue delete $number --repo $REPO --yes
  echo "Deleted #$number"
done

echo ""
echo "=== Tạo Labels ==="
gh label create "Critical" --color "D73A4A" --repo $REPO 2>/dev/null
gh label create "High" --color "E4A853" --repo $REPO 2>/dev/null
gh label create "Analytics" --color "0075CA" --repo $REPO 2>/dev/null
gh label create "Auth" --color "7057FF" --repo $REPO 2>/dev/null
gh label create "Transaction" --color "008672" --repo $REPO 2>/dev/null
gh label create "feature" --color "A2EEEF" --repo $REPO 2>/dev/null
gh label create "security" --color "E4E669" --repo $REPO 2>/dev/null

echo ""
echo "=== Tạo CLOSED issues ==="

create_closed() {
  local title="$1"
  local url
  url=$(gh issue create --repo "$REPO" --title "$title" --body "$title" 2>&1 | grep -o 'https://github.com[^ ]*')
  if [ -n "$url" ]; then
    local number
    number=$(echo "$url" | grep -o '[0-9]*$')
    gh issue close "$number" --repo "$REPO"
    echo "✓ Closed: $title"
  else
    echo "✗ Failed: $title"
  fi
}

# CLOSED - từ ảnh closed issues
create_closed "#BE-01 Setup monorepo structure"
create_closed "#BE-02 Setup Docker Compose for local development"
create_closed "#BE-03 Setup Supabase schema databases for each service"
create_closed "#BE-04 Setup RabbitMQ for message broker"
create_closed "#BE-05 Create User table schema"
create_closed "#BE-06 Create Auth table schema for sessions"
create_closed "#BE-07 Implement user registration endpoint (POST /api/auth/register)"
create_closed "#BE-08 Implement JWT token generation and verification"
create_closed "#BE-09 Implement login endpoint (POST /api/auth/login)"
create_closed "#BE-14 Add password strength validation"
create_closed "#BE-17 Create User Service boilerplate"
create_closed "#BE-18 Implement get profile endpoint (GET /api/users/profile)"
create_closed "#BE-19 Implement update profile endpoint (PUT /api/users/profile)"
create_closed "#BE-21 Create Account table schema"
create_closed "#BE-22 Implement create account endpoint (POST /api/accounts)"
create_closed "#BE-23 Implement list accounts endpoint (GET /api/accounts)"
create_closed "#BE-24 Implement update account endpoint (PUT /api/accounts/:id)"
create_closed "#BE-25 Implement delete account endpoint (DELETE /api/accounts/:id)"
create_closed "#BE-26 Implement total balance endpoint (GET /api/accounts/total-balance)"
create_closed "#BE-27 Setup RabbitMQ consumer in Account Service"
create_closed "#BE-28 Create Category table with system categories"
create_closed "#BE-29 Implement list categories endpoint (GET /api/categories)"
create_closed "#BE-30 Implement create category endpoint (POST /api/categories)"
create_closed "#BE-31 Implement update category endpoint (PUT /api/categories/:id)"
create_closed "#BE-32 Implement delete category endpoint (DELETE /api/categories/:id)"
create_closed "#BE-33 Create Transaction table schema"
create_closed "#BE-34 Implement create transaction endpoint (POST /api/transactions)"
create_closed "#BE-35 Implement list transactions with filters (GET /api/transactions)"
create_closed "#BE-36 Implement get transaction detail (GET /api/transactions/:id)"
create_closed "#BE-37 Implement update transaction endpoint (PUT /api/transactions/:id)"
create_closed "#BE-38 Implement delete transaction endpoint (DELETE /api/transactions/:id)"
create_closed "#BE-40 Setup RabbitMQ event publisher in Transaction Service"
create_closed "#BE-41 Publish transaction.created event"
create_closed "#BE-42 Publish transaction.updated event"
create_closed "#BE-43 Publish transaction.deleted event"
create_closed "#BE-44 Handle transaction.created event to update balance"
create_closed "#BE-45 Handle transaction.updated event to recalculate balance"
create_closed "#BE-46 Handle transaction.deleted event to rollback balance"
create_closed "#BE-57 Setup API Gateway with Express Gateway"
create_closed "#BE-58 Configure routing to all microservices"
create_closed "#BE-59 Implement JWT verification in API Gateway"
create_closed "#BE-61 Configure CORS for frontend"
create_closed "#BE-63 Create seed data"
create_closed "#BE-64 Validate data API category service"
create_closed "#BE-65 Validate data API user service"
create_closed "#BE-66 Validate data API account service"
create_closed "#BE-67 Add frontend and run successfully"
create_closed "#BE-68 Design MongoDB schema for analytics service"
create_closed "#BE-69 Connect Analytics service successfull"
create_closed "#BE-70 Create data seed analytics service"
create_closed "#BE-71 Implement get user analytics transaction (GET api/analytics/)"
create_closed "#BE-72 Implement colunm user_id into transactions table"
create_closed "#BE-73 Add budget service"
create_closed "#BE-74 Create table budget schema"
create_closed "#BE-75 Implement create budget endpoint (GET /api/budgets)"
create_closed "#BE-76 Implement get budget endpoint (GET /api/budgets/:id)"
create_closed "#BE-77 Implement create budget endpoint (POST /api/budgets)"
create_closed "#BE-78 Implement update budget endpoint (PUT /api/budgets/:id)"
create_closed "#BE-79 Implement delete budget endpoint (DELETE /api/budgets/:id)"
create_closed "#BE-80 Implement General More DataMongo"
create_closed "#BE-81 Validate Data Constraints"
create_closed "#BE-82 GET API Service — anomaly_logs"
create_closed "#BE-83 GET API Service — category_summary"
create_closed "#BE-83 GET API Service — monthly_reports"
create_closed "#BE-84 GET API Service — dashboard_cache"
create_closed "#BE-85 GET API Service — spending_trends"
create_closed "#BE-86 Add anomaly_logs function"
create_closed "#BE-87 Add category_summary function"
create_closed "#BE-88 dashboard_cache function"
create_closed "#BE-88 monthly_reports function"
create_closed "#BE-89 spending_trends function"
create_closed "#BE-90 Notification Service"
create_closed "#BE-91 Fix data seed analytics service"
create_closed "#BE-92 Fix Budget Service add fields and create migration"
create_closed "#BE-93 Setup gRPC Account Service"
create_closed "#BE-94 Setup gRPC Category Service"
create_closed "#BE-95 Setup gRPC call from Transaction Service"
create_closed "#BE-96 Handle event transaction.created Analytics Service"
create_closed "#BE-97 Handle event transaction.updated Analytics Service"
create_closed "#BE-98 Fix bug not find module shared/rabbitClient User Service"
create_closed "#BE-99 AI Service setup"
create_closed "#BE-100 Fix AI Service connect Supabase"
create_closed "#BE-101 Run AI Service"
create_closed "#BE-103 Fix add controller update transaction endpoint"
create_closed "#BE-103 Fix add controller transaction update endpoint"
create_closed "#BE-105 Implement Analytics Service update transaction"
create_closed "#BE-106 Fix Transaction Model date time"
create_closed "#BE-106 Apply grpc analytics update"
create_closed "#BE-107 Check AI Action"
create_closed "#BE-108 AI Service Sucessfull"
create_closed "#BE-109 Check run Analytics Service event"
create_closed "#BE-110 Fix and cover all Seminar 2"
create_closed "#BE-111 Fix run and cover all seminal v2"
create_closed "#README-01 Update readme how to run project"
create_closed "#FE-01 Config FE for call API from gateway"
create_closed "#FE-02 Setup Dockerfile and Docker Compose for FE"
create_closed "#FE-03 Auth FE"
create_closed "#FE-04 User FE"
create_closed "#FE-05 Account FE"
create_closed "#FE-06 Category FE"
create_closed "#FE-07 Transaction FE"
create_closed "#FE-08 Analytics FE"
create_closed "#FE-09 Fix transaction FE"

echo ""
echo "=== Tạo OPEN issues ==="

# OPEN - từ ảnh open issues
gh issue create --repo "$REPO" --title "#BE-10 Implement logout endpoint (POST /api/auth/logout)" --label "High,Auth,feature" --body "#BE-10 Implement logout endpoint (POST /api/auth/logout)"
echo "✓ Open: #BE-10"

gh issue create --repo "$REPO" --title "#BE-11 Implement refresh token endpoint (POST /api/auth/refresh)" --label "High,Auth,feature" --body "#BE-11 Implement refresh token endpoint (POST /api/auth/refresh)"
echo "✓ Open: #BE-11"

gh issue create --repo "$REPO" --title "#BE-12 Implement forgot password endpoint (POST /api/auth/forgot-password)" --label "High,Auth,feature" --body "#BE-12 Implement forgot password endpoint (POST /api/auth/forgot-password)"
echo "✓ Open: #BE-12"

gh issue create --repo "$REPO" --title "#BE-13 Implement reset password endpoint (POST /api/auth/reset-password)" --label "High,Auth,feature" --body "#BE-13 Implement reset password endpoint (POST /api/auth/reset-password)"
echo "✓ Open: #BE-13"

gh issue create --repo "$REPO" --title "#BE-15: Add rate limiting for login attempts" --label "High,Auth,security" --body "#BE-15: Add rate limiting for login attempts"
echo "✓ Open: #BE-15"

gh issue create --repo "$REPO" --title "#BE-16 Setup email service (SendGrid/Nodemailer)" --label "High,feature" --body "#BE-16 Setup email service (SendGrid/Nodemailer)"
echo "✓ Open: #BE-16"

gh issue create --repo "$REPO" --title "#BE-20 Implement change password endpoint (PUT /api/users/change-password)" --label "High,feature" --body "#BE-20 Implement change password endpoint (PUT /api/users/change-password)"
echo "✓ Open: #BE-20"

gh issue create --repo "$REPO" --title "#BE-39 Implement search transactions (GET /api/transactions/search)" --label "Critical,Transaction,feature" --body "#BE-39 Implement search transactions (GET /api/transactions/search)"
echo "✓ Open: #BE-39"

gh issue create --repo "$REPO" --title "#BE-47 Create database triggers for balance backup" --label "Critical,feature" --body "#BE-47 Create database triggers for balance backup"
echo "✓ Open: #BE-47"

gh issue create --repo "$REPO" --title "#BE-48 Create Analytics schema" --label "Critical,Analytics,feature" --body "#BE-48 Create Analytics schema"
echo "✓ Open: #BE-48"

gh issue create --repo "$REPO" --title "#BE-49 Setup RabbitMQ consumer in Analytics Service" --label "Critical,Analytics,feature" --body "#BE-49 Setup RabbitMQ consumer in Analytics Service"
echo "✓ Open: #BE-49"

gh issue create --repo "$REPO" --title "#BE-50 Handle transaction events to update analytics" --label "Critical,Analytics,feature" --body "#BE-50 Handle transaction events to update analytics"
echo "✓ Open: #BE-50"

gh issue create --repo "$REPO" --title "#BE-51 Implement summary endpoint (GET /api/analytics/summary)" --label "Critical,Analytics,feature" --body "#BE-51 Implement summary endpoint (GET /api/analytics/summary)"
echo "✓ Open: #BE-51"

gh issue create --repo "$REPO" --title "#BE-52 Implement category breakdown (GET /api/analytics/by-category)" --label "Critical,Analytics,feature" --body "#BE-52 Implement category breakdown (GET /api/analytics/by-category)"
echo "✓ Open: #BE-52"

gh issue create --repo "$REPO" --title "#BE-53 Implement account breakdown (GET /api/analytics/by-account)" --label "Critical,Analytics,feature" --body "#BE-53 Implement account breakdown (GET /api/analytics/by-account)"
echo "✓ Open: #BE-53"

gh issue create --repo "$REPO" --title "#BE-54 Implement period comparison (GET /api/analytics/comparison)" --label "Critical,Analytics,feature" --body "#BE-54 Implement period comparison (GET /api/analytics/comparison)"
echo "✓ Open: #BE-54"

gh issue create --repo "$REPO" --title "#BE-55 Implement trends endpoint (GET /api/analytics/trends)" --label "Critical,Analytics,feature" --body "#BE-55 Implement trends endpoint (GET /api/analytics/trends)"
echo "✓ Open: #BE-55"

gh issue create --repo "$REPO" --title "#BE-56 Implement top categories (GET /api/analytics/top-categories)" --label "Critical,Analytics,feature" --body "#BE-56 Implement top categories (GET /api/analytics/top-categories)"
echo "✓ Open: #BE-56"

gh issue create --repo "$REPO" --title "#BE-60 Implement rate limiting in API Gateway" --label "High,feature" --body "#BE-60 Implement rate limiting in API Gateway"
echo "✓ Open: #BE-60"

gh issue create --repo "$REPO" --title "#BE-62 Create health check endpoint" --label "High,feature" --body "#BE-62 Create health check endpoint"
echo "✓ Open: #BE-62"

gh issue create --repo "$REPO" --title "#BE-104 Fix add controller update transaction endpoint" --label "Critical,Transaction,feature" --body "#BE-104 Fix add controller update transaction endpoint"
echo "✓ Open: #BE-104"

gh issue create --repo "$REPO" --title "#BE-111 Fix and cover all Seminar v2" --label "Critical,feature" --body "#BE-111 Fix and cover all Seminar v2"
echo "✓ Open: #BE-111"

gh issue create --repo "$REPO" --title "#BE-111 Fix and cover all Serminal v2" --label "Critical,feature" --body "#BE-111 Fix and cover all Serminal v2"
echo "✓ Open: #BE-111 Serminal"

echo ""
echo "=== DONE! Tất cả issues đã được tạo 🎉 ==="