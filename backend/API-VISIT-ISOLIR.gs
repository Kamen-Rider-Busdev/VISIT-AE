/**
 * ==============================================================================
 * BACKEND API WEB APP GOOGLE APPS SCRIPT: VISIT-AE
 * SISTEM RETENSI PELANGGAN ISOLIR GRIYANET (GITHUB PAGES BRIDGE)
 * ==============================================================================
 *
 * Keamanan & Konfigurasi:
 * - ZERO HARDCODED SECRET: Seluruh ID (Drive Folder ID, Spreadsheet ID opsional,
 *   dan Kode Akses Aplikasi) disimpan aman di PropertiesService (ScriptProperties).
 * - Seluruh pilihan dropdown dibaca langsung dari sheet MASTER_DROPDOWN.
 * - Kontrol akses wajib pada doGet(e) dan doPost(e) menggunakan Access Key.
 *
 * Target Deployment: Web App (Execute as: Me, Who has access: Anyone)
 * ==============================================================================
 */

var KONFIGURASI_SHEET = {
  SHEET_MONITORING: "MONITORING_CABANG",
  SHEET_RESPON: "RESPON_FORM_VISIT",
  SHEET_DROPDOWN: "MASTER_DROPDOWN",
  BARIS_HEADER_MONITORING: 9,
  BARIS_DATA_MONITORING: 10,
  BARIS_HEADER_DROPDOWN: 5,
  BARIS_DATA_DROPDOWN: 6
};

var PROP_KEYS = {
  SPREADSHEET_ID: "VISIT_AE_SPREADSHEET_ID",
  DRIVE_FOLDER_ID: "VISIT_AE_DRIVE_FOLDER_ID",
  APP_ACCESS_KEY: "VISIT_AE_APP_ACCESS_KEY",
  WEBAPP_URL: "VISIT_AE_WEBAPP_URL",
  PAGES_URL: "VISIT_AE_PAGES_URL"
};

/**
 * ------------------------------------------------------------------------------
 * MENU ADMIN SPREADSHEET: PENGELOLAAN KREDENSIAL AMAN & LINK ONBOARDING AE
 * ------------------------------------------------------------------------------
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("VISIT-AE Admin")
      .addItem("1. Setup Kredensial & Folder Aman", "bukaDialogSetupKredensial")
      .addItem("2. Buat Link Onboarding AE", "bukaDialogLinkOnboarding")
      .addSeparator()
      .addItem("3. Verifikasi Kesiapan Sistem", "verifikasiKesiapanSistem")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen dilewati (non-UI context): " + e.message);
  }
}

/**
 * Membuka dialog konfigurasi kredensial di Google Sheets (nilai disimpan ke ScriptProperties)
 */
function bukaDialogSetupKredensial() {
  var props = PropertiesService.getScriptProperties();
  var folderIdSaatIni = props.getProperty(PROP_KEYS.DRIVE_FOLDER_ID) || "";
  var accessKeySudahAda = Boolean(props.getProperty(PROP_KEYS.APP_ACCESS_KEY));
  var ssAktifId = SpreadsheetApp.getActiveSpreadsheet().getId();

  var template = HtmlService.createTemplate(
    '<!DOCTYPE html><html><head><base target="_top">' +
    '<style>' +
    'body{font-family:Inter,Arial,sans-serif;padding:14px;color:#0F172A;font-size:13px;background:#F8FAFC;}' +
    '.card{background:#FFF;border:1px solid #E2E8F0;border-radius:10px;padding:14px;}' +
    'label{display:block;font-weight:600;margin-top:10px;margin-bottom:4px;font-size:12px;color:#334155;}' +
    'input{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #CBD5E1;border-radius:8px;font-family:monospace;font-size:12px;}' +
    '.row{display:flex;gap:8px;margin-top:6px;}' +
    '.btn{padding:9px 14px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;}' +
    '.btn-primary{background:#2563EB;color:#FFF;width:100%;margin-top:14px;}' +
    '.btn-secondary{background:#E2E8F0;color:#0F172A;white-space:nowrap;}' +
    '.note{font-size:11px;color:#64748B;margin-top:4px;line-height:1.4;}' +
    '.status{margin-top:10px;padding:8px;border-radius:8px;display:none;font-size:12px;font-weight:600;}' +
    '</style></head><body><div class="card">' +
    '<div style="font-weight:700;font-size:14px;margin-bottom:6px;">Setup Kredensial Aman (ScriptProperties)</div>' +
    '<div class="note">Seluruh ID dan kunci disimpan terisolasi di Google Apps Script Properties dan tidak pernah muncul di repositori publik.</div>' +
    '<label>ID Spreadsheet Aktif (Otomatis)</label>' +
    '<input type="text" id="ssId" readonly>' +
    '<label>ID Folder Google Drive (Foto Bukti Visit)</label>' +
    '<input type="text" id="folderId" placeholder="Contoh: salin ID dari URL folder Drive">' +
    '<div class="note">Ambil bagian akhir URL folder Drive: drive.google.com/drive/folders/<b>[ID_FOLDER]</b></div>' +
    '<label>Kode Akses Aplikasi (App Access Key)</label>' +
    '<div class="row">' +
    '<input type="text" id="accessKey" placeholder="Masukkan atau buat kunci acak kuat">' +
    '<button type="button" class="btn btn-secondary" onclick="buatKunciAcak()">Buat Acak</button>' +
    '</div>' +
    '<div class="note" id="keyHint"></div>' +
    '<button type="button" class="btn btn-primary" onclick="simpan()">Simpan Kredensial Aman</button>' +
    '<div id="statusBox" class="status"></div>' +
    '</div><script>' +
    'var initData = ' + JSON.stringify({
      ssId: ssAktifId,
      folderId: folderIdSaatIni,
      keyExists: accessKeySudahAda
    }) + ';' +
    'document.getElementById("ssId").value = initData.ssId;' +
    'document.getElementById("folderId").value = initData.folderId;' +
    'document.getElementById("keyHint").textContent = initData.keyExists ? "Kode akses sudah tersimpan. Kosongkan jika tidak ingin mengganti, atau isi/buat baru untuk merotasi kunci." : "Wajib diisi. Kunci ini melindungi endpoint Web App agar tidak dapat diakses pihak luar.";' +
    'function buatKunciAcak(){' +
    '  var chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_";' +
    '  var out="VAE-"; var arr=new Uint32Array(28); window.crypto.getRandomValues(arr);' +
    '  for(var i=0;i<arr.length;i++){out+=chars[arr[i]%chars.length];}' +
    '  document.getElementById("accessKey").value=out;' +
    '}' +
    'function simpan(){' +
    '  var box=document.getElementById("statusBox"); box.style.display="block"; box.style.background="#EFF6FF"; box.style.color="#1E40AF"; box.textContent="Menyimpan konfigurasi...";' +
    '  google.script.run.withSuccessHandler(function(res){' +
    '    box.style.background=res.sukses?"#ECFDF5":"#FEF2F2"; box.style.color=res.sukses?"#065F46":"#991B1B"; box.textContent=res.pesan;' +
    '  }).withFailureHandler(function(err){' +
    '    box.style.background="#FEF2F2"; box.style.color="#991B1B"; box.textContent="Gagal: "+err.message;' +
    '  }).simpanKonfigurasiAman({' +
    '    spreadsheetId:document.getElementById("ssId").value,' +
    '    driveFolderId:document.getElementById("folderId").value,' +
    '    accessKey:document.getElementById("accessKey").value' +
    '  });' +
    '}' +
    '</script></body></html>'
  ).evaluate().setWidth(460).setHeight(430);

  SpreadsheetApp.getUi().showModalDialog(template, "VISIT-AE | Setup Kredensial Aman");
}

/**
 * Menyimpan konfigurasi aman ke PropertiesService.getScriptProperties()
 */
function simpanKonfigurasiAman(formObj) {
  if (!formObj) {
    return { sukses: false, pesan: "Payload konfigurasi kosong." };
  }

  var folderId = ekstrakIdDariInput(String(formObj.driveFolderId || "").trim());
  var ssId = String(formObj.spreadsheetId || "").trim();
  var accessKey = String(formObj.accessKey || "").trim();

  if (!folderId) {
    return { sukses: false, pesan: "ID Folder Google Drive wajib diisi." };
  }

  // Validasi akses folder Drive secara langsung
  try {
    var folder = DriveApp.getFolderById(folderId);
    folder.getName();
  } catch (eDrive) {
    return { sukses: false, pesan: "Folder Drive tidak ditemukan atau tidak memiliki izin akses: " + eDrive.message };
  }

  var props = PropertiesService.getScriptProperties();
  var existingKey = props.getProperty(PROP_KEYS.APP_ACCESS_KEY);

  if (!accessKey && !existingKey) {
    return { sukses: false, pesan: "Kode Akses Aplikasi wajib dibuat untuk setup pertama kali." };
  }
  if (accessKey && accessKey.length < 12) {
    return { sukses: false, pesan: "Kode Akses minimal 12 karakter agar aman." };
  }

  var toSave = {};
  toSave[PROP_KEYS.DRIVE_FOLDER_ID] = folderId;
  if (ssId) toSave[PROP_KEYS.SPREADSHEET_ID] = ssId;
  if (accessKey) toSave[PROP_KEYS.APP_ACCESS_KEY] = accessKey;

  props.setProperties(toSave, false);
  return { sukses: true, pesan: "Kredensial dan ID Folder Drive berhasil diamankan di ScriptProperties." };
}

/**
 * Membuka dialog pembuat Link Onboarding AE (menggunakan URL fragment #cfg= yang tidak dikirim ke server GitHub)
 */
function bukaDialogLinkOnboarding() {
  var props = PropertiesService.getScriptProperties();
  var storedKey = props.getProperty(PROP_KEYS.APP_ACCESS_KEY) || "";
  var storedWebApp = props.getProperty(PROP_KEYS.WEBAPP_URL) || "";
  var storedPages = props.getProperty(PROP_KEYS.PAGES_URL) || "https://kamen-rider-busdev.github.io/VISIT-AE/";

  if (!storedKey) {
    SpreadsheetApp.getUi().alert("Setup Belum Lengkap", "Jalankan menu '1. Setup Kredensial & Folder Aman' terlebih dahulu untuk membuat Kode Akses.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top">' +
    '<style>' +
    'body{font-family:Inter,Arial,sans-serif;padding:14px;color:#0F172A;font-size:13px;background:#F8FAFC;}' +
    '.card{background:#FFF;border:1px solid #E2E8F0;border-radius:10px;padding:14px;}' +
    'label{display:block;font-weight:600;margin-top:10px;margin-bottom:4px;font-size:12px;color:#334155;}' +
    'input,textarea{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #CBD5E1;border-radius:8px;font-family:monospace;font-size:12px;}' +
    '.btn{padding:9px 14px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;margin-top:10px;}' +
    '.btn-primary{background:#2563EB;color:#FFF;width:100%;}' +
    '.btn-copy{background:#0F172A;color:#FFF;width:100%;}' +
    '.note{font-size:11px;color:#64748B;margin-top:4px;line-height:1.4;}' +
    '</style></head><body><div class="card">' +
    '<div style="font-weight:700;font-size:14px;margin-bottom:6px;">Generator Link Onboarding AE Aman</div>' +
    '<div class="note">Tautan menggunakan URL hash (#cfg=...) yang diproses otomatis di belakang layar oleh peramban AE tanpa perlu input pengaturan di tampilan aplikasi.</div>' +
    '<label>URL GitHub Pages (Frontend VISIT-AE)</label>' +
    '<input type="url" id="pagesUrl">' +
    '<label>URL Deployment Web App Apps Script (/exec)</label>' +
    '<input type="url" id="webappUrl" placeholder="https://script.google.com/macros/s/.../exec">' +
    '<button type="button" class="btn btn-primary" onclick="buatLink()">Buat & Simpan Link Onboarding</button>' +
    '<label>Tautan Siap Bagikan ke Grup AE</label>' +
    '<textarea id="hasilLink" rows="3" readonly placeholder="Link konfigurasi akan tampil di sini..."></textarea>' +
    '<button type="button" class="btn btn-copy" onclick="salin()">Salin Tautan</button>' +
    '<div id="msg" class="note" style="font-weight:600;color:#059669;"></div>' +
    '</div><script>' +
    'var dataInit = ' + JSON.stringify({ pages: storedPages, webapp: storedWebApp, key: storedKey }) + ';' +
    'document.getElementById("pagesUrl").value = dataInit.pages;' +
    'document.getElementById("webappUrl").value = dataInit.webapp;' +
    'function encodeB64(str){return btoa(unescape(encodeURIComponent(str)));}' +
    'function buatLink(){' +
    '  var p = document.getElementById("pagesUrl").value.trim();' +
    '  var w = document.getElementById("webappUrl").value.trim();' +
    '  if(!p || !w){alert("Mohon isi URL GitHub Pages dan URL Web App (/exec).");return;}' +
    '  var payload = JSON.stringify({ api: w, key: dataInit.key });' +
    '  var sep = p.indexOf("#") === -1 ? "#" : "&";' +
    '  var finalUrl = p.split("#")[0] + "#cfg=" + encodeURIComponent(encodeB64(payload));' +
    '  document.getElementById("hasilLink").value = finalUrl;' +
    '  google.script.run.simpanUrlReferensi(p, w);' +
    '  document.getElementById("msg").textContent = "Link berhasil dibuat. Bagikan link ini ke AE resmi melalui saluran internal.";' +
    '}' +
    'function salin(){' +
    '  var el = document.getElementById("hasilLink"); if(!el.value) return;' +
    '  el.select(); document.execCommand("copy");' +
    '  document.getElementById("msg").textContent = "Tautan tersalin ke clipboard.";' +
    '}' +
    '</script></body></html>'
  ).setWidth(480).setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, "VISIT-AE | Link Onboarding AE");
}

function simpanUrlReferensi(pagesUrl, webappUrl) {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    VISIT_AE_PAGES_URL: String(pagesUrl || "").trim(),
    VISIT_AE_WEBAPP_URL: String(webappUrl || "").trim()
  }, false);
}

/**
 * Verifikasi kelengkapan sheet dan ScriptProperties
 */
function verifikasiKesiapanSistem() {
  var ui = SpreadsheetApp.getUi();
  var ss = dapatkanSpreadsheet();
  var props = PropertiesService.getScriptProperties();

  var cek = [];
  cek.push("Sheet MONITORING_CABANG: " + (ss.getSheetByName(KONFIGURASI_SHEET.SHEET_MONITORING) ? "ADA" : "TIDAK DITEMUKAN"));
  cek.push("Sheet RESPON_FORM_VISIT: " + (ss.getSheetByName(KONFIGURASI_SHEET.SHEET_RESPON) ? "ADA" : "TIDAK DITEMUKAN"));
  cek.push("Sheet MASTER_DROPDOWN: " + (ss.getSheetByName(KONFIGURASI_SHEET.SHEET_DROPDOWN) ? "ADA" : "TIDAK DITEMUKAN"));

  var folderId = props.getProperty(PROP_KEYS.DRIVE_FOLDER_ID);
  if (folderId) {
    try {
      var fName = DriveApp.getFolderById(folderId).getName();
      cek.push("Folder Drive Foto: TERHUBUNG (" + fName + ")");
    } catch (e) {
      cek.push("Folder Drive Foto: ERROR AKSES (" + e.message + ")");
    }
  } else {
    cek.push("Folder Drive Foto: BELUM DIATUR");
  }

  var hasKey = Boolean(props.getProperty(PROP_KEYS.APP_ACCESS_KEY));
  cek.push("App Access Key: " + (hasKey ? "TERPASANG AMAN" : "BELUM DIATUR"));

  ui.alert("Status Kesiapan Sistem VISIT-AE", cek.join("\n"), ui.ButtonSet.OK);
}

/**
 * ------------------------------------------------------------------------------
 * 1. ENDPOINT GET: DATA WO AKTIF + MASTER DROPDOWN DINAMIS
 * ------------------------------------------------------------------------------
 */
function doGet(e) {
  try {
    var incomingKey = (e && e.parameter && e.parameter.key) ? e.parameter.key : "";
    var auth = verifikasiKunciAkses(incomingKey);
    if (!auth.ok) {
      return buatResponJSON({ sukses: false, kode: auth.kode, pesan: auth.pesan });
    }

    var ss = dapatkanSpreadsheet();
    var sheetMonitoring = ss.getSheetByName(KONFIGURASI_SHEET.SHEET_MONITORING);
    if (!sheetMonitoring) {
      return buatResponJSON({ sukses: false, kode: 500, pesan: "Sheet MONITORING_CABANG tidak ditemukan." });
    }

    var dropdownOptions = bacaMasterDropdown(ss);

    var hasil = {
      sukses: true,
      timestamp: new Date().toISOString(),
      totalAktif: 0,
      cabangList: [],
      pohonData: {},
      detailPelanggan: [],
      dropdownOptions: dropdownOptions
    };

    var lastRow = sheetMonitoring.getLastRow();
    var lastCol = Math.max(sheetMonitoring.getLastColumn(), 23);

    if (lastRow >= KONFIGURASI_SHEET.BARIS_DATA_MONITORING) {
      var values = sheetMonitoring.getRange(1, 1, lastRow, lastCol).getValues();
      var colMap = deteksiKolomMonitoring(values);

      var cabangDefault = "Malang";
      var judulAtas = String(values[0][0] || "").toUpperCase();
      if (judulAtas.indexOf("BATU") !== -1) cabangDefault = "Batu";
      else if (judulAtas.indexOf("PASURUAN") !== -1) cabangDefault = "Pasuruan";
      else if (judulAtas.indexOf("KEDIRI") !== -1) cabangDefault = "Kediri";
      else if (judulAtas.indexOf("BLITAR") !== -1) cabangDefault = "Blitar";
      else if (judulAtas.indexOf("JEMBER") !== -1) cabangDefault = "Jember";
      else if (judulAtas.indexOf("MADIUN") !== -1) cabangDefault = "Madiun";
      else if (judulAtas.indexOf("PROBOLINGGO") !== -1) cabangDefault = "Probolinggo";

      for (var r = colMap.barisHeader; r < values.length; r++) {
        var baris = values[r];
        var pppoe = colMap.pppoe > 0 ? String(baris[colMap.pppoe - 1] || "").trim() : "";
        if (!pppoe) continue;

        var namaPelanggan = colMap.namaPelanggan > 0 ? String(baris[colMap.namaPelanggan - 1] || "").trim() : "Pelanggan";
        var namaAE = colMap.namaAE > 0 ? String(baris[colMap.namaAE - 1] || "").trim() : "AE Lapangan";
        if (!namaAE) namaAE = "AE Belum Ditentukan";

        var paket = colMap.paket > 0 ? String(baris[colMap.paket - 1] || "").trim() : "";
        var hargaRaw = colMap.harga > 0 ? baris[colMap.harga - 1] : "";
        var harga = formatHarga(hargaRaw);
        var paymentKe = colMap.paymentKe > 0 ? String(baris[colMap.paymentKe - 1] || "").trim() : "P1";
        var alamat = colMap.alamat > 0 ? String(baris[colMap.alamat - 1] || "").trim() : "";
        var noHp = colMap.noTelp > 0 ? String(baris[colMap.noTelp - 1] || "").trim() : "";
        var statusVisit = colMap.statusVisit > 0 ? String(baris[colMap.statusVisit - 1] || "").trim() : "Belum Dikunjungi";
        var statusWO = colMap.statusWO > 0 ? String(baris[colMap.statusWO - 1] || "").trim() : "OPEN";
        if (!statusWO) statusWO = "OPEN";
        var statusWOUpper = statusWO.toUpperCase();

        var cabang = "";
        if (colMap.cabang > 0 && String(baris[colMap.cabang - 1] || "").trim()) {
          cabang = String(baris[colMap.cabang - 1] || "").trim();
        } else {
          cabang = inferensiCabangDariPPPoE(pppoe, cabangDefault);
        }

        var isClosed = statusWOUpper.indexOf("CLOSED") !== -1 ||
          statusWOUpper.indexOf("TERMINATE") !== -1 ||
          statusWOUpper.indexOf("SELESAI") !== -1;

        if (!isClosed) {
          if (!hasil.pohonData[cabang]) hasil.pohonData[cabang] = {};
          if (!hasil.pohonData[cabang][namaAE]) hasil.pohonData[cabang][namaAE] = [];

          var labelRingkas = "[" + pppoe + "] " + namaPelanggan +
            (paket ? " - " + paket : "") +
            (alamat ? " (" + alamat.substring(0, 35) + ")" : "");

          hasil.pohonData[cabang][namaAE].push(labelRingkas);
          hasil.totalAktif++;

          hasil.detailPelanggan.push({
            pppoe: pppoe,
            namaPelanggan: namaPelanggan,
            cabang: cabang,
            namaAE: namaAE,
            paket: paket,
            harga: harga,
            paymentKe: paymentKe,
            alamat: alamat,
            noHp: noHp,
            statusVisit: statusVisit || "Belum Dikunjungi",
            statusWO: statusWO,
            labelOpsi: labelRingkas
          });
        }
      }

      for (var cb in hasil.pohonData) {
        var totalWOCb = 0;
        for (var ae in hasil.pohonData[cb]) {
          totalWOCb += hasil.pohonData[cb][ae].length;
        }
        hasil.cabangList.push({
          nama: cb,
          label: cb + " (" + totalWOCb + " WO Aktif)",
          totalWO: totalWOCb
        });
      }
    }

    return buatResponJSON(hasil);
  } catch (err) {
    return buatResponJSON({ sukses: false, kode: 500, pesan: "Error doGet: " + err.message });
  }
}

/**
 * ------------------------------------------------------------------------------
 * 2. ENDPOINT POST: PENERIMAAN LAPORAN VISIT & UPLOAD FOTO KE GOOGLE DRIVE
 * ------------------------------------------------------------------------------
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (errLock) {
    return buatResponJSON({ sukses: false, kode: 503, pesan: "Server sibuk memproses antrean. Silakan kirim ulang dalam beberapa detik." });
  }

  try {
    var data = null;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (!data) {
      return buatResponJSON({ sukses: false, kode: 400, pesan: "Payload JSON tidak valid." });
    }

    var auth = verifikasiKunciAkses(data.accessKey || "");
    if (!auth.ok) {
      return buatResponJSON({ sukses: false, kode: auth.kode, pesan: auth.pesan });
    }

    var pppoeClean = String(data.pppoe || "").trim();
    var cabangClean = String(data.cabang || "").trim();
    var aeClean = String(data.namaAE || "").trim();

    if (!pppoeClean || !cabangClean || !aeClean) {
      return buatResponJSON({ sukses: false, kode: 400, pesan: "Data wajib (Cabang, Nama AE, atau PPPoE) belum lengkap." });
    }

    var ss = dapatkanSpreadsheet();
    var sheetRespon = ss.getSheetByName(KONFIGURASI_SHEET.SHEET_RESPON);
    var sheetMonitoring = ss.getSheetByName(KONFIGURASI_SHEET.SHEET_MONITORING);

    if (!sheetRespon) {
      return buatResponJSON({ sukses: false, kode: 500, pesan: "Sheet RESPON_FORM_VISIT tidak ditemukan." });
    }

    // 1. Unggah Foto ke Folder Drive Terotorisasi (jika ada fotoBase64)
    var urlFotoDrive = "-";
    if (data.fotoBase64) {
      var uploadRes = simpanFotoKeDrive(data.fotoBase64, pppoeClean, data.namaFileFoto);
      if (!uploadRes.sukses) {
        return buatResponJSON({ sukses: false, kode: 500, pesan: uploadRes.pesan });
      }
      urlFotoDrive = uploadRes.url;
    }

    // 2. Format Timestamp & Validasi GPS
    var tz = Session.getScriptTimeZone() || "Asia/Jakarta";
    var timestampText = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy HH:mm:ss");
    var gpsClean = String(data.gps || "").trim();
    var validasiGpsText = gpsClean ? ("Valid (" + gpsClean + ")") : "Tidak Terkunci";

    // 3. Tulis Baris Baru ke RESPON_FORM_VISIT (20 Kolom A..T IDENTIK dengan Template & XLOOKUP)
    var barisRespon = [
      timestampText,                                // A (1): Timestamp
      sanitasiSel(cabangClean),                     // B (2): Cabang
      sanitasiSel(aeClean),                         // C (3): Nama AE Pelaksana
      sanitasiSel(pppoeClean),                      // D (4): PPPoE (Primary Key XLOOKUP)
      sanitasiSel(data.namaPelanggan || ""),        // E (5): Nama Pelanggan
      sanitasiSel(data.urutanVisit || ""),          // F (6): Urutan Visit Hari Ini
      urlFotoDrive,                                 // G (7): Bukti Foto Visit (URL Drive)
      validasiGpsText,                              // H (8): Validasi GPS Lokasi
      sanitasiSel(data.topik1 || ""),               // I (9): [T1] Kondisi Layanan & Silaturahmi
      sanitasiSel(data.topik2 || ""),               // J (10): [T2] Mekanisme Tagihan (+30 Hari)
      sanitasiSel(data.topik3 || ""),               // K (11): [T3] Kondisi Finansial
      sanitasiSel(data.topik4 || ""),               // L (12): [T4] Kualitas Layanan & Komplain
      sanitasiSel(data.topik5 || ""),               // M (13): [T5] Penawaran Provider Lain
      sanitasiSel(data.topik6 || ""),               // N (14): [T6] Kesesuaian Paket & Solusi
      sanitasiSel(data.topik7 || ""),               // O (15): [T7] Komitmen Pembayaran
      sanitasiSel(data.catatan || "-"),             // P (16): Catatan Tambahan AE
      sanitasiSel(data.painPoint || ""),            // Q (17): Kategori Pain Point
      sanitasiSel(data.detailKendala || ""),        // R (18): Kelompok Detail Kendala
      sanitasiSel(data.kategoriUpaya || ""),        // S (19): Kategori Upaya Penyelamatan
      sanitasiSel(data.tglBayar || "-")             // T (20): Rencana Tanggal Bayar
    ];

    sheetRespon.appendRow(barisRespon);
    var rowInserted = sheetRespon.getLastRow();

    // 4. Tentukan Status Baru WO Berdasarkan Mapping MASTER_DROPDOWN
    var dropdownOptions = bacaMasterDropdown(ss);
    var statusBaru = tentukanStatusDariUpaya(data.kategoriUpaya, data.tglBayar, dropdownOptions);

    if (sheetMonitoring) {
      perbaruiStatusMonitoring(sheetMonitoring, pppoeClean, statusBaru);
    }

    return buatResponJSON({
      sukses: true,
      pesan: "Laporan hasil kunjungan berhasil disimpan.",
      pppoe: pppoeClean,
      urlFotoDrive: urlFotoDrive,
      statusBaruWO: statusBaru,
      barisDitulis: rowInserted
    });
  } catch (errPost) {
    return buatResponJSON({ sukses: false, kode: 500, pesan: "Error doPost: " + errPost.message });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ------------------------------------------------------------------------------
 * PEMBACAAN DINAMIS SHEET MASTER_DROPDOWN
 * ------------------------------------------------------------------------------
 */
function bacaMasterDropdown(ss) {
  var hasil = {
    cabang: [],
    paket: [],
    paymentKe: [],
    statusBayarKasir: [],
    statusAkhirWO: [],
    urutanVisit: [],
    topik1: [],
    topik2: [],
    topik3: [],
    topik4: [],
    topik5: [],
    topik6: [],
    topik7: [],
    kategoriUpaya: [],
    painPoint: [],
    detailKendalaMap: {}
  };

  var sheet = ss.getSheetByName(KONFIGURASI_SHEET.SHEET_DROPDOWN);
  if (!sheet) return hasil;

  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), 18);
  if (lastRow < KONFIGURASI_SHEET.BARIS_DATA_DROPDOWN) return hasil;

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headerRowIdx = KONFIGURASI_SHEET.BARIS_HEADER_DROPDOWN - 1;

  // Pemetaan header dinamis dengan fallback indeks baku
  var idxMap = {
    CABANG: 0,
    PAKET_INTERNET: 1,
    PAYMENT_KE: 2,
    STATUS_BAYAR_KASIR: 3,
    STATUS_AKHIR_WO: 4,
    URUTAN_VISIT: 5,
    TOPIK_1_SILATURAHMI: 6,
    TOPIK_2_TAGIHAN: 7,
    TOPIK_3_FINANSIAL: 8,
    TOPIK_4_KUALITAS: 9,
    TOPIK_5_KOMPETITOR: 10,
    TOPIK_6_PAKET: 11,
    TOPIK_7_KOMITMEN: 12,
    KATEGORI_UPAYA: 13,
    TARGET_STATUS_WO: 14,
    KATEGORI_PAIN_POINT: 15,
    KELOMPOK_DETAIL_KENDALA: 16
  };

  if (values[headerRowIdx]) {
    for (var c = 0; c < values[headerRowIdx].length; c++) {
      var hName = String(values[headerRowIdx][c] || "").trim().toUpperCase();
      if (idxMap.hasOwnProperty(hName)) {
        idxMap[hName] = c;
      }
    }
  }

  var simpleKeys = [
    ["CABANG", "cabang"],
    ["PAKET_INTERNET", "paket"],
    ["PAYMENT_KE", "paymentKe"],
    ["STATUS_BAYAR_KASIR", "statusBayarKasir"],
    ["STATUS_AKHIR_WO", "statusAkhirWO"],
    ["URUTAN_VISIT", "urutanVisit"],
    ["TOPIK_1_SILATURAHMI", "topik1"],
    ["TOPIK_2_TAGIHAN", "topik2"],
    ["TOPIK_3_FINANSIAL", "topik3"],
    ["TOPIK_4_KUALITAS", "topik4"],
    ["TOPIK_5_KOMPETITOR", "topik5"],
    ["TOPIK_6_PAKET", "topik6"],
    ["TOPIK_7_KOMITMEN", "topik7"]
  ];

  var seenSets = {};
  var upayaSeen = {};
  var painSeen = {};

  for (var r = KONFIGURASI_SHEET.BARIS_DATA_DROPDOWN - 1; r < values.length; r++) {
    var row = values[r];

    // Kolom daftar tunggal
    for (var k = 0; k < simpleKeys.length; k++) {
      var colKey = simpleKeys[k][0];
      var outKey = simpleKeys[k][1];
      var val = String(row[idxMap[colKey]] || "").trim();
      if (val) {
        if (!seenSets[outKey]) seenSets[outKey] = {};
        if (!seenSets[outKey][val]) {
          seenSets[outKey][val] = true;
          hasil[outKey].push(val);
        }
      }
    }

    // Kategori Upaya berpasangan dengan Target Status WO
    var upayaLabel = String(row[idxMap.KATEGORI_UPAYA] || "").trim();
    var targetStatus = String(row[idxMap.TARGET_STATUS_WO] || "").trim() || "OPEN";
    if (upayaLabel && !upayaSeen[upayaLabel]) {
      upayaSeen[upayaLabel] = true;
      hasil.kategoriUpaya.push({
        label: upayaLabel,
        targetStatus: targetStatus
      });
    }

    // Pain Point berpasangan dengan Detail Kendala
    var pp = String(row[idxMap.KATEGORI_PAIN_POINT] || "").trim();
    var dk = String(row[idxMap.KELOMPOK_DETAIL_KENDALA] || "").trim();
    if (pp) {
      if (!painSeen[pp]) {
        painSeen[pp] = true;
        hasil.painPoint.push(pp);
      }
      if (!hasil.detailKendalaMap[pp]) {
        hasil.detailKendalaMap[pp] = [];
      }
      if (dk && hasil.detailKendalaMap[pp].indexOf(dk) === -1) {
        hasil.detailKendalaMap[pp].push(dk);
      }
    }
  }

  return hasil;
}

/**
 * ------------------------------------------------------------------------------
 * FUNGSI UTILITAS KEAMANAN, PENYIMPANAN DRIVE, & PEMBARUAN SHEET
 * ------------------------------------------------------------------------------
 */
function dapatkanSpreadsheet() {
  var storedSsId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.SPREADSHEET_ID);
  if (storedSsId) {
    try {
      return SpreadsheetApp.openById(storedSsId);
    } catch (e) {
      // Fallback ke active spreadsheet jika script terikat pada sheet aktif
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function verifikasiKunciAkses(kunciMasuk) {
  var storedKey = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.APP_ACCESS_KEY);
  if (!storedKey) {
    return {
      ok: false,
      kode: 503,
      pesan: "Backend belum dikonfigurasi. Jalankan menu 'VISIT-AE Admin > 1. Setup Kredensial & Folder Aman' di Spreadsheet."
    };
  }

  var a = String(kunciMasuk || "").trim();
  var b = String(storedKey).trim();
  if (!a || a.length !== b.length) {
    return { ok: false, kode: 401, pesan: "Akses ditolak: Kode Akses tidak valid." };
  }

  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  if (diff !== 0) {
    return { ok: false, kode: 401, pesan: "Akses ditolak: Kode Akses tidak valid." };
  }

  return { ok: true, kode: 200, pesan: "Terverifikasi" };
}

function simpanFotoKeDrive(base64String, pppoe, namaFile) {
  var folderId = PropertiesService.getScriptProperties().getProperty(PROP_KEYS.DRIVE_FOLDER_ID);
  if (!folderId) {
    return {
      sukses: false,
      pesan: "ID Folder Drive belum diatur di ScriptProperties. Jalankan Setup Kredensial Aman terlebih dahulu."
    };
  }

  try {
    var folder = DriveApp.getFolderById(folderId);
    var cleanBase64 = base64String;
    var contentType = "image/jpeg";
    if (base64String.indexOf("data:") !== -1) {
      var parts = base64String.split(",");
      cleanBase64 = parts[1];
      var matchMime = parts[0].match(/:(.*?);/);
      if (matchMime) contentType = matchMime[1];
    }

    var decodedBytes = Utilities.base64Decode(cleanBase64);
    var tz = Session.getScriptTimeZone() || "Asia/Jakarta";
    var timeStampSlug = Utilities.formatDate(new Date(), tz, "yyyyMMdd_HHmmss");
    var safePppoe = String(pppoe || "WO").replace(/[^a-zA-Z0-9_-]/g, "_");
    var fileName = namaFile || ("FOTO_VISIT_" + safePppoe + "_" + timeStampSlug + ".jpg");

    var blob = Utilities.newBlob(decodedBytes, contentType, fileName);
    var file = folder.createFile(blob);
    // Tidak memaksa ANYONE_WITH_LINK agar mengikuti izin folder Drive internal yang aman
    return { sukses: true, url: file.getUrl() };
  } catch (errDrive) {
    return { sukses: false, pesan: "Gagal unggah foto ke Google Drive: " + errDrive.message };
  }
}

function tentukanStatusDariUpaya(kategoriUpaya, tglBayar, dropdownOptions) {
  var targetInput = String(kategoriUpaya || "").trim();
  if (dropdownOptions && dropdownOptions.kategoriUpaya) {
    for (var i = 0; i < dropdownOptions.kategoriUpaya.length; i++) {
      var item = dropdownOptions.kategoriUpaya[i];
      if (item.label.toLowerCase() === targetInput.toLowerCase()) {
        return item.targetStatus || "OPEN";
      }
    }
  }

  var upayaLow = targetInput.toLowerCase();
  if (upayaLow.indexOf("akan lanjut") !== -1 && tglBayar) {
    return "CLOSED (Terselamatkan)";
  }
  if (upayaLow.indexOf("putus") !== -1 || upayaLow.indexOf("terminate") !== -1 || upayaLow.indexOf("cabut") !== -1) {
    return "CLOSED (Terminate)";
  }
  if (upayaLow.indexOf("kosong") !== -1 || upayaLow.indexOf("jadwal") !== -1) {
    return "SCHEDULED (Visit Ulang)";
  }
  return "OPEN";
}

function perbaruiStatusMonitoring(sheet, pppoeTarget, statusBaru) {
  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), 23);
  if (lastRow < KONFIGURASI_SHEET.BARIS_DATA_MONITORING) return;

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var colMap = deteksiKolomMonitoring(values);

  for (var r = colMap.barisHeader; r < values.length; r++) {
    var pppoe = String(values[r][colMap.pppoe - 1] || "").trim();
    if (pppoe && pppoe.toLowerCase() === pppoeTarget.toLowerCase()) {
      var barisAsli = r + 1;
      if (colMap.statusWO > 0) {
        sheet.getRange(barisAsli, colMap.statusWO).setValue(statusBaru);
      }
      break;
    }
  }
}

function deteksiKolomMonitoring(values) {
  var colMap = {
    barisHeader: KONFIGURASI_SHEET.BARIS_HEADER_MONITORING,
    cabang: 2,
    pppoe: 4,
    namaPelanggan: 5,
    noTelp: 6,
    alamat: 7,
    paket: 8,
    harga: 9,
    paymentKe: 10,
    namaAE: 11,
    statusVisit: 12,
    statusWO: 23
  };

  for (var r = 0; r < Math.min(12, values.length); r++) {
    var baris = values[r];
    for (var c = 0; c < baris.length; c++) {
      var txt = String(baris[c] || "").trim().toUpperCase();
      if (!txt) continue;
      if (txt === "CABANG" || txt.indexOf("NAMA CABANG") !== -1) colMap.cabang = c + 1;
      else if (txt.indexOf("PPPOE") !== -1 || txt.indexOf("ID PELANGGAN") !== -1) {
        colMap.pppoe = c + 1;
        colMap.barisHeader = r + 1;
      }
      else if (txt.indexOf("NAMA PELANGGAN") !== -1) colMap.namaPelanggan = c + 1;
      else if (txt.indexOf("NO. WHATSAPP") !== -1 || txt.indexOf("NO TELP") !== -1 || txt.indexOf("NO HP") !== -1) colMap.noTelp = c + 1;
      else if (txt.indexOf("AE CLOSING") !== -1 || txt.indexOf("PEMILIK") !== -1) colMap.namaAE = c + 1;
      else if (txt.indexOf("PAKET") !== -1) colMap.paket = c + 1;
      else if (txt.indexOf("HARGA") !== -1) colMap.harga = c + 1;
      else if (txt.indexOf("PAYMENT") !== -1) colMap.paymentKe = c + 1;
      else if (txt.indexOf("STATUS VISIT") !== -1) colMap.statusVisit = c + 1;
      else if (txt.indexOf("STATUS AKHIR") !== -1 || txt === "STATUS WO") colMap.statusWO = c + 1;
      else if (txt.indexOf("TITIK") !== -1 || txt.indexOf("ALAMAT") !== -1) colMap.alamat = c + 1;
    }
  }

  return colMap;
}

function inferensiCabangDariPPPoE(pppoe, fallback) {
  var pLow = String(pppoe || "").toLowerCase();
  if (pLow.indexOf("-mlg-") !== -1) return "Malang";
  if (pLow.indexOf("-btu-") !== -1) return "Batu";
  if (pLow.indexOf("-pas-") !== -1) return "Pasuruan";
  if (pLow.indexOf("-kdr-") !== -1) return "Kediri";
  if (pLow.indexOf("-blt-") !== -1) return "Blitar";
  if (pLow.indexOf("-jbr-") !== -1) return "Jember";
  if (pLow.indexOf("-mdn-") !== -1) return "Madiun";
  if (pLow.indexOf("-pro-") !== -1) return "Probolinggo";
  return fallback;
}

function formatHarga(val) {
  if (val === "" || val === null || val === undefined) return "";
  if (typeof val === "number") {
    return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return String(val).trim();
}

function sanitasiSel(val) {
  var s = String(val === null || val === undefined ? "" : val).trim();
  if (/^[=+@]/.test(s) || /^-\s*[A-Za-z(]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function ekstrakIdDariInput(raw) {
  if (!raw) return "";
  var matchFolder = raw.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];
  var matchSheet = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSheet) return matchSheet[1];
  return raw;
}

function buatResponJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
