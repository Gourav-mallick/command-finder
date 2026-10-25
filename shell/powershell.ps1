# Dot-source from your PowerShell profile. Requires PSReadLine.
if (Get-Module -ListAvailable PSReadLine) {
    Set-PSReadLineKeyHandler -Chord Ctrl+g -ScriptBlock {
        $selected = & cmdx --pick
        if ($LASTEXITCODE -eq 0 -and $selected) {
            [Microsoft.PowerShell.PSConsoleReadLine]::Insert($selected)
        }
    }
}
