@echo off
echo Loading environment from .env file...

REM Read DATABASE_URL from .env file
for /f "tokens=1,* delims==" %%a in ('findstr /r "^DATABASE_URL=" .env') do set %%a=%%b

echo DATABASE_URL is set: %DATABASE_URL:~0,30%...

echo.
echo Running Prisma Generate...
npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Prisma Client generated successfully!
) else (
    echo.
    echo ❌ Prisma Generate failed with error code %ERRORLEVEL%
    exit /b 1
)
