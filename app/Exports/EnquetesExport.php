<?php

namespace App\Exports;
 
use App\Models\Form;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
 
class EnquetesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(private int $userId) {}
 
    public function collection()
    {
        return Form::where('user_id', $this->userId)
            ->withCount('responses')
            ->orderByDesc('created_at')
            ->get();
    }
 
    public function headings(): array
    {
        return ['#', 'Titre', 'Référence', 'Statut', 'Réponses', 'Créée le', 'Publiée'];
    }
 
    public function map($row): array
    {
        return [
            $row->id,
            $row->title,
            $row->reference,
            $row->is_published ? ($row->accepts_responses ? 'Active' : 'Fermée') : 'Brouillon',
            $row->responses_count,
            $row->created_at->format('d/m/Y'),
            $row->is_published ? 'Oui' : 'Non',
        ];
    }
 
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                  'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']]],
        ];
    }
 
    public function title(): string { return 'Enquêtes'; }
}
 