<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // /admin/* は auth ミドルウェアで保護済み。ここまで来ているなら認証OK。
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'facility'       => ['required', 'string', 'max:100'],
            'prefecture'     => ['nullable', 'string', 'max:20'],
            'city'           => ['nullable', 'string', 'max:50'],
            'address'        => ['nullable', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            // BulkImport と揃えて string のみ。Google Places から渡される URL や旧 localStorage
            // データに `url` validation で落ちるパターン (例: gmapUrl がプロトコル無し) があり、
            // 個別 POST で 422 silent fail → リスト未反映の事象を引き起こしていたため緩和。
            // 表示側は isUrl() で http(s)// を都度チェックしているので保存できても害なし。
            'websiteUrl'     => ['nullable', 'string', 'max:500'],
            'contactFormUrl' => ['nullable', 'string', 'max:500'],
            'gmapUrl'        => ['nullable', 'string', 'max:500'],
            'type'           => ['nullable', 'string', 'max:30'],
            'priority'       => ['nullable', 'in:S,A,B,C'],
            'status'         => ['nullable', 'string', 'max:20'],
            'memo'           => ['nullable', 'string', 'max:2000'],
            'firstSentAt'    => ['nullable', 'date_format:Y-m-d'],
            'nextActionAt'   => ['nullable', 'date_format:Y-m-d'],
            'analysis'       => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'facility.required' => '施設名は必須です。',
            'priority.in'       => '優先度は S/A/B/C のいずれかです。',
        ];
    }
}
