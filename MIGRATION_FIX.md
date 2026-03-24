# Migration Fix Instructions

The migration error occurs because `token_blacklist` migrations try to run before the custom User model exists.

## Quick Fix Steps:

1. **Delete the existing database and migration history:**
   ```bash
   # Delete SQLite database (if using SQLite)
   del db.sqlite3
   
   # Or if on Linux/Mac:
   # rm db.sqlite3
   ```

2. **Create migrations for all apps:**
   ```bash
   python manage.py makemigrations accounts
   python manage.py makemigrations courses
   python manage.py makemigrations payments
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

## Why This Happened:

The `token_blacklist` app has a migration that tries to access the `users` table, but the custom User model migrations hadn't been created yet. By reordering `INSTALLED_APPS` to place custom apps before `token_blacklist`, Django will now create and run migrations in the correct order.

## Alternative: Reset Everything

If you want a completely clean start:

```bash
# Delete database
del db.sqlite3

# Delete all migration files (except __init__.py)
# Then create fresh migrations
python manage.py makemigrations
python manage.py migrate
```
