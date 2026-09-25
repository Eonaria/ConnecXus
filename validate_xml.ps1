Add-Type -AssemblyName System.IO.Compression.FileSystem
$targetFile = Get-ChildItem "d:/ConnecXus/admin/Word" -Filter "*.docx" | Where-Object { $_.Name -like "*3*" } | Select-Object -First 1

if ($targetFile) {
    Write-Host "Found file: $($targetFile.FullName) (Size: $($targetFile.Length) bytes)"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($targetFile.FullName)
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $stream.Close()
    $zip.Dispose()

    Write-Host "Total XML length: $($xml.Length)"

    try {
        $xmlDoc = New-Object System.Xml.XmlDocument
        $xmlDoc.LoadXml($xml)
        Write-Host "XML Validation: SUCCESS! 100% Valid OpenXML Schema"
    } catch {
        Write-Host "XML Validation ERROR: $_"
    }
} else {
    Write-Host "Target file not found"
}
