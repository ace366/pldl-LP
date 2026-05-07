<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportSalesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mode'                       => ['required', 'in:overwrite,append'],
            'items'                      => ['required', 'array', 'min:1', 'max:5000'],
            'items.*.facility'           => ['required', 'string', 'max:100'],
            'items.*.prefecture'         => ['nullable', 'string', 'max:20'],
            'items.*.city'               => ['nullable', 'string', 'max:50'],
            'items.*.address'            => ['nullable', 'string', 'max:200'],
            'items.*.phone'              => ['nullable', 'string', 'max:30'],
            'items.*.email'              => ['nullable', 'string', 'max:255'],
            'items.*.websiteUrl'         => ['nullable', 'string', 'max:500'],
            'items.*.contactFormUrl'     => ['nullable', 'string', 'max:500'],
            'items.*.gmapUrl'            => ['nullable', 'string', 'max:500'],
            'items.*.type'               => ['nullable', 'string', 'max:30'],
            'items.*.priority'           => ['nullable', 'in:S,A,B,C,'],
            'items.*.status'             => ['nullable', 'string', 'max:20'],
            'items.*.memo'               => ['nullable', 'string', 'max:2000'],
            'items.*.firstSentAt'        => ['nullable', 'string', 'max:20'],
            'items.*.nextActionAt'       => ['nullable', 'string', 'max:20'],
            'items.*.analysis'           => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'mode.required' => 'mode (overwrite|append) を指定してください。',
            'items.required' => '取り込むアイテムが空です。',
        ];
    }
}
