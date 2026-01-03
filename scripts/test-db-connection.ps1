# Script de diagnostico de conexion a PostgreSQL
# Ejecutar: .\scripts\test-db-connection.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO DE CONECTIVIDAD DE RED" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Cargar variables de entorno desde .env si existe
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path (Split-Path -Parent $scriptDir) ".env"
if (Test-Path $envFile) {
    Write-Host "`n[INFO] Cargando variables de entorno desde .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Obtener configuracion
$dbHost = $env:DATABASE_HOST
$dbPort = $env:DATABASE_PORT
if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }

Write-Host "`n[INFO] Configuracion detectada:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost"
Write-Host "   Puerto: $dbPort"

# Paso 1: Verificar resolucion DNS
Write-Host "`n[PASO 1] Verificando resolucion DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name $dbHost -ErrorAction Stop
    Write-Host "[OK] DNS resuelto correctamente:" -ForegroundColor Green
    $dnsResult | ForEach-Object {
        Write-Host "   $($_.Name) -> $($_.IPAddress)" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Error al resolver DNS: $_" -ForegroundColor Red
    Write-Host "[TIP] Verifica que el hostname sea correcto y que tengas acceso a DNS" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Verificar conectividad de red
Write-Host "`n[PASO 2] Verificando conectividad de red..." -ForegroundColor Yellow
Write-Host "   Intentando conectar a ${dbHost}:${dbPort} (esto puede tardar hasta 30 segundos)..." -ForegroundColor Gray

try {
    $tcpTest = Test-NetConnection -ComputerName $dbHost -Port $dbPort -InformationLevel Detailed -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "[OK] Conexion TCP exitosa!" -ForegroundColor Green
        Write-Host "   IP remota: $($tcpTest.RemoteAddress)" -ForegroundColor Gray
        Write-Host "   Puerto remoto: $($tcpTest.RemotePort)" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] No se pudo establecer conexion TCP" -ForegroundColor Red
        Write-Host "[TIP] Posibles causas:" -ForegroundColor Yellow
        Write-Host "   1. El servidor no esta accesible desde tu red" -ForegroundColor Yellow
        Write-Host "   2. El firewall esta bloqueando el puerto $dbPort" -ForegroundColor Yellow
        Write-Host "   3. Necesitas una VPN para acceder al servidor" -ForegroundColor Yellow
        Write-Host "   4. El servicio PostgreSQL no esta corriendo en el servidor remoto" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error al verificar conectividad: $_" -ForegroundColor Red
    exit 1
}

# Paso 3: Verificar si hay algun servicio PostgreSQL local corriendo
Write-Host "`n[PASO 3] Verificando servicios PostgreSQL locales..." -ForegroundColor Yellow
$localPgServices = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue
if ($localPgServices) {
    Write-Host "[INFO] Servicios PostgreSQL locales encontrados:" -ForegroundColor Cyan
    $localPgServices | ForEach-Object {
        $statusColor = if ($_.Status -eq "Running") { "Green" } else { "Yellow" }
        Write-Host "   $($_.Name): $($_.Status)" -ForegroundColor $statusColor
    }
} else {
    Write-Host "[INFO] No se encontraron servicios PostgreSQL locales" -ForegroundColor Gray
}

# Paso 4: Verificar si el puerto local esta en uso (por si acaso)
Write-Host "`n[PASO 4] Verificando puerto local 5432..." -ForegroundColor Yellow
$localPort = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($localPort) {
    Write-Host "[INFO] Puerto 5432 local esta en uso (probablemente PostgreSQL local)" -ForegroundColor Cyan
} else {
    Write-Host "[INFO] Puerto 5432 local no esta en uso" -ForegroundColor Gray
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "[OK] DIAGNOSTICO DE RED COMPLETADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`n[TIP] Siguiente paso: Ejecuta el script TypeScript para probar la conexion completa:" -ForegroundColor Yellow
Write-Host "   npm run test:db" -ForegroundColor White
