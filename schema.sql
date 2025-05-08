-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for user authentication information (aligns with Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Matches auth.users.id
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    -- Other fields from auth.users can be mirrored if needed, e.g., created_at
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for detailed user profiles
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    age INTEGER, -- Can be derived, but storing can be useful
    height_ft INTEGER,
    height_in INTEGER,
    weight_lbs DECIMAL(5, 1), -- Current weight, e.g., 165.5 lbs
    fitness_goal TEXT CHECK (fitness_goal IN ('Lose Weight', 'Gain Weight', 'Maintain')),
    start_weight_lbs DECIMAL(5,1), -- User's starting weight for goal tracking
    goal_weight_lbs DECIMAL(5,1), -- User's goal weight
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for predefined exercises (optional, if not purely static in code)
-- If this table is used, routine_exercises should reference exercises.id
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY, -- Or UUID
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    muscle_group TEXT,
    tutorial TEXT,
    image_hint TEXT -- For AI image generation hints
);

-- Table for user-created workout routines
CREATE TABLE workout_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for exercises within a workout routine
CREATE TABLE routine_exercises (
    routine_id UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
    -- If 'exercises' table is dynamic and has its own ID:
    -- exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL, -- Using name for simplicity with static exercise list
    sets INTEGER NOT NULL,
    reps TEXT NOT NULL, -- e.g., "8-12" or "30s"
    order_in_routine INTEGER, -- To maintain exercise order
    PRIMARY KEY (routine_id, exercise_name) -- Or (routine_id, exercise_id)
);

-- Table for logging completed workouts or activities
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    log_type TEXT NOT NULL CHECK (log_type IN ('exercise', 'sport')),
    exercise_type TEXT, -- e.g., "Cardio", "Strength Training" (if log_type is 'exercise')
    sport_name TEXT,    -- e.g., "Basketball", "Custom: Kayaking" (if log_type is 'sport')
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for fasting logs
CREATE TABLE fasting_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_seconds INTEGER NOT NULL,
    goal_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for weight logs
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_lbs DECIMAL(5, 1) NOT NULL, -- e.g., 165.5
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date) -- Ensure only one weight entry per user per day
);

-- Table for daily nutrition summaries
CREATE TABLE nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calories INTEGER,
    total_protein_g DECIMAL(6,1),
    total_carbs_g DECIMAL(6,1),
    total_fat_g DECIMAL(6,1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date) -- Ensure one summary per user per day
);

-- Table for individual food items within a meal for a nutrition log
CREATE TABLE meal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutrition_log_id UUID NOT NULL REFERENCES nutrition_logs(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL CHECK (meal_name IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein_g DECIMAL(5,1) NOT NULL,
    carbs_g DECIMAL(5,1) NOT NULL,
    fat_g DECIMAL(5,1) NOT NULL
);

-- Table for sleep logs
CREATE TABLE sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- Represents the date the user WOKE UP
    sleep_time TIME NOT NULL, -- Time user went to sleep (e.g., 23:00)
    wake_time TIME NOT NULL,   -- Time user woke up (e.g., 07:00)
    duration_minutes INTEGER NOT NULL,
    quality TEXT CHECK (quality IN ('Poor', 'Fair', 'Good', 'Excellent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date) -- Assuming one main sleep log per wake-up day
);

-- Table for saved chat conversations (BalanceBot)
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Name given by user for the saved chat
    model_type TEXT,    -- e.g., 'gemini'
    timestamp TIMESTAMPTZ DEFAULT NOW(), -- For sorting, could be last message time
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for individual messages within a saved chat conversation
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'error')),
    content TEXT NOT NULL,
    message_timestamp TIMESTAMPTZ DEFAULT NOW(), -- Timestamp of the individual message
    order_in_conversation SERIAL -- To maintain message order if timestamp is not granular enough
);

-- Table for user-specific settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    balancebot_subscription_status BOOLEAN DEFAULT FALSE,
    notification_workout_reminders BOOLEAN DEFAULT TRUE,
    notification_fasting_reminders BOOLEAN DEFAULT TRUE,
    notification_new_features BOOLEAN DEFAULT TRUE,
    notification_promotional_offers BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns might be beneficial
-- Example: CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, date);
-- Example: CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date);

-- Functions to update 'updated_at' columns automatically (PostgreSQL specific)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with 'updated_at'
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at
BEFORE UPDATE ON workout_routines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
