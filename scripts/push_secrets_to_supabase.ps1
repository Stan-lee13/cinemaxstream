<#
  push_secrets_to_supabase.ps1

  Purpose:
  - Extract current hardcoded keys from repository files and push them as Supabase project secrets
  - Uses the Supabase CLI executable path provided by the user

  WARNING: This script will expose the secrets to the Supabase project you are currently
  linked/authenticated to via the Supabase CLI. Run locally on your machine where
  `supabase.exe` is installed and authenticated.
#>

param(
  [string]$SupabaseCliPath = 'C:\Users\Administrator\OneDrive\Documents\tools\supabase.exe',
  [switch]$DryRun
)

function Read-FileValue($filePath, $pattern) {
  if (-not (Test-Path $filePath)) { return $null }
  $content = Get-Content $filePath -Raw
  $m = [regex]::Match($content, $pattern, 'Singleline')
  if ($m.Success) {
    $val = $m.Groups[1].Value
    $val = $val.Trim()
    if ($val.Length -gt 0) {
      if ($val.StartsWith("'") -or $val.StartsWith('"')) { $val = $val.Substring(1) }
      if ($val.EndsWith("'") -or $val.EndsWith('"')) { $val = $val.Substring(0, $val.Length - 1) }
    }
    return $val.Trim()
  } else {
    return $null
  }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Paths to search (relative to repo root)
$supabaseClient = Join-Path $repoRoot 'src\integrations\supabase\client.ts'
$productionConfig = Join-Path $repoRoot 'src\utils\productionConfig.ts'
$trailerProviders = Join-Path $repoRoot 'src\utils\providers\trailerProviders.ts'

Write-Host "Reading values from repository files..."

$supabaseUrl = Read-FileValue $supabaseClient 'SUPABASE_URL\s*=\s*.*\|\|\s*"([^"]+)"'
if (-not $supabaseUrl) { $supabaseUrl = Read-FileValue $supabaseClient 'SUPABASE_URL\s*=\s*"([^"\)]+)"' }

$supabaseAnon = Read-FileValue $supabaseClient 'SUPABASE_PUBLISHABLE_KEY\s*=\s*.*\|\|\s*"([^"]+)"'
if (-not $supabaseAnon) { $supabaseAnon = Read-FileValue $supabaseClient 'SUPABASE_PUBLISHABLE_KEY\s*=\s*"([^"\)]+)"' }

$tmdbKey = Read-FileValue $trailerProviders 'TMDB_API_KEY\s*=\s*"([^"]+)"'
if (-not $tmdbKey) { $tmdbKey = Read-FileValue $productionConfig "tmdbApiKey\s*:\s*'([^']+)'" }

# Fallback repository-wide searches for common patterns
if (-not $supabaseUrl) {
  $match = Select-String -Path "$repoRoot\**\*.ts" -Pattern 'https://[^\s"']+\.supabase\.co' -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($match) { $supabaseUrl = $match.Matches[0].Value }
}

if (-not $supabaseAnon) {
  $match = Select-String -Path "$repoRoot\**\*.ts" -Pattern 'eyJ[0-9A-Za-z\-_]+\.[0-9A-Za-z\-_]+\.[0-9A-Za-z\-_]+' -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($match) { $supabaseAnon = $match.Matches[0].Value }
}

if (-not $tmdbKey) {
  $match = Select-String -Path "$repoRoot\**\*.ts" -Pattern '[0-9a-fA-F]{32}' -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($match) { $tmdbKey = $match.Matches[0].Value }
}

if ($supabaseUrl) { Write-Host "Supabase URL: (present)" } else { Write-Host "Supabase URL: (not found)" }
if ($supabaseAnon) { Write-Host "Supabase anon key: (present)" } else { Write-Host "Supabase anon key: (not found)" }
if ($tmdbKey) { Write-Host "TMDB key: (present)" } else { Write-Host "TMDB key: (not found)" }

if (-not $supabaseUrl -and -not $supabaseAnon -and -not $tmdbKey) {
  Write-Error "No known secrets found in repo. Exiting."
  exit 1
}

if ($DryRun) {
  Write-Host "Dry run: the following commands would be executed (do not leak these outputs):"
  if ($supabaseUrl) { Write-Host "`"$SupabaseCliPath`" secrets set VITE_SUPABASE_URL=`"$supabaseUrl`"" }
  if ($supabaseAnon) { Write-Host "`"$SupabaseCliPath`" secrets set VITE_SUPABASE_ANON_KEY=`"$supabaseAnon`"" }
  if ($tmdbKey) { Write-Host "`"$SupabaseCliPath`" secrets set VITE_TMDB_API_KEY=`"$tmdbKey`"" }
  exit 0
}

Read-Host -Prompt "Press Enter to continue and push found secrets to Supabase (requires supabase CLI authenticated). Ctrl-C to abort."

if (-not (Test-Path $SupabaseCliPath)) {
  Write-Error "Supabase CLI not found at path: $SupabaseCliPath. Update the path or install the CLI."
  exit 1
}

if ($supabaseUrl) {
  & $SupabaseCliPath secrets set "VITE_SUPABASE_URL=$supabaseUrl"
}

if ($supabaseAnon) {
  & $SupabaseCliPath secrets set "VITE_SUPABASE_ANON_KEY=$supabaseAnon"
}

if ($tmdbKey) {
  & $SupabaseCliPath secrets set "VITE_TMDB_API_KEY=$tmdbKey"
}

Write-Host "Secrets push complete. You may now deploy functions with the Supabase CLI, e.g.:"
Write-Host "  & '$SupabaseCliPath' functions deploy --project-ref <PROJECT_REF> --no-verify"
