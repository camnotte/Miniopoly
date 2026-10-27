# Native Windows launcher. Hosting belongs to the Node controller, not a browser tab.
$ErrorActionPreference = 'Stop'
try {
  [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
  $boot = [Console]::ReadLine() | ConvertFrom-Json
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  Add-Type -AssemblyName System.Net.Http
  Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Concurrent;
using System.Threading.Tasks;
public static class MiniopolyWindows {
  public static readonly ConcurrentQueue<string> Commands=new ConcurrentQueue<string>();
  public static volatile bool InputClosed=false;
  public static void Listen() { Task.Run(() => { string line; while((line=Console.ReadLine())!=null) Commands.Enqueue(line); InputClosed=true; }); }
  public delegate bool Visitor(IntPtr window, IntPtr parameter);
  [DllImport("user32.dll")] public static extern bool EnumWindows(Visitor visitor, IntPtr parameter);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr window, StringBuilder text, int length);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr window, int command);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr window);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern bool SetProp(IntPtr window,string name,IntPtr value);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern IntPtr GetProp(IntPtr window,string name);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern IntPtr RemoveProp(IntPtr window,string name);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window,uint message,IntPtr wParam,IntPtr lParam);
  public static IntPtr FindMarker(string marker) {
    IntPtr result=IntPtr.Zero;
    EnumWindows((window,parameter)=>{
      var text=new StringBuilder(2048);GetWindowText(window,text,text.Capacity);
      if(text.ToString().Contains(marker)){result=window;return false;}return true;
    },IntPtr.Zero);return result;
  }
  public static void CloseOwned(IntPtr window,string tag) {
    if(IsWindow(window)&&GetProp(window,tag)==new IntPtr(1)) {
      RemoveProp(window,tag);PostMessage(window,0x0010,IntPtr.Zero,IntPtr.Zero);
    }
  }
  public static IntPtr Find(string prefix,string tag) {
    IntPtr result=IntPtr.Zero;
    EnumWindows((window, parameter) => {
      if(!IsWindowVisible(window)||GetProp(window,tag)!=new IntPtr(1)) return true;
      var text=new StringBuilder(1024); GetWindowText(window,text,text.Capacity);
      if(text.ToString().StartsWith(prefix,StringComparison.Ordinal)) {result=window;return false;}
      return true;
    },IntPtr.Zero);
    return result;
  }
}
'@
  [MiniopolyWindows]::SetProcessDPIAware() | Out-Null
  [System.Windows.Forms.Application]::EnableVisualStyles()
  $privateFonts = New-Object System.Drawing.Text.PrivateFontCollection
  $privateFonts.AddFontFile((Join-Path $boot.root 'public\fonts\nunito.ttf'))
  $font = New-Object System.Drawing.Font($privateFonts.Families[0],11)
  $bold = New-Object System.Drawing.Font($privateFonts.Families[0],12,[System.Drawing.FontStyle]::Bold)
  $cream = [System.Drawing.ColorTranslator]::FromHtml('#fff9eb')
  $teal = [System.Drawing.ColorTranslator]::FromHtml('#24554e')
  $sage = [System.Drawing.ColorTranslator]::FromHtml('#e8eedc')
  $uri = [Uri]$boot.url
  $origin = $uri.GetLeftPart([UriPartial]::Authority)
  $secret = $uri.Fragment.Substring(1)
  $client = New-Object System.Net.Http.HttpClient
  $client.Timeout = [TimeSpan]::FromSeconds(20)
  $client.DefaultRequestHeaders.Add('Authorization',('Bearer ' + $secret))
  $client.DefaultRequestHeaders.Add('Origin',$origin)
  $script:pending = $null; $script:status = $null; $script:exiting = $false
  $script:compact = $false; $script:openWhenReady = $false; $script:lastRead = [DateTime]::MinValue; $script:hydrated=$false; $script:queued=$null; $script:showOnStartup=$true
  $script:ownedWindows = New-Object 'System.Collections.Generic.List[System.IntPtr]'
  $script:pendingWindows = New-Object System.Collections.ArrayList
  $script:windowTag = 'MiniopolyOwned-' + [Guid]::NewGuid().ToString('N')
  $windowFile = Join-Path $boot.stateDirectory 'launcher-window.json'
  $preferences = $null
  try { $preferences = Get-Content -LiteralPath $windowFile -Raw | ConvertFrom-Json } catch {}

  $form = New-Object System.Windows.Forms.Form
  $form.Text = 'Miniopoly Game Launcher v' + $boot.version
  $form.Font = $font; $form.BackColor = $cream; $form.ForeColor = $teal
  $form.AutoScaleMode = [System.Windows.Forms.AutoScaleMode]::Dpi
  $form.ClientSize = New-Object System.Drawing.Size(420,600)
  $form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedSingle
  $form.MaximizeBox = $false; $form.TopMost = $true
  $form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
  $area = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
  $form.Location = New-Object System.Drawing.Point(($area.Right - $form.Width - 24),($area.Top + 32))
  if($preferences) {
    $x = [int]$preferences.x; $y = [int]$preferences.y
    $visible = @([System.Windows.Forms.Screen]::AllScreens | Where-Object { $_.WorkingArea.IntersectsWith((New-Object System.Drawing.Rectangle($x,$y,200,100))) }).Count -gt 0
    if($visible) { $form.Location = New-Object System.Drawing.Point($x,$y) }
    $form.TopMost = $preferences.topmost -ne $false
  }
  $layout = New-Object System.Windows.Forms.FlowLayoutPanel
  $layout.Dock = 'Fill'; $layout.FlowDirection = 'TopDown'; $layout.WrapContents = $false
  $layout.Padding = New-Object System.Windows.Forms.Padding(18)
  $layout.AutoScroll = $true; $form.Controls.Add($layout)
  function Label($text,$height) {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = $text; $label.Size = New-Object System.Drawing.Size(378,$height)
    $label.UseCompatibleTextRendering = $true
    $label.Margin = New-Object System.Windows.Forms.Padding(0,0,0,8)
    $layout.Controls.Add($label); return $label
  }
  function Button($text,$handler) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $text; $button.Size = New-Object System.Drawing.Size(378,43)
    $button.FlatStyle = 'Flat'; $button.FlatAppearance.BorderSize = 0
    $button.BackColor = $sage; $button.ForeColor = $teal
    $button.UseCompatibleTextRendering = $true
    $button.Margin = New-Object System.Windows.Forms.Padding(0,0,0,8)
    $button.Add_Click($handler); $layout.Controls.Add($button); return $button
  }
  $title = Label 'MINIOPOLY  /  GAME LAUNCHER' 27; $title.Font = $bold
  $versionLabel = Label ('Version ' + $boot.version) 20
  $statusLabel = Label 'Connecting to your host controller...' 43
  $return = Button 'Return to Game' { Open-Game }
  $return.BackColor = $teal; $return.ForeColor = $cream
  $exitGame = Button 'Exit Game' { Request-Exit $false }
  $primary = New-Object System.Windows.Forms.FlowLayoutPanel
  $primary.Size = New-Object System.Drawing.Size(378,51); $primary.Margin = New-Object System.Windows.Forms.Padding(0)
  foreach($button in @($return,$exitGame)) { $button.Width=181; $button.Margin=New-Object System.Windows.Forms.Padding(0,0,8,8); $layout.Controls.Remove($button); $primary.Controls.Add($button) }
  $layout.Controls.Add($primary); $layout.Controls.SetChildIndex($primary,3)
  $copy = Button 'Copy player link' { if($script:status.inviteUrl) { [System.Windows.Forms.Clipboard]::SetText([string]$script:status.inviteUrl); $statusLabel.Text = 'Player link copied. Share the online password separately.' } }
  $size = Button 'Compact view' { Set-Compact (-not $script:compact) }
  $top = New-Object System.Windows.Forms.CheckBox
  $top.Text = 'Always on top'; $top.Checked = $form.TopMost
  $top.Size = New-Object System.Drawing.Size(378,28); $top.UseCompatibleTextRendering = $true
  $top.Add_CheckedChanged({ $form.TopMost = $top.Checked; Save-Window })
  $layout.Controls.Add($top)
  $mode = New-Object System.Windows.Forms.ComboBox
  $mode.DropDownStyle = 'DropDownList'; $mode.Size = New-Object System.Drawing.Size(378,30)
  $mode.Items.AddRange(@('Local Multiplayer','Online Players')); $mode.SelectedIndex = 0
  $layout.Controls.Add($mode)
  $start = Button 'Start hosting' {
    if(-not $script:status) { return }
    $wanted = if($mode.SelectedIndex -eq 1) { 'online' } else { 'local' }
    if($wanted -eq 'online' -and (-not $script:status.passwordConfigured -or -not $script:status.routerReady -or -not $script:status.ip)) {
      $statusLabel.Text = 'Finish Online connection in Host Settings first.'; Open-Library 'setup'; return
    }
    $body = @{ mode=$wanted; ip=$script:status.ip; routerReady=$script:status.routerReady; autoOpen=$script:status.autoOpen; gameSettings=$script:status.gameSettings }
    $script:openWhenReady = $script:status.autoOpen -ne $false
    Send-Api 'start' $body { param($value) Render-Status $value }
  }
  $settings = Button 'Host Settings' { Open-Library 'setup' }
  $saves = Button 'Saved Games / Join a Game' { Open-Library 'saves' }
  $guide = Button 'Rules, Boards and Properties' { Open-Library 'learn' }
  $ranks = Button 'Rankings and Records' { Open-Library 'ranks' }
  $stop = Button 'Stop hosting' {
    if([System.Windows.Forms.MessageBox]::Show('Stop hosting? Connected players will disconnect. Saved matches stay on this PC.','Miniopoly','YesNo','Question') -eq 'Yes') {
      $script:openWhenReady = $false; Send-Api 'stop' @{} { param($value) Render-Status $value }
    }
  }
  $library = Button 'Full Game Launcher' { Open-Library 'home' }
  $extra = New-Object System.Windows.Forms.FlowLayoutPanel
  $extra.Size = New-Object System.Drawing.Size(378,153); $extra.Margin = New-Object System.Windows.Forms.Padding(0)
  foreach($button in @($library,$settings,$saves,$guide,$ranks,$stop)) {
    $button.Width=181; $button.Height=43; $button.Margin=New-Object System.Windows.Forms.Padding(0,0,8,8)
    $layout.Controls.Remove($button); $extra.Controls.Add($button)
  }
  $layout.Controls.Add($extra)
  $fullControls = @($mode,$start,$extra)
  $tip = Label 'Minimize or X keeps hosting in the tray. Exit Game closes Miniopoly and stops hosting; saved matches remain.' 55
  function Save-Window {
    try {
      [System.IO.Directory]::CreateDirectory($boot.stateDirectory) | Out-Null
      @{ x=$form.Left; y=$form.Top; compact=$script:compact; topmost=$form.TopMost } | ConvertTo-Json | Set-Content -LiteralPath $windowFile -Encoding UTF8
    } catch {}
  }
  function Set-Compact($value) {
    $script:compact = [bool]$value
    foreach($control in $fullControls) { $control.Visible = -not $script:compact }
    $tip.Visible = -not $script:compact
    $height = if($script:compact){340}else{710}
    $work = [System.Windows.Forms.Screen]::FromControl($form).WorkingArea
    $form.ClientSize = New-Object System.Drawing.Size(420,([Math]::Min($height,$work.Height-70)))
    $form.Top = [Math]::Max($work.Top,[Math]::Min($form.Top,$work.Bottom-$form.Height))
    $size.Text = if($script:compact){'Expand launcher'}else{'Compact view'}
    Save-Window
  }
  function Show-Launcher {
    # Restore BEFORE Show: showing a minimized form can trigger Resize and hide it again.
    # Hidden child-process startup flags can also suppress Application.Run's first show.
    $form.WindowState = 'Normal'
    $work = [System.Windows.Forms.Screen]::FromControl($form).WorkingArea
    $form.Left = [Math]::Max($work.Left,[Math]::Min($form.Left,$work.Right-$form.Width))
    $form.Top = [Math]::Max($work.Top,[Math]::Min($form.Top,$work.Bottom-$form.Height))
    $form.ShowInTaskbar = $true
    $form.Show()
    [MiniopolyWindows]::ShowWindow($form.Handle,9) | Out-Null
    $form.BringToFront(); $form.Activate()
    [MiniopolyWindows]::SetForegroundWindow($form.Handle) | Out-Null
  }
  function Focus-Window($prefix) {
    $handle = [MiniopolyWindows]::Find($prefix,$script:windowTag)
    if($handle -eq [IntPtr]::Zero) { return $false }
    [MiniopolyWindows]::ShowWindow($handle,9) | Out-Null
    [MiniopolyWindows]::SetForegroundWindow($handle) | Out-Null
    return $true
  }
  function Open-Address($address) {
    # App windows share the default browser's existing profile, seats and avatars.
    $edge = @((Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),(Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    $chrome = @((Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),(Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),(Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe')) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    $association = try { (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice').ProgId } catch { '' }
    $browser = if($edge -and $association -like 'MSEdge*'){$edge}elseif($chrome -and $association -like 'ChromeHTML*'){$chrome}elseif($edge){$edge}else{$chrome}
    if(-not $browser) { $statusLabel.Text='Install Microsoft Edge or Chrome to open a game window.'; return }
    # Each --app window gets a short-lived invisible title marker. Claim its
    # exact HWND, then close only handles bearing this launcher's Win32 tag.
    # Never terminate a shared browser process or match ordinary tab titles.
    $id = [Guid]::NewGuid().ToString('N')
    $builder = New-Object System.UriBuilder($address)
    $extraQuery = 'miniDesktopWindow=' + $id
    $builder.Query = if($builder.Query.Length -gt 1){$builder.Query.Substring(1) + '&' + $extraQuery}else{$extraQuery}
    $marker = [string][char]0x2060
    foreach($hex in $id.ToCharArray()) { $bits=[Convert]::ToString([Convert]::ToInt32([string]$hex,16),2).PadLeft(4,'0'); foreach($bit in $bits.ToCharArray()) { $marker += if($bit -eq '0'){[string][char]0x200b}else{[string][char]0x200c} } }
    $marker += [string][char]0x2060
    $script:pendingWindows.Add(@{marker=$marker;expires=[DateTime]::Now.AddSeconds(55)}) | Out-Null
    Start-Process -FilePath $browser -ArgumentList @('--app="' + $builder.Uri.AbsoluteUri + '"')
  }
  function Open-Library($target) {
    Send-Api 'launcher/navigate' @{target=$target} {
      param($value)
      if((Focus-Window 'Miniopoly · Game Launcher') -or (Focus-Window 'Miniopoly · Host Game Setup')) { return }
      Open-Address ($origin + '/?desktop=1#' + $secret)
    }
  }
  function Open-Game {
    if(-not $script:status -or $script:status.phase -ne 'ready') { $statusLabel.Text = 'Start hosting first, or open Host Settings.'; return }
    $prefix = if($script:status.mode -eq 'online'){'Miniopoly Private Online Game'}else{'Mini-opoly Wi-Fi Multiplayer'}
    if(Focus-Window $prefix) { return }
    Send-Api 'launcher/game' @{} { param($value) Open-Address $value.url }
  }
  function Render-Status($value) {
    $script:status = $value
    if(-not $script:hydrated) { $script:hydrated=$true; $mode.SelectedIndex=if($value.mode -eq 'online'){1}else{0} }
    $live = $value.phase -notin @('stopped','error'); $ready = $value.phase -eq 'ready'
    $connection = if($value.mode -eq 'online'){'Online'}else{'Local'}
    $statusLabel.Text = switch($value.phase) {
      'ready' { "$connection hosting - ready" }
      'stopped' { 'Hosting stopped. Choose Local or Online to begin.' }
      'certificate' { 'Online hosting - preparing trusted HTTPS...' }
      'starting' { 'Starting your game...' }
      'address-changed' { 'Your public IP changed. Open Host Settings.' }
      default { [string]$value.error }
    }
    $mode.Enabled = -not $live; $start.Enabled = -not $live; $stop.Enabled = $live
    $return.Enabled = $ready; $copy.Enabled = $ready
    if($live) { $mode.SelectedIndex = if($value.mode -eq 'online'){1}else{0} }
    if($script:openWhenReady -and $ready) { $script:openWhenReady = $false; Open-Game }
  }
  function Send-Api($action,$body,$callback) {
    if($script:pending) {
      if($script:pending.action -eq 'status' -and $action -ne 'status') { $script:queued=@{action=$action;body=$body;callback=$callback}; return }
      $statusLabel.Text = 'Finishing the previous launcher action...'; return
    }
    $method = if($null -eq $body){[System.Net.Http.HttpMethod]::Get}else{[System.Net.Http.HttpMethod]::Post}
    $request = New-Object System.Net.Http.HttpRequestMessage($method,($origin + '/api/' + $action))
    if($null -ne $body) { $request.Content = New-Object System.Net.Http.StringContent(($body | ConvertTo-Json -Depth 8 -Compress),[System.Text.Encoding]::UTF8,'application/json') }
    $script:pending = @{task=$client.SendAsync($request); request=$request; callback=$callback;action=$action}
  }
  $tray = New-Object System.Windows.Forms.NotifyIcon
  $tray.Icon = [System.Drawing.SystemIcons]::Application; $tray.Text = 'Miniopoly Game Launcher v' + $boot.version; $tray.Visible = $true
  $menu = New-Object System.Windows.Forms.ContextMenuStrip
  $menu.Items.Add('Show Launcher',$null,{ Show-Launcher }) | Out-Null
  $menu.Items.Add('Return to Game',$null,{ Open-Game }) | Out-Null
  function Claim-Windows {
    foreach($pending in @($script:pendingWindows.ToArray())) {
      $handle=[MiniopolyWindows]::FindMarker($pending.marker)
      if($handle -ne [IntPtr]::Zero) {
        if([MiniopolyWindows]::SetProp($handle,$script:windowTag,[IntPtr]1)) { $script:ownedWindows.Add($handle) }
        $script:pendingWindows.Remove($pending)
      } elseif([DateTime]::Now -gt $pending.expires) { $script:pendingWindows.Remove($pending) }
    }
  }
  function Request-Exit($confirmed) {
    if($script:exiting) { return }
    $live = $script:status -and $script:status.phase -notin @('stopped','error')
    if(-not $confirmed -and $live -and [System.Windows.Forms.MessageBox]::Show('Exit Game and stop hosting? Miniopoly windows will close and connected players will disconnect. Your saved matches stay saved.','Miniopoly','YesNo','Question') -ne 'Yes') { return }
    $script:openWhenReady=$false; $script:queued=$null; $script:exiting=$true
    Claim-Windows
    if($script:pendingWindows.Count -gt 0) { $script:exitDeadline=[DateTime]::Now.AddSeconds(10); $statusLabel.Text='Closing Miniopoly windows...'; return }
    $form.Close()
  }
  $menu.Items.Add('Exit Game',$null,{ Request-Exit $false }) | Out-Null
  $tray.ContextMenuStrip = $menu; $tray.Add_DoubleClick({ Show-Launcher })
  $form.Add_FormClosing({ param($sender,$event) Save-Window; if(-not $script:exiting) { $event.Cancel=$true; $form.ShowInTaskbar=$false; $form.Hide() } })
  $form.Add_Resize({ if($form.WindowState -eq 'Minimized') { $form.ShowInTaskbar=$false; $form.Hide() } })
  $form.Add_ResizeEnd({ if($form.WindowState -eq 'Normal') { Save-Window } })
  if($preferences -and $preferences.mode -in @('local','online')) { $mode.SelectedIndex = if($preferences.mode -eq 'online'){1}else{0} }
  Set-Compact ($preferences -and $preferences.compact)
  [MiniopolyWindows]::Listen()
  $timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 150
  $timer.Add_Tick({
    if($script:showOnStartup) { $script:showOnStartup=$false; Show-Launcher }
    $line = $null
    while([MiniopolyWindows]::Commands.TryDequeue([ref]$line)) {
      try { $command=$line | ConvertFrom-Json; if($command.action -eq 'show') { Show-Launcher }; if($command.action -eq 'exit') { Request-Exit $true; return }; if($command.action -eq 'open') { Open-Address $command.url } } catch {}
    }
    Claim-Windows
    if($script:exiting -and $script:exitDeadline) { if($script:pendingWindows.Count -eq 0 -or [DateTime]::Now -gt $script:exitDeadline) { $form.Close() }; return }
    if([MiniopolyWindows]::InputClosed) { $script:exiting=$true; $form.Close(); return }
    if($script:pending -and $script:pending.task.IsCompleted) {
      $operation = $script:pending; $script:pending = $null
      try {
        $response = $operation.task.GetAwaiter().GetResult()
        try { $value = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json; if(-not $response.IsSuccessStatusCode) { throw $value.error }; & $operation.callback $value } finally { $response.Dispose() }
      } catch { $script:openWhenReady=$false; $statusLabel.Text = $_.Exception.Message }
      finally { $operation.request.Dispose() }
    }
    if(-not $script:pending -and $script:queued) { $next=$script:queued; $script:queued=$null; Send-Api $next.action $next.body $next.callback }
    if(-not $script:pending -and ([DateTime]::Now - $script:lastRead).TotalSeconds -ge 3) {
      $script:lastRead = [DateTime]::Now; Send-Api 'status' $null { param($value) Render-Status $value }
    }
  })
  $timer.Start()
  [System.Windows.Forms.Application]::Run($form)
  $timer.Stop(); foreach($handle in $script:ownedWindows) { [MiniopolyWindows]::CloseOwned($handle,$script:windowTag) }; $tray.Visible=$false; $tray.Dispose(); $client.Dispose(); $font.Dispose(); $bold.Dispose(); $privateFonts.Dispose()
} catch {
  try { Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'Miniopoly Launcher could not start') | Out-Null } catch {}
  exit 1
}
