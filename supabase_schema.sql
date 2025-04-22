-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This is the schema for the BalanceBuddy app.

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    age INTEGER,
    height INTEGER, -- Height in cm
    weight INTEGER, -- Weight in kg
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'exercises' table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'workouts' table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'workout_exercises' table to link workouts to exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    PRIMARY KEY (workout_id, exercise_id)
);

-- Create the 'progress_tracking' table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration INTEGER, -- Duration in minutes
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
