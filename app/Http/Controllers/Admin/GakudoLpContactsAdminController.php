<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GakudoLpContact;
use Illuminate\Http\Request;

class GakudoLpContactsAdminController extends Controller
{
    public function index(Request $request)
    {
        $status = (string) $request->query('status', '');
        $q      = trim((string) $request->query('q', ''));

        $query = GakudoLpContact::query()->orderByDesc('created_at');

        if ($status !== '' && in_array($status, array_keys(GakudoLpContact::statusLabels()), true)) {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $q).'%';
                $w->where('facility', 'like', $like)
                  ->orWhere('name', 'like', $like)
                  ->orWhere('email', 'like', $like)
                  ->orWhere('tel', 'like', $like);
            });
        }

        $contacts = $query->paginate(20)->withQueryString();

        return view('admin.contacts.index', [
            'contacts'      => $contacts,
            'statusLabels'  => GakudoLpContact::statusLabels(),
            'currentStatus' => $status,
            'q'             => $q,
            'counts'        => $this->statusCounts(),
        ]);
    }

    public function show(GakudoLpContact $contact)
    {
        return view('admin.contacts.show', [
            'contact'      => $contact,
            'statusLabels' => GakudoLpContact::statusLabels(),
            'purposeMap'   => $this->purposeMap(),
        ]);
    }

    public function update(Request $request, GakudoLpContact $contact)
    {
        $statusKeys = array_keys(GakudoLpContact::statusLabels());

        $validated = $request->validate([
            'status'             => ['required', 'string', 'in:'.implode(',', $statusKeys)],
            'internal_memo'      => ['nullable', 'string', 'max:5000'],
            'contacted_at'       => ['nullable', 'date'],
            'demo_scheduled_at'  => ['nullable', 'date'],
            'contracted_at'      => ['nullable', 'date'],
        ]);

        $contact->fill($validated);
        $contact->save();

        return redirect()
            ->route('admin.contacts.show', $contact)
            ->with('status', '更新しました。');
    }

    private function statusCounts(): array
    {
        $rows = GakudoLpContact::query()
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status')
            ->all();

        $out = ['__all__' => array_sum($rows)];
        foreach (array_keys(GakudoLpContact::statusLabels()) as $k) {
            $out[$k] = (int) ($rows[$k] ?? 0);
        }

        return $out;
    }

    private function purposeMap(): array
    {
        return [
            'demo'     => '無料デモを予約したい',
            'price'    => '料金を相談したい',
            'consult'  => 'まずは相談したい',
            'document' => '資料がほしい',
        ];
    }
}
