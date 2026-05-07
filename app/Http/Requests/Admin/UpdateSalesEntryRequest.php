<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class UpdateSalesEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** 一時診断用 (2026-05-07): Store と同様 422 詳細を laravel.log に PII 伏字付きで記録。 */
    protected function failedValidation(Validator $validator)
    {
        $input = $this->all();
        Log::warning('SalesEntry.update validation failed', [
            'errors'      => $validator->errors()->toArray(),
            'sent_keys'   => array_keys($input),
            'facility'    => mb_substr((string) ($input['facility'] ?? ''), 0, 80),
            'address_len' => mb_strlen((string) ($input['address'] ?? '')),
            'phone_len'   => mb_strlen((string) ($input['phone'] ?? '')),
            'website_len' => mb_strlen((string) ($input['websiteUrl'] ?? '')),
            'gmap_len'    => mb_strlen((string) ($input['gmapUrl'] ?? '')),
            'type'        => $input['type'] ?? null,
            'priority'    => $input['priority'] ?? null,
            'status'      => $input['status'] ?? null,
        ]);
        parent::failedValidation($validator);
    }

    public function rules(): array
    {
        // Store と同条件。PUT 全フィールド送信を前提にしているため required を維持。
        return [
            'facility'       => ['required', 'string', 'max:100'],
            'prefecture'     => ['nullable', 'string', 'max:20'],
            'city'           => ['nullable', 'string', 'max:50'],
            'address'        => ['nullable', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            // Store と同様に url 検証を string に緩和（経緯は StoreSalesEntryRequest 参照）。
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
}
