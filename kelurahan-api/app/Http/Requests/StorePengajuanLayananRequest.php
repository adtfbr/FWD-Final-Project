<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePengajuanLayananRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Izinkan hanya jika user login memiliki role warga
        return $this->user()->role === 'warga';
    }

    public function rules(): array
    {
        return [
            'id_jenis_layanan' => 'required|integer|exists:jenis_layanans,id_jenis_layanan',
            'keterangan'       => 'nullable|string',
        ];
    }

    // Opsional: Custom pesan error
    public function messages(): array
    {
        return [
            'id_jenis_layanan.required' => 'Jenis layanan wajib dipilih.',
            'id_jenis_layanan.exists'   => 'Jenis layanan yang dipilih tidak valid.',
        ];
    }
}
