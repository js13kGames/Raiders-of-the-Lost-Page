Remove-Item .\jsEntry.zip

$compress = @{
    Path = ".\dist"
    CompressionLevel = "Optimal"
    DestinationPath = ".\jsEntry.zip"
  }
  Compress-Archive @compress