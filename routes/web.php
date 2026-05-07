<?php

use App\Http\Controllers\Admin\GakudoLpContactsAdminController;
use App\Http\Controllers\Admin\LpSettingsController;
use App\Http\Controllers\Admin\SalesEntriesController;
use App\Http\Controllers\GakudoLpContactController;
use App\Http\Controllers\LineAuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// closure を使うと route:cache 時に / が壊れる事案があったため Route::redirect を使用。
Route::redirect('/', '/gakudo');

Route::get('/gakudo', [GakudoLpContactController::class, 'show'])
    ->name('gakudo-lp.index');

Route::post('/gakudo/contact', [GakudoLpContactController::class, 'store'])
    ->middleware('throttle:5,1') // 1分あたり5回まで（IP単位）
    ->name('gakudo-lp.contact');

// LINE Login (OAuth) — フォーム prefill 用
Route::get('/auth/line/redirect', [LineAuthController::class, 'redirect'])
    ->name('line.redirect');
Route::get('/auth/line/callback', [LineAuthController::class, 'callback'])
    ->name('line.callback');

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

    // 営業リスト管理ツール（HTML 画面 + API、共有DB）
    Route::get('/sales', [SalesEntriesController::class, 'showApp'])
        ->name('sales.index');

    Route::prefix('api/sales')->name('sales.api.')->group(function () {
        Route::get('/',                 [SalesEntriesController::class, 'index'])->name('list');
        Route::post('/',                [SalesEntriesController::class, 'store'])->name('store');
        Route::put('/{salesEntry}',     [SalesEntriesController::class, 'update'])->name('update');
        Route::delete('/{salesEntry}',  [SalesEntriesController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-import',     [SalesEntriesController::class, 'bulkImport'])->name('bulkImport');
        Route::get('/export.json',      [SalesEntriesController::class, 'exportJson'])->name('exportJson');
        Route::get('/export.csv',       [SalesEntriesController::class, 'exportCsv'])->name('exportCsv');
    });
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
