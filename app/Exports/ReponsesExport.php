<?php
// ─────────────────────────────────────────────────────────────────────────────
// app/Exports/ReponsesExport.php
// ─────────────────────────────────────────────────────────────────────────────
namespace App\Exports;
 
use App\Models\Form;
use App\Models\FormResponse;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
 
class ReponsesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(
        private ?int $formId,
        private ?int $userId = null
    ) {}
 
    public function collection()
    {
        $query = FormResponse::with(['form', 'answers.question']);
 
        if ($this->formId) {
            $query->where('form_id', $this->formId);
        } elseif ($this->userId) {
            $query->whereHas('form', fn ($q) => $q->where('user_id', $this->userId));
        }
 
        return $query->orderByDesc('submitted_at')->get();
    }
 
    public function headings(): array
    {
        return ['#', 'Enquête', 'Référence', 'IP', 'Soumis le', 'Réponses (JSON)'];
    }
 
    public function map($row): array
    {
        $answers = $row->answers->map(fn ($a) => ($a->question?->properties['label'] ?? 'Q') . ': ' . $a->value)->implode(' | ');
 
        return [
            $row->id,
            $row->form?->title ?? '—',
            $row->form?->reference ?? '—',
            $row->ip_address ?? '—',
            $row->submitted_at?->format('d/m/Y H:i') ?? '—',
            $answers,
        ];
    }
 
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                  'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']]],
        ];
    }
 
    public function title(): string { return 'Réponses'; }
}