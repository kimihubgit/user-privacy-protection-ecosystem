# ==================================================
# ITSO Windows Checker 3.1 - PowerShell Version (Optimized UI & Logic)
# ==================================================
# THIẾT LẬP HIỂN THỊ TIẾNG VIỆT CÓ DẤU (UTF-8)
# ==================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

$host.ui.RawUI.WindowTitle = "ITSO Windows Checker 3.1"

# =========================
# KIEM TRA QUYEN ADMIN
# =========================
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    [Console]::ForegroundColor = "Red"
    Clear-Host
    Write-Host "=================================================="
    Write-Host "  [CẢNH BÁO LỖI] THIẾU QUYỀN QUẢN TRỊ VIÊN"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host "Tool này cần quyền Administrator để đọc ghi các "
    Write-Host "Service hệ thống và truy xuất BIOS."
    Write-Host ""
    Write-Host "Vui lòng bấm vào nút tìm kiếm, gỡ từ khóa PowerShell, " -ForegroundColor Red
    Write-Host "tìm mục Windows PowerShell, nhấp chuột phải và chọn Run As Administrator`n" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press any key to continue . . ."
    Exit
}

# =========================
# HAM GIAI MA FULL KEY TU REGISTRY
# =========================
function Get-DecodedProductKey {
    $productKey = "Không tìm thấy key"
    try {
        $digitalProductId = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name "DigitalProductId" -ErrorAction SilentlyContinue).DigitalProductId
        if ($digitalProductId -and $digitalProductId.Length -ge 67) {
            $isWin8OrUp = [math]::Truncate($digitalProductId[66] / 6) -band 1
            $digitalProductId[66] = ($digitalProductId[66] -band 247) -bor (($isWin8OrUp -band 2) * 4)
            $chars = "BCDFGHJKMPQRTVWXY2346789"
            $decodedChars = New-Object char[] 29
            $last = 0
            for ($i = 24; $i -ge 0; $i--) {
                $current = 0
                for ($j = 14; $j -ge 0; $j--) {
                    $current = ($current * 256) -bxor $digitalProductId[$j + 52]
                    $digitalProductId[$j + 52] = [math]::Truncate($current / 24)
                    $current = $current % 24
                }
                $decodedChars[$i] = $chars[$current]
                $last = $current
            }

            $fullKey = ""
            if ($isWin8OrUp -eq 1) {
                $keyPart1 = ""
                $keyPart2 = ""
                if ($last -gt 0) { $keyPart1 = $decodedChars[1..$last] -join '' }
                if ($last -lt 24) { $keyPart2 = $decodedChars[($last + 1)..24] -join '' }
                $fullKey = $keyPart1 + "N" + $keyPart2
            } else {
                $fullKey = $decodedChars[0..24] -join ''
            }

            if ($fullKey.Length -eq 25) {
                $productKey = "{0}-{1}-{2}-{3}-{4}" -f $fullKey.Substring(0,5), $fullKey.Substring(5,5), $fullKey.Substring(10,5), $fullKey.Substring(15,5), $fullKey.Substring(20,5)
            }
        }
    } catch {}

    return $productKey
}

# =========================
# LAY THONG TIN HE THONG
# =========================
$OS_NAME = ""
$OS_BUILD = ""
try {
    $OS_NAME = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -ErrorAction SilentlyContinue).ProductName
    $OS_BUILD = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -ErrorAction SilentlyContinue).CurrentBuild
} catch {}

if ([int]$OS_BUILD -ge 22000) {
    $OS_NAME = $OS_NAME -replace "Windows 10", "Windows 11"
}
$OS_ARCH = if ($env:PROCESSOR_ARCHITECTURE -eq "AMD64") { "64-bit" } else { "32-bit" }

# BIẾN TOÀN CỤC
$script:OS_INSTALL_DATE = "Không xác định"
try {
    $osCim = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    if ($osCim) {
        $script:OS_INSTALL_DATE = $osCim.InstallDate.ToString("dd/MM/yyyy HH:mm:ss")
    }
} catch {}

$script:state = "MAIN"
$script:PK = "XXXXX"
$script:FULL_PK = "Ko tìm thấy key"
$script:ACT = "CHƯA KÍCH HOẠT"
$script:BIOS_KEY = "KHONG_TIM_THAY"
$script:HWID_WARN = "0"
$script:CHANNEL = "Không tìm thấy key"

function Show-Main {
    Clear-Host
    [Console]::ForegroundColor = "Cyan"
    Write-Host "=================================================="
    Write-Host "        CÔNG CỤ KIỂM TRA BẢN QUYỀN WINDOWS"
    Write-Host "    Phát triển bởi Tin học Nguyễn Tài - Phiên bản 3.1"
    Write-Host "        Cập nhật: 17/07/2026 - https://itso.vn"
    Write-Host "=================================================="
    Write-Host "    - Hệ điều hành   : $OS_NAME ($OS_ARCH)"
    Write-Host "    - Build          : $OS_BUILD"
    Write-Host "    - Ngày cài đặt   : $($script:OS_INSTALL_DATE)"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host " Công cụ giúp:"
    Write-Host "   - Kiểm tra tính hợp pháp của Windows đang kích hoạt"
    Write-Host "   - Phát hiện công cụ crack windows trái phép (KMS, KMS38, MAS, HWID)"
    Write-Host "   - Gỡ bỏ key kích hoạt trái phép trên máy"
    Write-Host "   - Kiểm tra key gốc ẩn trong BIOS (OEM từ nhà máy)"
    Write-Host "   - Kích hoạt Windows bằng key ẩn trong BIOS"
    Write-Host "   - Kiểm tra tính hợp lệ của key Doanh nghiệp (MAK)"
    Write-Host "   - Mua bản quyền Windows "
    Write-Host "=================================================="
    Write-Host ""
    Write-Host " MENU:"
    Write-Host "   [1] Kiểm tra bản quyền Windows của máy tính đang sử dụng"
    Write-Host "   [2] Kiểm tra và khôi phục Key gốc từ BIOS (Nếu có)"
    Write-Host "   [3] Gỡ bỏ key và xóa crack (Đưa về nguyên trạng)"
    Write-Host "   [4] Kiểm tra cập nhật phần mềm"
    Write-Host "   [5] Cách thức hoạt động của chương trình"
    Write-Host "   [6] Nâng cấp lên Windows bản quyền "
    Write-Host "   [7] Thoát"
    Write-Host ""

    $mainchoice = Read-Host "Chọn chức năng"
    switch ($mainchoice) {
        "1" { $script:state = "PRE_CHECK" }
        "2" { $script:state = "RESTORE_OEM" }
        "3" { $script:state = "REMOVE" }
        "4" { $script:state = "BUY" }
        "5" { $script:state = "HOW_IT_WORKS" }
        "6" { $script:state = "MUA" }
        "7" { $script:state = "EXIT" }
        default { $script:state = "MAIN" }
    }
}

function Show-PreCheck {
    Clear-Host
    [Console]::ForegroundColor = "Yellow"
    Write-Host "=================================================="
    Write-Host "[CẢNH BÁO]: Công cụ này hỗ trợ phát hiện bẻ khóa trái phép và gỡ sạch chúng"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host "    [1] Tiếp tục"
    Write-Host "    [2] Quay lại"
    Write-Host ""

    $precheck_choice = Read-Host "Chọn"
    if ($precheck_choice -eq "1") { $script:state = "CHECK" }
    elseif ($precheck_choice -eq "2") { $script:state = "MAIN" }
    else { $script:state = "PRE_CHECK" }
}

function Show-Check {
    Clear-Host
    [Console]::ForegroundColor = "Cyan"
    Write-Host "Đang kiểm tra bản quyền và truy xuất BIOS, vui lòng đợi..."
    Write-Host ""

    # KHỞI TẠO BẢNG ĐIỂM
    $script:scan_kms = $true;    $script:msg_kms = "Không phát hiện dấu vết cấu hình máy chủ KMS lậu."
    $script:scan_mas = $true;    $script:msg_mas = "Lịch sử dòng lệnh sạch. Không phát hiện hành vi bẻ khóa."
    $script:scan_kms38 = $true;  $script:msg_kms38 = "Cấu trúc logic thời hạn đồng nhất, hợp lệ."
    $script:scan_logic = $true;  $script:msg_logic = "Đối chiếu kênh cấp phép và BIOS hợp lệ."
    $script:scan_folder = $true; $script:msg_folder = "Không phát hiện thư mục mãnh khoé KMS Online."
    $script:scan_task = $true;   $script:msg_task = "Không phát hiện tác vụ gia hạn lậu trong Task Scheduler."
    $script:scan_reg = $true;    $script:msg_reg = "Hệ thống Registry nguyên trạng, không bị can thiệp."
    $isCrack = $false

    # LẤY THÔNG TIN CƠ BẢN
    $script:FULL_PK = Get-DecodedProductKey
    $tempPath = [System.IO.Path]::GetTempPath()
    $licenseFile = Join-Path $tempPath "itso_license.txt"
    $xprFile = Join-Path $tempPath "itso_xpr.txt"

    Start-Process -FilePath "cscript" -ArgumentList "//Nologo `"$env:windir\system32\slmgr.vbs`" /dli" -RedirectStandardOutput $licenseFile -NoNewWindow -Wait
    Start-Process -FilePath "cscript" -ArgumentList "//Nologo `"$env:windir\system32\slmgr.vbs`" /xpr" -RedirectStandardOutput $xprFile -NoNewWindow -Wait

    $script:PK = "XXXXX"
    if (Test-Path $licenseFile) {
        $licText = Get-Content $licenseFile -Raw
        if ($licText -match "Partial Product Key:\s*(.*)") {
            $script:PK = $Matches[1].Trim()
        }
    } else { $licText = "" }

    if ($script:FULL_PK -eq "BBBBB-BBBBB-BBBBB-BBBBB-BBBBB" -or $script:FULL_PK -eq "Không tìm thấy key") {
        $script:FULL_PK = if ($script:PK -ne "XXXXX") { "*****-*****-*****-*****-" + $script:PK } else { "[Không thể đọc được Key]" }
    }

    $script:CHANNEL = "Không tìm thấy key"
    if ($licText -match "RETAIL") { $script:CHANNEL = "RETAIL" }
    elseif ($licText -match "OEM") { $script:CHANNEL = "OEM" }
    elseif ($licText -match "VOLUME_MAK|MAK") { $script:CHANNEL = "VOLUME MAK" }
    elseif ($licText -match "VOLUME_KMSCLIENT|KMS|GVLK") { $script:CHANNEL = "VOLUME KMS" }

    $script:ACT = "CHƯA KÍCH HOẠT"
    $xprText = if (Test-Path $xprFile) { Get-Content $xprFile -Raw } else { "" }
    if ($xprText -match "permanently activated") { $script:ACT = "ĐÃ KÍCH HOẠT" }

    $script:BIOS_KEY = "KHONG_TIM_THAY"
    try {
        $oae = (Get-CimInstance -ClassName SoftwareLicensingService -ErrorAction SilentlyContinue).OA3xOriginalProductKey
        if ($oae) { $script:BIOS_KEY = $oae }
    } catch {}

    # === QUÁ TRÌNH QUÉT CHUYÊN SÂU LÊN 7 HẠNG MỤC ===

    # 1. KMS Crack
    if ($licText -match "VOLUME_KMSCLIENT|KMS|GVLK") {
        $script:scan_kms = $false; $script:msg_kms = "PHÁT HIỆN key Volume KMS trái phép."
        $isCrack = $true
    }
    $badServices = @("AutoKMS", "KMSELDI", "SppExtComObjHook")
    if (Get-Service -Name $badServices -ErrorAction SilentlyContinue) {
        $script:scan_kms = $false; $script:msg_kms = "PHÁT HIỆN Service chạy ngầm của tool KMS."
        $isCrack = $true
    }
    $hostsPath = "$env:windir\System32\drivers\etc\hosts"
    if (Test-Path $hostsPath) {
        if ((Get-Content $hostsPath -Raw) -match "(127\.0\.0\.1|activation\.sls\.microsoft\.com).+microsoft") {
            $script:scan_kms = $false; $script:msg_kms = "PHÁT HIỆN file Hosts bị sửa để chặn máy chủ Microsoft."
            $isCrack = $true
        }
    }

    # 2. MAS / HWID
    $historyPath = "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
    if (Test-Path $historyPath) {
        if ((Get-Content $historyPath -Raw -ErrorAction SilentlyContinue) -match "massgrave|mas\.dev|hwid|kms") {
            $script:scan_mas = $false; $script:msg_mas = "PHÁT HIỆN lịch sử gõ lệnh chạy script crack trực tuyến."
            $isCrack = $true
        }
    }

    # 3. KMS38
    if ($xprText -match "2038") {
        $script:scan_kms38 = $false; $script:msg_kms38 = "PHÁT HIỆN cấu trúc thời hạn bất thường (KMS38)."
        $isCrack = $true
    }

    # 4. Logic Bản Quyền (Rẽ nhánh xử lý Generic Key thông minh)
    $hwidKeys = @("3V66T","T83GX","YKHCF","TXYCV","8HVX7","233PK","8XC4K","WFG99","6F4BT","YTDFH","2YT43","H8Q99","7CFBY","VCFB2","J8JXD","8HV2C","PDQGT","YY74H","2YV77","6Q84J")
    if ($hwidKeys -contains $script:PK) {
        $script:HWID_WARN = "1"
        if ($script:BIOS_KEY -eq "KHONG_TIM_THAY") {
            # MÁY TỰ RÁP: Suy đoán vô tội, nhường quyền bắt crack cho Bước 2 và Bước 5
            $script:scan_logic = $true
            $script:msg_logic = "Giấy phép số (Digital License)"
        } else {
            # MÁY ĐỒNG BỘ: Có key xịn nhưng xài key chung -> Ép nâng bản Pro bằng MAS
            $script:scan_logic = $false
            $script:msg_logic = "PHÁT HIỆN: Bỏ qua Key gốc, hệ thống bị ép kích hoạt bằng Key chung ảo."
            $isCrack = $true
        }
    }

    # 5. Thư mục Tool
    $suspiciousFolders = @("$env:windir\KMS", "$env:windir\AutoKMS", "$env:ProgramData\KMSAutoS")
    foreach ($folder in $suspiciousFolders) {
        if (Test-Path $folder) {
            $script:scan_folder = $false; $script:msg_folder = "PHÁT HIỆN thư mục chứa tệp tin mãnh khoé crack."
            $isCrack = $true; break
        }
    }

    # 6. Tasks ẩn
    $crackTasks = @("AutoKMS", "AutoPico Daily Restart", "KMSAutoNet", "SvcRestartTask")
    if (Get-ScheduledTask -TaskName $crackTasks -ErrorAction SilentlyContinue) {
        $script:scan_task = $false; $script:msg_task = "PHÁT HIỆN tác vụ chạy ngầm trong Task Scheduler."
        $isCrack = $true
    }

    # 7. Registry
    $sppPolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\CurrentVersion\Software Protection Platform"
    try {
        if ((Get-ItemProperty -Path $sppPolicyPath -Name "NoGenTicket" -ErrorAction Stop).NoGenTicket -eq 1) {
            $script:scan_reg = $false; $script:msg_reg = "PHÁT HIỆN khóa 'NoGenTicket' chặn hệ thống gửi xác thực."
            $isCrack = $true
        }
    } catch {}

    # === ĐIỀU HƯỚNG ===
    if ($isCrack) { $script:state = "CRACK"; return }
    if ($licText -match "MAK") { $script:state = "MAK_KEY"; return }
    if ($licText -match "OEM|RETAIL") { $script:state = "LEGAL"; return }
    $script:state = "UNKNOWN"
}

# HÀM IN GIAO DIỆN VTV
function Print-VTVReport {
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "[PHÂN TÍCH - DẤU VẾT CRACK]" -ForegroundColor White

    function Print-Line($id, $name, $status, $msg) {
        $namePadded = $name.PadRight(18)
        if ($status) { Write-Host "[+] $id. $($namePadded): $msg" -ForegroundColor Green }
        else { Write-Host "[-] $id. $($namePadded): $msg" -ForegroundColor Red }
    }

    Print-Line "1" "KMS Crack" $script:scan_kms $script:msg_kms
    Print-Line "2" "MAS / HWID" $script:scan_mas $script:msg_mas
    Print-Line "3" "KMS38 Hook" $script:scan_kms38 $script:msg_kms38
    Print-Line "4" "Logic Bản Quyền" $script:scan_logic $script:msg_logic
    Print-Line "5" "Thư mục Tool lậu" $script:scan_folder $script:msg_folder
    Print-Line "6" "Tác vụ ẩn (Task)" $script:scan_task $script:msg_task
    Print-Line "7" "Can thiệp Registry" $script:scan_reg $script:msg_reg
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Crack {
    Clear-Host
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "            KẾT QUẢ KIỂM TRA BẢN QUYỀN" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "Ngày cài đặt         : $($script:OS_INSTALL_DATE)" -ForegroundColor Cyan
    Write-Host ""

    [Console]::ForegroundColor = "Red"
    Write-Host "Trạng thái bản quyền : KHÔNG HỢP LỆ (CRACK)"
    Write-Host "Trạng thái kích hoạt : $($script:ACT)"
    Write-Host "Loại bản quyền       : $($script:CHANNEL)"
    Write-Host ""
    [Console]::ForegroundColor = "Magenta"
    Write-Host "Key trên Windows     : $($script:FULL_PK)"
    Write-Host "Key gốc trên BIOS    : $($script:BIOS_KEY)"
    Write-Host ""

    Print-VTVReport

    [Console]::ForegroundColor = "Red"
    Write-Host "[KẾT LUẬN ĐÁNH GIÁ WINDOWS]"
    Write-Host "-> CẢNH BÁO: PHÁT HIỆN MÁY ĐANG DÙNG CRACK (KMS / SCRIPT ONLINE)."
    Write-Host "Bản quyền bị kết nối đến các máy chủ không an toàn."
    Write-Host ""

    if ($script:BIOS_KEY -ne "KHONG_TIM_THAY") {
        [Console]::ForegroundColor = "Yellow"
        Write-Host "[!!! QUAN TRỌNG !!!]"
        Write-Host "Máy của bạn thực chất CÓ BẢN QUYỀN GỐC ẩn trong mainboard."
        Write-Host "Nhưng hiện tại hệ điều hành lại đang kích hoạt bằng key không hợp lệ."
        Write-Host "Hãy chọn chức năng [2] ở menu để khôi phục lại key gốc."
        Write-Host ""
    }
    Write-Host "    [1] Không làm gì - quay lại menu"
    Write-Host "    [2] Gỡ bỏ crack và khắc phục hệ thống"
    Write-Host "    [3] Thoát"
    Write-Host ""

    $crackchoice = Read-Host "Chọn"
    if ($crackchoice -eq "1") { $script:state = "MAIN" }
    elseif ($crackchoice -eq "2") { $script:state = "REMOVE" }
    elseif ($crackchoice -eq "3") { $script:state = "EXIT" }
    else { $script:state = "CRACK" }
}

function Show-Legal {
    Clear-Host
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "            KẾT QUẢ KIỂM TRA BẢN QUYỀN" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "Ngày cài đặt         : $($script:OS_INSTALL_DATE)" -ForegroundColor Cyan
    Write-Host ""

    if ($script:ACT -eq "CHUA KICH HOAT") {
        [Console]::ForegroundColor = "Yellow"
        Write-Host "Trạng thái bản quyền : CÓ KEY NHƯNG CHƯA KÍCH HOẠT"
    } else {
        [Console]::ForegroundColor = "Green"
        Write-Host "Trạng thái bản quyền : HỢP LỆ"
    }
    Write-Host "Trạng thái kích hoạt : $($script:ACT)"
    Write-Host "Loại bản quyền       : $($script:CHANNEL)"
    Write-Host ""
    [Console]::ForegroundColor = "Magenta"
    Write-Host "Key trên Windows     : $($script:FULL_PK)"
    Write-Host "Key gốc trên BIOS    : $($script:BIOS_KEY)"
    Write-Host ""

    Print-VTVReport

    if ($script:ACT -eq "CHUA KICH HOAT") {
        [Console]::ForegroundColor = "Yellow"
        Write-Host "[KẾT LUẬN ĐÁNH GIÁ WINDOWS]"
        Write-Host "[CẢNH BÁO]: Hệ thống đã nhận key nhưng CHƯA KÍCH HOẠT thành công."
        Write-Host "Nguyên nhân phổ biến: Key Retail đã bị giới hạn, hoặc do lỗi mạng."
        Write-Host ""
    } else {
        [Console]::ForegroundColor = "Green"
        Write-Host "[KẾT LUẬN ĐÁNH GIÁ WINDOWS]"
        Write-Host "-> MÁY SẠCH: KHÔNG PHÁT HIỆN DẤU VẾT BẺ KHÓA TRÁI PHÉP."
        Write-Host ""
    }

    if ($script:BIOS_KEY -ne "KHONG_TIM_THAY") {
        [Console]::ForegroundColor = "Cyan"
        Write-Host "-> CHÚC MỪNG! Máy này có sẵn bản quyền NGUYÊN GỐC từ nhà sản xuất."
        Write-Host "Bản quyền này được tích hợp sẵn trong bios của máy."
        Write-Host ""
    }

   if ($script:HWID_WARN -eq "1" -and $script:BIOS_KEY -eq "KHONG_TIM_THAY") {
        if ($script:ACT -eq "ĐÃ KÍCH HOẠT") {
            [Console]::ForegroundColor = "Yellow"
             Write-Host "[! THÔNG BÁO !]"
            Write-Host "Máy này dùng Giấy phép kỹ thuật số (Generic Key) không kèm Key BIOS."
            Write-Host "Một số công cụ bẻ khóa khai thác lỗ hổng của giấy phép kĩ thuật số nhằm qua mặt thế thống, vẫn thể hiện là hợp lệ"
            Write-Host "Khách hàng nên nạp lại key đã mua trước đó để hợp thức hóa bản quyền."
            Write-Host ""
        } else {
            [Console]::ForegroundColor = "Yellow"
            Write-Host "[! THÔNG BÁO !]"
            Write-Host "Máy này đang sử dụng Key chung (Generic Key) và CHƯA KÍCH HOẠT."
            Write-Host "Vui lòng nhập Key bản quyền hợp lệ để sử dụng đầy đủ các tính năng."
            Write-Host ""
        }
    } elseif ($script:HWID_WARN -eq "1") {
        [Console]::ForegroundColor = "Yellow"
        Write-Host "[! THÔNG BÁO !]"
        Write-Host "Máy này đang sử dụng Key Generic [Key chung] của Microsoft,"
        Write-Host "nhưng vì có Key gốc trên BIOS nên hệ thống đánh giá là HỢP LỆ."
        Write-Host ""
    }

    Write-Host "==================================================" -ForegroundColor Cyan
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}

function Show-MakKey {
    Clear-Host
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "            KẾT QUẢ KIỂM TRA BẢN QUYỀN" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "Ngày cài đặt         : $($script:OS_INSTALL_DATE)" -ForegroundColor Cyan
    Write-Host ""

    [Console]::ForegroundColor = "Yellow"
    Write-Host "Trạng thái bản quyền : KEY DOANH NGHIỆP (MAK)"
    Write-Host "Trạng thái kích hoạt : $($script:ACT)"
    Write-Host "Loại bản quyền       : $($script:CHANNEL)"
    Write-Host ""
    [Console]::ForegroundColor = "Magenta"
    Write-Host "Key trên Windows     : $($script:FULL_PK)"
    Write-Host "Key gốc trên BIOS    : $($script:BIOS_KEY)"
    Write-Host ""

    Print-VTVReport

    [Console]::ForegroundColor = "Yellow"
    Write-Host "[KẾT LUẬN ĐÁNH GIÁ WINDOWS]"
    Write-Host "-> PHÁT HIỆN KEY VOLUME: MAK (DOANH NGHIỆP)"
    Write-Host ""
    Write-Host "[GIẢI THÍCH LỊCH SỬ]:"
    Write-Host "Máy bạn đang sử dụng Key MAK. Đây KHÔNG phải là crack,"
    Write-Host "mà là loại key cấp phép số lượng lớn cho doanh nghiệp."
    Write-Host "Thường gặp khi cài bản ghost hoặc máy thanh lý dự án."
    Write-Host ""

    if ($script:BIOS_KEY -ne "KHONG_TIM_THAY") {
        [Console]::ForegroundColor = "Cyan"
        Write-Host "[!!! QUAN TRỌNG !!!]"
        Write-Host "Máy này có sẵn BẢN QUYỀN GỐC [$($script:BIOS_KEY)] ẩn trong Main."
        Write-Host "Bạn nên dùng chức năng [2] ở menu chính để gỡ bỏ key MAK"
        Write-Host "và ép nhận lại key xịn nhà sản xuất cho ổn định tuyệt đối."
        Write-Host ""
    }
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}

function Show-Remove {
    Clear-Host
    [Console]::ForegroundColor = "Yellow"
    Write-Host "=================================================="
    Write-Host "         GỠ BỎ KEY VÀ LÀM SẠCH HỆ THỐNG"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host "[CẢNH BÁO]: Công cụ này hỗ trợ quét các công cụ CRACK có phát sinh MÃ ĐỘC và VIRUS"
    Write-Host ""
    Write-Host "Nếu như bạn xác định máy của bạn đang dùng Windows CRACK và muốn gỡ key"
    Write-Host "(không cần qua bước check) thì hãy lựa chọn:"
    Write-Host ""
    Write-Host "    [1] Gỡ KEY, khôi phục tính toàn vẹn của Windows"
    Write-Host "    [2] Thoát"
    Write-Host ""
    Write-Host "=================================================="
    Write-Host ". Nếu bạn là DOANH NGHIỆP chưa từng mua bản quyền Windows"
    Write-Host " thì nên chủ động GỠ BỎ để tránh vi phạm luật SHTT"
    Write-Host "=================================================="
    Write-Host ""

    $remove_choice = Read-Host "Nhập lựa chọn của bạn"

    if ($remove_choice -eq "2") { $script:state = "MAIN" }
    elseif ($remove_choice -eq "1") { $script:state = "DO_REMOVE" }
    else { $script:state = "REMOVE" }
}

function Do-Remove {
    Clear-Host
    [Console]::ForegroundColor = "Cyan"
    Write-Host ""
    Write-Host "Đang tiến hành gỡ bỏ key và xóa crack (nếu có), vui lòng đợi..."

    # 1. Dừng các dịch vụ bản quyền gốc để tránh lỗi khi can thiệp
    Stop-Service -Name sppsvc,osppsvc -Force -ErrorAction SilentlyContinue

    # 2. Xóa Key và thông tin KMS bằng slmgr
    cscript //Nologo $env:windir\system32\slmgr.vbs /upk | Out-Null
    cscript //Nologo $env:windir\system32\slmgr.vbs /cpky | Out-Null
    cscript //Nologo $env:windir\system32\slmgr.vbs /ckms | Out-Null
    cscript //Nologo $env:windir\system32\slmgr.vbs /rearm | Out-Null

    # 3. Quét và diệt các Service của tool Crack
    $crackServices = @("AutoKMS", "KMSELDI", "SppExtComObjHook", "KMSAuto")
    foreach ($svc in $crackServices) {
        Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
        sc.exe delete $svc | Out-Null
    }

    # 4. Quét và xóa các Tác vụ chạy ngầm (Scheduled Tasks)
    $crackTasks = @("AutoKMS", "AutoPico Daily Restart", "KMSAutoNet", "SvcRestartTask")
    foreach ($task in $crackTasks) {
        Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
    }

    # 5. [BỔ SUNG] Xóa vật lý Thư mục rác của Tool lậu (Mục 5)
    $suspiciousFolders = @("$env:windir\KMS", "$env:windir\AutoKMS", "$env:ProgramData\KMSAutoS")
    foreach ($folder in $suspiciousFolders) {
        if (Test-Path $folder) {
            Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    # 6. [BỔ SUNG] Xóa lịch sử dòng lệnh chạy MAS/HWID (Mục 2)
    $historyPath = "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
    if (Test-Path $historyPath) {
        Remove-Item -Path $historyPath -Force -ErrorAction SilentlyContinue
    }

    # 7. Dọn dẹp Registry KMS Policy và khóa NoGenTicket (Mục 7)
    $sppPolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\CurrentVersion\Software Protection Platform"
    if (Test-Path $sppPolicyPath) {
        Remove-ItemProperty -Path $sppPolicyPath -Name "KeyManagementServiceName" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $sppPolicyPath -Name "KeyManagementServicePort" -ErrorAction SilentlyContinue
        # Bổ sung xóa khóa cấm gửi Ticket
        Remove-ItemProperty -Path $sppPolicyPath -Name "NoGenTicket" -ErrorAction SilentlyContinue
    }

    # 8. Khôi phục file Hosts (Mục 1)
    $hostsPath = "$env:windir\System32\drivers\etc\hosts"
    if (Test-Path $hostsPath) {
        # Đảm bảo file hosts không bị Read-Only và gỡ bỏ các attributes khóa
        Set-ItemProperty -Path $hostsPath -Name Attributes -Value "Normal" -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $hostsPath -Name IsReadOnly -Value $false -ErrorAction SilentlyContinue
    }
    "# Default Hosts File`r`n127.0.0.1 localhost" | Out-File -FilePath $hostsPath -Encoding ascii -Force

    Write-Host ""
    [Console]::ForegroundColor = "Green"
    Write-Host "Đã hoàn tất gỡ bỏ key và làm sạch hệ thống!"
    Write-Host "Vui lòng KHỞI ĐỘNG LẠI máy để áp dụng thay đổi."
    Write-Host ""
    [Console]::ResetColor()
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}

function Show-RestoreOem {
    Clear-Host
    [Console]::ForegroundColor = "Yellow"
    Write-Host "=================================================="
    Write-Host "         KHÔI PHỤC KEY BẢN QUYỀN GỐC TỪ BIOS"
    Write-Host "=================================================="
    Write-Host ""
    Write-Host "[THÔNG BÁO]: Tính năng này dành cho khách hàng muốn xóa bỏ key hiện tại"
    Write-Host "và trả lại key gốc được nhà sản xuất tích hợp trên bios."
    Write-Host "Bắt buộc Windows phiên bản đang dùng trùng khớp với phiên bản key Bios"
    Write-Host ""
    Write-Host "    [1] Tiếp tục"
    Write-Host "    [2] Quay lại"
    Write-Host ""
    $restore_choice = Read-Host "Nhập lựa chọn của bạn.."
    if ($restore_choice -eq "2") { $script:state = "MAIN" }
    elseif ($restore_choice -eq "1") { $script:state = "DO_RESTORE_OEM" }
    else { $script:state = "RESTORE_OEM" }
}

function Do-RestoreOem {
    $TEMP_BIOS = "KHONG_TIM_THAY"
    try {
        $oae = (Get-CimInstance -ClassName SoftwareLicensingService -ErrorAction SilentlyContinue).OA3xOriginalProductKey
        if ($oae) { $TEMP_BIOS = $oae }
    } catch {}

    if ($TEMP_BIOS -eq "KHONG_TIM_THAY") {
        [Console]::ForegroundColor = "Red"
        Write-Host "Rất tiếc! Mainboard của máy này KHÔNG được tích hợp sẵn"
        Write-Host "bản quyền Windows từ nhà sản xuất."
        Write-Host ""
        Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
        $script:state = "MAIN"
        return
    }

    Write-Host "Phát hiện Key gốc: $TEMP_BIOS"
    Write-Host "Đang tiến hành xóa key cũ và nhập key gốc, vui lòng đợi..."
    Write-Host ""

    cscript //Nologo "$env:windir\system32\slmgr.vbs" /upk >$null 2>&1
    cscript //Nologo "$env:windir\system32\slmgr.vbs" /cpky >$null 2>&1
    cscript //Nologo "$env:windir\system32\slmgr.vbs" /ipk $TEMP_BIOS >$null 2>&1

    Write-Host "Đang kết nối đến máy chủ Microsoft để kích hoạt..."
    cscript //Nologo "$env:windir\system32\slmgr.vbs" /ato >$null 2>&1

    [Console]::ForegroundColor = "Green"
    Write-Host ""
    Write-Host "=================================================="
    Write-Host "ĐÃ HOÀN TẤT!"
    Write-Host "Vui lòng dùng chức năng [1] để kiểm tra lại trạng thái."
    Write-Host "=================================================="
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}

function Go-Buy { Clear-Host; Start-Process "https://itso.vn/iwc"; $script:state = "MAIN" }
function Go-Mua { Clear-Host; Start-Process "https://itso.vn/iwcbuy"; $script:state = "MAIN" }
function Show-HowItWorks {
    Clear-Host; [Console]::ForegroundColor = "Cyan"
    Write-Host "=================================================="
    Write-Host "                  CÁCH THỨC HOẠT ĐỘNG"
    Write-Host "=================================================="
    Write-Host "Tool ITSO hoạt động dựa trên 4 bước kiểm tra an toàn:"
    Write-Host "1. QUÉT CHIP BIOS (Mainboard): Dùng mã nhúng PowerShell để truy xuất sâu vào phần cứng lấy OEM Key."
    Write-Host "2. PHÂN TÍCH GIẤY PHÉP WINDOWS: Sử dụng slmgr.vbs kiểm tra cấu trúc (Retail, OEM, MAK, KMS)."
    Write-Host "3. QUÉT TÌM DẤU VẾT CRACK/HACK: Check Registry, Task Scheduler, Services và file Hosts."
    Write-Host "4. KHÔI PHỤC HỆ THỐNG / GỠ BỎ KEY: Reset các cấu hình hệ thống về trạng thái nguyên bản."
    Write-Host ""
    Write-Host "* Tool không chứa mã độc, chạy 100% bằng lệnh hệ thống chuẩn Microsoft!"
    Write-Host ""
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}
function Show-Unknown {
    Clear-Host; [Console]::ForegroundColor = "Yellow"
    Write-Host "KHÔNG XÁC ĐỊNH ĐƯỢC LOẠI KEY"
    Read-Host "Nhấn phím bất kỳ để tiếp tục . . ."
    $script:state = "MAIN"
}

while ($script:state -ne "EXIT") {
    switch ($script:state) {
        "MAIN"            { Show-Main }
        "PRE_CHECK"       { Show-PreCheck }
        "CHECK"           { Show-Check }
        "MAK_KEY"         { Show-MakKey }
        "LEGAL"           { Show-Legal }
        "CRACK"           { Show-Crack }
        "REMOVE"          { Show-Remove }
        "DO_REMOVE"       { Do-Remove }
        "RESTORE_OEM"     { Show-RestoreOem }
        "DO_RESTORE_OEM"  { Do-RestoreOem }
        "BUY"             { Go-Buy }
        "MUA"             { Go-Mua }
        "HOW_IT_WORKS"    { Show-HowItWorks }
        "UNKNOWN"         { Show-Unknown }
        default           { $script:state = "EXIT" }
    }
}
Exit