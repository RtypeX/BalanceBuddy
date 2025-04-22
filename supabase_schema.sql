-- This is an example schema, you may need to adjust it based on your specific needs.

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    age INTEGER,
    height INTEGER, -- Height in cm
    weight INTEGER, -- Weight in kg
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'exercises' table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'workouts' table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'workout_exercises' table (to link workouts and exercises)
CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_id UUID REFERENCES workouts(id),
    exercise_id UUID REFERENCES exercises(id),
    sets INTEGER,
    reps INTEGER,
    weight INTEGER, -- Weight used in kg
    PRIMARY KEY (workout_id, exercise_id)
);

-- Create the 'progress_tracking' table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    workout_id UUID REFERENCES workouts(id),
    date DATE NOT NULL,
    duration INTEGER, -- Duration in minutes
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Example data for the 'exercises' table
INSERT INTO exercises (name, description, video_url) VALUES
('Push-ups', 'A classic exercise for chest and triceps.', 'https://example.com/pushups.mp4'),
('Squats', 'A fundamental exercise for legs and glutes.', 'https://example.com/squats.mp4'),
('Bicep Curls', 'Isolate the biceps for strength and definition.', 'https://example.com/bicepcurls.mp4'),
('Plank', 'Core strengthening exercise that improves stability.', 'https://example.com/plank.mp4'),
('Lunges', 'Great for legs and balance, targets quads and glutes.', 'https://example.com/lunges.mp4'),
('Rows', 'Works the back muscles for better posture and strength.', 'https://example.com/rows.mp4');
