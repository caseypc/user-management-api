# User Management App

---
## PROJECT CREATION STEPS
```bash
# Create project
composer create-project symfony/skeleton user-management-api
cd user-management-api

# Core packages
composer require webapp
composer require orm maker annotations validator serializer
composer require symfonycasts/verify-email-bundle
composer require nelmio/cors-bundle
composer require symfony/rate-limiter
composer require symfony/security-bundle
composer require symfony/monolog-bundle

# Dev tools
composer require --dev symfony/profiler-pack
composer require --dev doctrine/doctrine-fixtures-bundle
composer require --dev symfony/test-pack

# edit .env.local to set DATABASE_URL, then create database
cp .env .env.local
php bin/console doctrine:database:create

# Generate migration after building entity
php bin/console make:migration
# Sad times, my mariadb version isn't compatible with dbal, so I had to write 
# the migration manually (up/down-grading didn't help).   
php bin/console doctrine:migrations:migrate

# Run local server
php -S 127.0.0.1:8000 -t public
```



## BUILD FRONTEND
```bash
npm create vite@latest user-management-ui -- --template react-ts
cd user-management-ui

# Core dependencies
npm install ag-grid-community ag-grid-react
npm install -D sass

# Improve state handling
npm install @tanstack/react-query axios

# Start dev server
npm install
npm run dev
```
