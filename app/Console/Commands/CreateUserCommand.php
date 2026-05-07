<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateUserCommand extends Command
{
    protected $signature = 'user:create {--name=} {--email=}';

    protected $description = '管理画面用のユーザーを作成（パスワードは数字4桁・対話入力）';

    public function handle(): int
    {
        $name  = $this->option('name')  ?: $this->ask('名前 (name)');
        $email = $this->option('email') ?: $this->ask('メールアドレス (email)');

        if (User::where('email', $email)->exists()) {
            $this->error('そのメールアドレスのユーザーは既に存在します: ' . $email);

            return self::FAILURE;
        }

        $password = $this->secret('パスワード（数字4桁）');
        $confirm  = $this->secret('もう一度入力');

        if ($password !== $confirm) {
            $this->error('パスワードが一致しません。');

            return self::FAILURE;
        }

        $validator = Validator::make([
            'name'     => $name,
            'email'    => $email,
            'password' => $password,
        ], [
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required', 'digits:4'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $msg) {
                $this->error($msg);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name'              => $name,
            'email'             => $email,
            'password'          => Hash::make($password),
            'email_verified_at' => now(), // 管理ユーザーは即時 verified 扱い
        ]);

        $this->info('作成しました: id=' . $user->id . ' / email=' . $user->email);

        return self::SUCCESS;
    }
}
