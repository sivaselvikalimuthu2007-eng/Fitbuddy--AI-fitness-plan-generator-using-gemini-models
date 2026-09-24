#!/usr/bin/env python3
"""
FitBuddy - SQLite & SQLAlchemy Setup & Inspection Utility
Demonstrates connecting to fitbuddy.db, querying User and WorkoutPlan records,
and validating database integrity.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'fitbuddy.db')

def inspect_sqlite():
    print(f"Connecting to SQLite database: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"Database file does not exist yet at {DB_PATH}.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Tables found ({len(tables)}): {', '.join(tables)}")

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f" - {table}: {count} records")

    print("\n--- Registered Users (SQLite) ---")
    cursor.execute("SELECT id, name, primary_goal, workout_intensity FROM users LIMIT 5")
    for row in cursor.fetchall():
        print(f"User: {row[1]} | ID: {row[0]} | Goal: {row[2]} | Intensity: {row[3]}")

    print("\n--- Assigned Workout Plans (SQLite) ---")
    cursor.execute("SELECT id, user_id, title, intensity FROM workout_plans LIMIT 5")
    for row in cursor.fetchall():
        print(f"Plan: {row[2]} | Intensity: {row[3]} | User ID: {row[1]}")

    conn.close()

if __name__ == '__main__':
    inspect_sqlite()
