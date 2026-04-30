<?php

use App\Http\Controllers\Admin\GakudoLpContactsAdminController;
use App\Http\Controllers\Admin\LpSettingsController;
use App\Http\Controllers\GakudoLpContactController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('gakudo-lp.index'));

Route::get('/gakudo', [GakudoLpContactController::class, 'show'])
    ->name('gakudo-lp.index');

Route::post('/gakudo/contact', [GakudoLpContactController::class, 'store'])
    ->middleware('throttle:5,1') // 1分あたり5回まで（IP単位）
    ->name('gakudo-lp.contact');

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/lp-settings', [LpSettingsController::class, 'index'])
        ->name('lp-settings.index');
    Route::put('/lp-settings', [LpSettingsController::class, 'update'])
        ->name('lp-settings.update');

    Route::get('/contacts', [GakudoLpContactsAdminController::class, 'index'])
        ->name('contacts.index');
    Route::get('/contacts/{contact}', [GakudoLpContactsAdminController::class, 'show'])
        ->name('contacts.show');
    Route::put('/contacts/{contact}', [GakudoLpContactsAdminController::class, 'update'])
        ->name('contacts.update');
});

Route::get('/dashboard', function () {
    return redirect()->route('admin.lp-settings.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
