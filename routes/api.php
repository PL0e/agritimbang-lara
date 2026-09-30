<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\BarangayGeometryController;
use App\Http\Controllers\LguAuthorityController;
use App\Http\Controllers\LguEncoderController;
use App\Http\Controllers\MunicipalityController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post('/register/farmer', [
        AuthController::class,
        'registerFarmer',
    ]);

    Route::post('/login', [
        AuthController::class,
        'login',
    ]);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [
            AuthController::class,
            'me',
        ]);

        Route::post('/logout', [
            AuthController::class,
            'logout',
        ]);
    });
});


/*
|--------------------------------------------------------------------------
| System Administrator
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
])
    ->prefix('admin')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Municipalities
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'municipalities',
            MunicipalityController::class
        );


        /*
        |--------------------------------------------------------------------------
        | LGU Authorities
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/lgu-authorities',
            [LguAuthorityController::class, 'index']
        );

        Route::post(
            '/lgu-authorities',
            [LguAuthorityController::class, 'store']
        );

        Route::get(
            '/lgu-authorities/{authority}',
            [LguAuthorityController::class, 'show']
        );

        Route::patch(
            '/lgu-authorities/{authority}',
            [LguAuthorityController::class, 'update']
        );

        Route::patch(
            '/lgu-authorities/{authority}/status',
            [LguAuthorityController::class, 'updateStatus']
        );


        /*
        |--------------------------------------------------------------------------
        | Barangays
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/barangays',
            [BarangayController::class, 'index']
        );

        Route::post(
            '/barangays',
            [BarangayController::class, 'store']
        );

        Route::get(
            '/barangays/{barangay}',
            [BarangayController::class, 'show']
        );

        Route::patch(
            '/barangays/{barangay}',
            [BarangayController::class, 'update']
        );

        Route::patch(
            '/barangays/{barangay}/status',
            [BarangayController::class, 'updateStatus']
        );


        /*
        |--------------------------------------------------------------------------
        | Barangays by Municipality
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/municipalities/{municipality}/barangays',
            [BarangayController::class, 'indexByMunicipality']
        );


        /*
        |--------------------------------------------------------------------------
        | Barangay GIS Geometry
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/barangays/{barangay}/geometry',
            [BarangayGeometryController::class, 'show']
        );

        Route::put(
            '/barangays/{barangay}/geometry',
            [BarangayGeometryController::class, 'upsert']
        );
    });


/*
|--------------------------------------------------------------------------
| LGU Authority
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:lgu_authority',
])
    ->prefix('lgu')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | LGU Encoders
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/encoders',
            [LguEncoderController::class, 'index']
        );

        Route::post(
            '/encoders',
            [LguEncoderController::class, 'store']
        );

        Route::get(
            '/encoders/{encoder}',
            [LguEncoderController::class, 'show']
        );

        Route::patch(
            '/encoders/{encoder}',
            [LguEncoderController::class, 'update']
        );

        Route::patch(
            '/encoders/{encoder}/status',
            [LguEncoderController::class, 'updateStatus']
        );
    });