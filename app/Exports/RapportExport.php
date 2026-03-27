<?php
// ─────────────────────────────────────────────────────────────────────────────
// app/Exports/ReponsesExport.php
// ─────────────────────────────────────────────────────────────────────────────
namespace App\Exports;
 
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
 
class RapportExport implements WithMultipleSheets
{
    public function __construct(private int $userId, private string $periode = '30') {}
 
    public function sheets(): array
    {
        return [
            new EnquetesExport($this->userId),
            new ReponsesExport(null, $this->userId),
            new ContactsExport($this->userId),
            new InvitationsExport($this->userId),
        ];
    }
}