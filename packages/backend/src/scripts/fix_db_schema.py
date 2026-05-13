import os
import psycopg2
from dotenv import load_dotenv

# Search for .env file
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(base_dir, '.env')

if not os.path.exists(dotenv_path):
    # Try the monorepo root if it's not in the package
    dotenv_path = os.path.join(os.path.dirname(base_dir), 'packages', 'backend', '.env')

print(f"Loading env from: {dotenv_path}")
load_dotenv(dotenv_path=dotenv_path)

db_url = os.getenv("DATABASE_URL")

def fix_schema():
    if not db_url:
        print("Error: DATABASE_URL not found in environment")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        print("Updating database schema with hierarchy, status, and onboarding support...")
        
        # 1. Update users table (department_id, manager_id, status, tokens, root)
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department_id') THEN
                    ALTER TABLE users ADD COLUMN department_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='manager_id') THEN
                    ALTER TABLE users ADD COLUMN manager_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
                    ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='invitation_token') THEN
                    ALTER TABLE users ADD COLUMN invitation_token VARCHAR(255);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='invitation_expires_at') THEN
                    ALTER TABLE users ADD COLUMN invitation_expires_at TIMESTAMP WITH TIME ZONE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_root') THEN
                    ALTER TABLE users ADD COLUMN is_root BOOLEAN DEFAULT FALSE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='onboarding_completed') THEN
                    ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;
        """)

        # 2. Update departments table (head_id)
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='head_id') THEN
                    ALTER TABLE departments ADD COLUMN head_id UUID;
                END IF;
            END $$;
        """)

        # 3. Update documents table (department_id)
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='department_id') THEN
                    ALTER TABLE documents ADD COLUMN department_id UUID;
                END IF;
            END $$;
        """)

        # 4. Update lessons table (target_department_id)
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='target_department_id') THEN
                    ALTER TABLE lessons ADD COLUMN target_department_id UUID;
                END IF;
            END $$;
        """)

        # 5. Update subscriptions table (stellar_memo, payment_method)
        cur.execute("""
            DO $$ 
            BEGIN 
                -- Create table if it doesn't exist (safety)
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id UUID PRIMARY KEY,
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    stripe_customer_id VARCHAR(255),
                    stripe_subscription_id VARCHAR(255),
                    status VARCHAR(50),
                    current_period_end TIMESTAMP WITH TIME ZONE
                );

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stellar_memo') THEN
                    ALTER TABLE subscriptions ADD COLUMN stellar_memo VARCHAR(255);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='payment_method') THEN
                    ALTER TABLE subscriptions ADD COLUMN payment_method VARCHAR(50) DEFAULT 'stripe';
                END IF;
            END $$;
        """)
        
        conn.commit()
        print("Successfully updated database schema with full organizational and status support.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error updating schema: {e}")

if __name__ == "__main__":
    fix_schema()
