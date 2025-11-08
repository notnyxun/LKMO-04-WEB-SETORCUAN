# Backend Integration Guide

Panduan lengkap untuk mengintegrasikan SetorCuan frontend dengan backend Laravel + PostgreSQL.

## Persiapan Backend

### Prerequisites
- PHP 8.1+
- Laravel 11+
- PostgreSQL 12+
- Composer

### Setup Backend Laravel

#### 1. Create Laravel Project
\`\`\`bash
composer create-project laravel/laravel setorcuan-backend
cd setorcuan-backend
\`\`\`

#### 2. Database Setup
\`\`\`bash
# Buat database PostgreSQL
createdb setorcuan_db

# Setup .env
cp .env.example .env
\`\`\`

**Update .env:**
\`\`\`env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=setorcuan_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
\`\`\`

#### 3. Migrations

Buat migration files:

\`\`\`bash
php artisan make:migration create_users_table
php artisan make:migration create_transactions_table
php artisan make:migration create_waste_prices_table
php artisan make:migration create_locations_table
\`\`\`

**database/migrations/YYYY_MM_DD_create_users_table.php:**
\`\`\`php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('username')->unique();
    $table->string('email')->unique();
    $table->string('password');
    $table->string('whatsapp')->nullable();
    $table->string('ewallet')->nullable();
    $table->string('ewallet_number')->nullable();
    $table->enum('role', ['user', 'admin'])->default('user');
    $table->integer('total_kg')->default(0);
    $table->integer('total_coins')->default(0);
    $table->integer('coin_exchanged')->default(0);
    $table->integer('coin_remaining')->default(0);
    $table->boolean('profile_completed')->default(false);
    $table->timestamps();
});
\`\`\`

**database/migrations/YYYY_MM_DD_create_transactions_table.php:**
\`\`\`php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->uuid('tx_id')->unique(); // TRX-001 format
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->enum('type', ['sampah', 'poin']);
    $table->string('kategori')->nullable();
    $table->decimal('berat', 8, 2)->nullable();
    $table->integer('coins')->nullable();
    $table->decimal('harga', 10, 2);
    $table->foreignId('location_id')->nullable()->constrained();
    $table->enum('status', ['pending', 'berhasil', 'dibatalkan'])->default('pending');
    $table->timestamps();
});
\`\`\`

**database/migrations/YYYY_MM_DD_create_waste_prices_table.php:**
\`\`\`php
Schema::create('waste_prices', function (Blueprint $table) {
    $table->id();
    $table->string('category');
    $table->integer('points');
    $table->timestamps();
});
\`\`\`

**database/migrations/YYYY_MM_DD_create_locations_table.php:**
\`\`\`php
Schema::create('locations', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 10, 8);
    $table->timestamps();
});
\`\`\`

Jalankan migrations:
\`\`\`bash
php artisan migrate
\`\`\`

#### 4. Models & Controllers

**app/Models/User.php:**
\`\`\`php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens;
    
    protected $fillable = [
        'username', 'email', 'password', 'whatsapp', 
        'ewallet', 'ewallet_number', 'role'
    ];
    
    public function transactions() {
        return $this->hasMany(Transaction::class);
    }
}
\`\`\`

**app/Http/Controllers/AuthController.php:**
\`\`\`php
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    public function register(Request $request) {
        $validated = $request->validate([
            'username' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);
        
        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user'
        ]);
        
        return response()->json(['success' => true, 'user' => $user]);
    }
    
    public function login(Request $request) {
        $user = User::where('username', $request->username)
                   ->orWhere('email', $request->username)
                   ->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }
}
\`\`\`

#### 5. API Routes

**routes/api.php:**
\`\`\`php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AdminController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    
    Route::post('/transactions/sampah', [TransactionController::class, 'submitSampah']);
    Route::post('/transactions/poin', [TransactionController::class, 'submitPoin']);
    Route::get('/transactions', [TransactionController::class, 'history']);
    
    Route::middleware('admin')->group(function () {
        Route::get('/admin/transactions', [AdminController::class, 'getTransactions']);
        Route::put('/admin/transactions/{id}/status', [AdminController::class, 'updateStatus']);
        Route::delete('/admin/transactions/{id}', [AdminController::class, 'cancel']);
        Route::post('/admin/points/adjust', [AdminController::class, 'adjustPoints']);
    });
});

Route::get('/locations', [LocationController::class, 'getAll']);
Route::get('/waste-prices', [WastePriceController::class, 'getAll']);
\`\`\`

### Backend CORS Setup

**config/cors.php:**
\`\`\`php
'allowed_origins' => ['http://localhost:3000', 'https://yourdomain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
\`\`\`

## Frontend Configuration

### 1. Update .env.local

\`\`\`env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
FONNTE_API_KEY=your_fonnte_key
FONNTE_DEVICE_ID=your_device_id
\`\`\`

### 2. Running Frontend & Backend

**Terminal 1 - Backend:**
\`\`\`bash
cd setorcuan-backend
php artisan serve
# Runs on http://localhost:8000
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd setorcuan-frontend
npm run dev
# Runs on http://localhost:3000
\`\`\`

## API Response Format

### Successful Login Response
\`\`\`json
{
  "token": "bearer_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "total_kg": 10,
    "total_coins": 5,
    "coin_exchanged": 10000,
    "coin_remaining": 1000,
    "profile_completed": true
  }
}
\`\`\`

### Transaction Submit Response
\`\`\`json
{
  "success": true,
  "id": "TRX-001",
  "transaction": {
    "tx_id": "TRX-001",
    "user_id": 1,
    "type": "sampah",
    "coins": 5000,
    "status": "pending",
    "created_at": "2024-11-06T10:00:00Z"
  }
}
\`\`\`

## Error Handling

Frontend akan handle berbagai error dari backend:

### 401 Unauthorized
- Token expired → auto logout & redirect ke login
- Invalid credentials → show error message

### 422 Unprocessable Entity
- Validation errors → display field-specific messages
- Example: username already exists

### 500 Server Error
- Display generic error message
- Log ke console untuk debugging

## Testing Flow

1. **Start both servers** (backend & frontend)
2. **Test register** - Create new account via frontend
3. **Test login** - Login dengan akun baru
4. **Test transactions** - Submit tukar sampah & tukar poin
5. **Test admin** - Login as admin, approve transactions

## Deployment

### Backend (Laravel) to Production
\`\`\`bash
php artisan config:cache
php artisan route:cache
php artisan migrate --force
\`\`\`

### Frontend to Vercel
\`\`\`bash
vercel --prod
\`\`\`

Update `NEXT_PUBLIC_API_URL` di Vercel environment variables.

## Troubleshooting

### CORS Error
- Check `config/cors.php` di backend
- Ensure frontend URL ada di `allowed_origins`

### 401 Unauthorized
- Verify token dikirim dengan header `Authorization: Bearer {token}`
- Check token expiration di backend

### Transaction tidak masuk
- Verify user authenticated
- Check database connection
- Review error logs: `storage/logs/laravel.log`

## Additional Notes

- Frontend auto-retry failed requests 3x
- Token disimpan di localStorage, hati-hati XSS
- Use HTTPS di production
- Implement rate limiting di backend untuk security
