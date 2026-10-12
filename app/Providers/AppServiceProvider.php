<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(
            fn (object $user, string $token): string =>
                rtrim(config('app.url'), '/') .
                '/?reset_token=' . urlencode($token) .
                '&email=' . urlencode($user->getEmailForPasswordReset())
        );
    }
}
