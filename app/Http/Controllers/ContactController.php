<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ContactController extends Controller
{
    // ─── Liste ────────────────────────────────────────────────────────────────

    public function index(Request $request): InertiaResponse
    {
        $userId = Auth::id();
        $search = $request->input('search', '');

        $query = Contact::where('user_id', $userId)->orderBy('nom');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom',   'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate(20)->through(fn (Contact $c) => [
            'id'         => $c->id,
            'nom'        => $c->nom,
            'email'      => $c->email,
            'notes'      => $c->notes,
            'initials'   => collect(explode(' ', $c->nom))
                                ->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))
                                ->take(2)->implode(''),
            'created_at' => $c->created_at->format('d/m/Y'),
        ]);

        $stats = [
            'total'   => Contact::where('user_id', $userId)->count(),
            'ce_mois' => Contact::where('user_id', $userId)
                            ->whereMonth('created_at', now()->month)
                            ->whereYear('created_at',  now()->year)
                            ->count(),
        ];

        return Inertia::render('dashboard/contacts', [
            'contacts' => $contacts,
            'stats'    => $stats,
            'filters'  => ['search' => $search],
        ]);
    }

    // ─── Créer ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $userId = Auth::id();

        $request->validate([
            'nom'   => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255',
                        "unique:contacts,email,NULL,id,user_id,{$userId}"],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'nom.required'   => 'Le nom est obligatoire.',
            'email.required' => "L'email est obligatoire.",
            'email.email'    => "L'email n'est pas valide.",
            'email.unique'   => 'Ce contact existe déjà dans votre carnet.',
        ]);

        Contact::create([
            'user_id' => $userId,
            'nom'     => trim($request->nom),
            'email'   => strtolower(trim($request->email)),
            'notes'   => $request->notes,
        ]);

        return back()->with('success', "Contact « {$request->nom} » ajouté.");
    }

    // ─── Modifier ─────────────────────────────────────────────────────────────

    public function update(Request $request, Contact $contact)
    {
        $userId = Auth::id();

        $request->validate([
            'nom'   => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255',
                        "unique:contacts,email,{$contact->id},id,user_id,{$userId}"],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'nom.required'   => 'Le nom est obligatoire.',
            'email.required' => "L'email est obligatoire.",
            'email.email'    => "L'email n'est pas valide.",
            'email.unique'   => 'Ce contact existe déjà dans votre carnet.',
        ]);

        $contact->update([
            'nom'   => trim($request->nom),
            'email' => strtolower(trim($request->email)),
            'notes' => $request->notes,
        ]);

        return back()->with('success', "Contact « {$contact->nom} » mis à jour.");
    }

    // ─── Supprimer ────────────────────────────────────────────────────────────

    public function destroy(Contact $contact)
    {
        $nom = $contact->nom;
        $contact->delete();
        return back()->with('success', "Contact « {$nom} » supprimé.");
    }

    // ─── Import CSV / Excel ───────────────────────────────────────────────────

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls', 'max:5120'],
        ], [
            'file.required' => 'Veuillez sélectionner un fichier.',
            'file.mimes'    => 'Formats acceptés : CSV, Excel (.xlsx, .xls).',
            'file.max'      => 'Le fichier ne doit pas dépasser 5 Mo.',
        ]);

        $userId  = Auth::id();
        $file    = $request->file('file');
        $ext     = strtolower($file->getClientOriginalExtension());
        $added   = 0;
        $skipped = 0;
        $errors  = [];

        $rows = ($ext === 'csv' || $ext === 'txt')
            ? $this->readCsv($file->getPathname())
            : $this->readExcel($file->getPathname());

        foreach ($rows as $lineNum => $row) {
            $nom   = trim($row['nom']   ?? $row[0] ?? '');
            $email = strtolower(trim($row['email'] ?? $row[1] ?? ''));
            $notes = trim($row['notes'] ?? $row[2] ?? '');

            if (!$nom || !$email) {
                $skipped++;
                $errors[] = "Ligne {$lineNum} : nom ou email manquant.";
                continue;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                $errors[] = "Ligne {$lineNum} : email invalide « {$email} ».";
                continue;
            }

            if (Contact::where('user_id', $userId)->where('email', $email)->exists()) {
                $skipped++;
                $errors[] = "Ligne {$lineNum} : « {$email} » existe déjà.";
                continue;
            }

            Contact::create([
                'user_id' => $userId,
                'nom'     => $nom,
                'email'   => $email,
                'notes'   => $notes ?: null,
            ]);
            $added++;
        }

        $msg = "{$added} contact(s) importé(s)";
        if ($skipped > 0) $msg .= ", {$skipped} ignoré(s)";

        return back()->with('success', $msg)->with('import_errors', $errors);
    }

    // ─── Template CSV ─────────────────────────────────────────────────────────

    public function templateCsv()
    {
        $content = "nom,email,notes\n";

        return Response::make($content, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-contacts.csv"',
        ]);
    }

    // ─── Template Excel ───────────────────────────────────────────────────────

    public function templateExcel()
    {
        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Contacts');

        // En-têtes
        foreach (['NOM', 'EMAIL', 'NOTES'] as $i => $h) {
            $sheet->setCellValue(chr(65 + $i) . '1', $h);
        }

        $sheet->getStyle('A1:C1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '1D4ED8']]],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // Aucune donnée exemple — fichier vide prêt à remplir
        foreach ([32, 36, 30] as $i => $w) {
            $sheet->getColumnDimension(chr(65 + $i))->setWidth($w);
        }

        // Onglet Instructions
        $info = $spreadsheet->createSheet();
        $info->setTitle('Instructions');
        $info->setCellValue('A1', 'GUIDE D\'IMPORTATION — STATS ENQUETES');
        $info->setCellValue('A3', 'Colonnes obligatoires :');
        $info->setCellValue('A4', '→ nom   : Prénom et nom du contact (ex: Marie Dupont)');
        $info->setCellValue('A5', '→ email : Adresse email valide (ex: marie@exemple.com)');
        $info->setCellValue('A7', 'Colonne optionnelle :');
        $info->setCellValue('A8', '→ notes : Informations complémentaires');
        $info->setCellValue('A10', 'Règles importantes :');
        $info->setCellValue('A11', '→ La première ligne doit contenir les en-têtes : nom, email, notes');
        $info->setCellValue('A12', '→ Les doublons (même email) seront automatiquement ignorés');
        $info->setCellValue('A13', '→ Formats acceptés : .xlsx, .xls, .csv');
        $info->setCellValue('A15', 'Retournez sur l\'onglet "Contacts" et remplissez vos données.');

        $info->getStyle('A1')->applyFromArray(['font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '2563EB']]]);
        $info->getStyle('A3')->applyFromArray(['font' => ['bold' => true, 'size' => 11]]);
        $info->getStyle('A7')->applyFromArray(['font' => ['bold' => true, 'size' => 11]]);
        $info->getStyle('A10')->applyFromArray(['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'DC2626']]]);
        $info->getColumnDimension('A')->setWidth(65);

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new XlsxWriter($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        return Response::make($content, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template-contacts.xlsx"',
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function readCsv(string $path): array
    {
        $rows    = [];
        $handle  = fopen($path, 'r');
        $headers = null;
        $line    = 1;

        while (($row = fgetcsv($handle, 2000, ',')) !== false) {
            if ($headers === null) {
                $headers = array_map(fn($h) => strtolower(trim($h)), $row);
                $line++;
                continue;
            }
            if (in_array('nom', $headers) || in_array('email', $headers)) {
                $mapped = [];
                foreach ($headers as $i => $h) {
                    $mapped[$h] = $row[$i] ?? '';
                }
                $rows[$line] = $mapped;
            } else {
                $rows[$line] = $row;
            }
            $line++;
        }

        fclose($handle);
        return $rows;
    }

    private function readExcel(string $path): array
    {
        $reader      = IOFactory::createReaderForFile($path);
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $data        = $sheet->toArray(null, true, true, false);

        if (empty($data)) return [];

        $headers = array_map(fn($h) => strtolower(trim((string)$h)), $data[0]);
        $rows    = [];

        foreach (array_slice($data, 1) as $i => $row) {
            if (empty(array_filter(array_map('trim', array_map('strval', $row))))) continue;

            if (in_array('nom', $headers) || in_array('email', $headers)) {
                $mapped = [];
                foreach ($headers as $j => $h) {
                    $mapped[$h] = isset($row[$j]) ? trim((string)$row[$j]) : '';
                }
                $rows[$i + 2] = $mapped;
            } else {
                $rows[$i + 2] = array_map(fn($v) => trim((string)$v), $row);
            }
        }

        return $rows;
    }
}