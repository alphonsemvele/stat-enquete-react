<?php
// ─────────────────────────────────────────────────────────────────────────────
// app/Exports/ReponsesExport.php
// ─────────────────────────────────────────────────────────────────────────────
namespace App\Exports;
 
use App\Models\Invitation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
 
class InvitationsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(
        private int     $userId,
        private ?int    $formId  = null,
        private ?string $statut  = null
    ) {}
 
    public function collection()
    {
        $q = Invitation::where('user_id', $this->userId)->with(['form', 'contact']);
        if ($this->formId) $q->where('form_id', $this->formId);
        if ($this->statut) $q->where('statut', $this->statut);
        return $q->latest()->get();
    }
 
    public function headings(): array
    {
        return ['#', 'Contact', 'Email', 'Enquête', 'Statut', 'Envoyé le', 'Ouvert le', 'Répondu le'];
    }
 
    public function map($row): array
    {
        return [
            $row->id,
            $row->nom,
            $row->email,
            $row->form?->title ?? '—',
            ucfirst(str_replace('_', ' ', $row->statut)),
            $row->envoye_le?->format('d/m/Y H:i')  ?? '—',
            $row->ouvert_le?->format('d/m/Y H:i')  ?? '—',
            $row->repondu_le?->format('d/m/Y H:i') ?? '—',
        ];
    }
 
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                  'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']]],
        ];
    }
 
    public function title(): string { return 'Invitations'; }
}
 