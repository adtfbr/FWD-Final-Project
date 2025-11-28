<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePengajuanLayananRequest extends FormRequest
{
    public function authorize(): bool
    {

        return $this->user()->role === 'warga';
    }

    public function rules(): array
    {
        return [
            'id_jenis_layanan' => 'required|integer|exists:jenis_layanans,id_jenis_layanan',
            'keterangan'       => 'nullable|string',
        ];
    }


    public function messages(): array
    {
        return [
            'id_jenis_layanan.required' => 'Jenis layanan wajib dipilih.',
            'id_jenis_layanan.exists'   => 'Jenis layanan yang dipilih tidak valid.',
        ];
    }
}
