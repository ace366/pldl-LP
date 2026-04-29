<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LpSetting;
use Illuminate\Http\Request;

class LpSettingsController extends Controller
{
    public function index()
    {
        $settings = LpSetting::allForAdmin();

        return view('admin.lp-settings.index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $settings = LpSetting::allForAdmin();
        $input = (array) $request->input('settings', []);

        foreach ($settings as $row) {
            $key = $row->key;
            if ($row->type === 'bool') {
                $value = !empty($input[$key]) ? '1' : '0';
            } else {
                $value = (string) ($input[$key] ?? '');
            }

            $rules = [];
            switch ($row->type) {
                case 'email':
                    if ($value !== '') {
                        $rules = ['nullable', 'email', 'max:255'];
                    }
                    break;
                case 'url':
                    if ($value !== '') {
                        $rules = ['nullable', 'url', 'max:500'];
                    }
                    break;
                case 'textarea':
                    $rules = ['nullable', 'string', 'max:5000'];
                    break;
                case 'bool':
                    $rules = ['nullable', 'in:0,1'];
                    break;
                default:
                    $rules = ['nullable', 'string', 'max:1000'];
                    break;
            }

            if ($rules) {
                validator(['v' => $value], ['v' => $rules])->validate();
            }

            $row->value = $value;
            $row->save();
        }

        LpSetting::flushCache();

        return redirect()
            ->route('admin.lp-settings.index')
            ->with('status', '設定を更新しました。');
    }
}
