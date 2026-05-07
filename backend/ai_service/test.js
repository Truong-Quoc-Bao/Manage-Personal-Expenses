# DB_USER=postgres
# DB_HOST=db.mdzmjrxpntwapuiyhqdo.supabase.co
# DB_NAME=postgres
# DB_PASSWORD=datletan16072004
# DB_PORT=5432



import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // ← PHẢI ĐẶT TRƯỚC KHI TẠO POOL

import pg from 'pg';
const { Pool } = pg;



AI_DATABASE_URL=postgresql://postgres.mdzmjrxpntwapuiyhqdo:DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres