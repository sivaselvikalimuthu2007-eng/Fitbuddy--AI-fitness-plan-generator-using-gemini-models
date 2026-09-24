# FitBuddy Database Architecture

This directory defines the SQLite database schema and SQLAlchemy ORM models requested for persistent storage of user profiles, workout plans, AI-generated nutrition & recovery protocols, and feedback modifications.

## 1. Schema & Models (`database/models.py`)

- **`User` (`users` table)**:
  - `id` (Primary Key, String)
  - `name`, `email`, `age`, `gender`, `weight_kg`, `height_cm`
  - `primary_goal`: `fat_loss`, `muscle_gain`, `mobility_flexibility`, `general_health`
  - `experience_level`: `beginner`, `intermediate`, `advanced`, `returning`
  - `workout_intensity`: `low`, `medium`, `high`
  - `days_per_week`, `minutes_per_session`
  - `equipment_json`, `limitations_json`
  - Relationships: `plans`, `feedbacks`, `nutrition_recs`, `sessions`

- **`WorkoutPlan` (`workout_plans` table)**:
  - `id` (Primary Key, String)
  - `user_id` (Foreign Key -> `users.id`)
  - `title`, `overview`
  - `intensity`: `low`, `medium`, `high`
  - `split_type`: Weekly split schedule
  - `weekly_schedule_json`: 7-day schedule with exercises, sets, reps, tempo, RPE, rest intervals
  - `wellness_guide_json`, `progression_strategy`, `motivational_mantra`
  - `adaptation_history_json`: History of adjustments made

- **`NutritionRecommendation` (`nutrition_recommendations` table)**:
  - `id` (Primary Key, String)
  - `user_id` (Foreign Key -> `users.id`)
  - `plan_id` (Foreign Key -> `workout_plans.id`)
  - `daily_calories` (Integer kcal)
  - `protein_grams`, `carbs_grams`, `fats_grams` (Integer)
  - `hydration_liters` (Float)
  - `meal_timing_protocol` (Text)
  - `supplement_guidance` (Text)
  - `sleep_recovery_protocol` (Text)
  - `active_recovery_protocol` (Text)

- **`FeedbackLog` (`feedback_logs` table)**:
  - `id` (Primary Key, String)
  - `user_id` (Foreign Key -> `users.id`)
  - `plan_id` (Foreign Key -> `workout_plans.id`)
  - `feedback_text`: Athlete's input/complaint/request
  - `adaptation_type`: `intensity`, `injury`, `equipment`, `schedule`, `custom`
  - `target_intensity`: Updated intensity level
  - `adaptation_summary`: Summary of modifications applied by AI

- **`WorkoutSession` (`workout_sessions` table)**:
  - `id` (Primary Key, String)
  - `user_id` (Foreign Key -> `users.id`)
  - `plan_id`, `day_number`, `day_title`
  - `duration_minutes`, `perceived_rpe`, `calories_burned`, `intensity`

## 2. Admin Dashboard & Jinja2 Templates (`/templates`)

The admin interface is rendered using Jinja2 templates via `nunjucks`:
- `/admin`: Displays all registered athletes, KPI statistics, filters (intensity, goal, search), and feedback logs.
- `/admin/user/:id`: Deep inspection of an athlete's profile, active workout plans, AI-generated nutrition protocols, and adaptation history.
- `/admin/database`: Visual inspection of SQLite tables and SQLAlchemy ORM code definitions.

## 3. Python Verification Utility (`database/db_setup.py`)

Run:
```bash
python3 database/db_setup.py
```
This queries the live `fitbuddy.db` database and prints all tables and sample rows.
