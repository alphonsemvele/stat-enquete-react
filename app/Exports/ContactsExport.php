<?php
// ─────────────────────────────────────────────────────────────────────────────
// app/Exports/ReponsesExport.php
// ─────────────────────────────────────────────────────────────────────────────
namespace App\Exports;
 
use App\Models\Contact;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
 
class ContactsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(private int $userId, private ?int $groupeId = null) {}
 
    public function collection()
    {
        $q = Contact::where('user_id', $this->userId)->orderBy('nom');
        return $q->get();
    }
 
    public function headings(): array
    {
        return ['#', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Ajouté le'];
    }
 
    public function map($row): array
    {
        return [
            $row->id,
            $row->nom,
            $row->email,
            $row->telephone ?? '—',
            $row->entreprise ?? '—',
            $row->created_at->format('d/m/Y'),
        ];
    }
 
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                  'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']]],
        ];
    }
 
    public function title(): string { return 'Contacts'; }
}
 
 