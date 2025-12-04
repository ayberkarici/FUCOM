# FUCOM Veri Formu - Next.js Uygulaması

FUCOM (Full Consistency Method) tabanlı çok kriterli karar verme (MCDM) değerlendirme anketinin dijitalleştirilmiş halidir. Form sonuçları Excel dosyası olarak Google Drive'a otomatik yüklenir.

## 🚀 Özellikler

- **3 Adımlı Form**: Demografik bilgiler, kriter sıralaması ve ikili önem belirleme
- **Sürükle-Bırak**: Kriterleri önem sırasına göre sıralamanıza olanak tanır
- **Dinamik Karşılaştırma**: Sıralama sonucuna göre ikili karşılaştırmalar otomatik oluşturulur
- **Excel Çıktısı**: Orijinal FUCOM veri formu yapısına uygun Excel dosyası üretilir
- **Google Drive Entegrasyonu**: Sonuçlar otomatik olarak belirlenen klasöre yüklenir

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Google Cloud Service Account

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
cd fucom-survey
npm install
```

### 2. Google Cloud Service Account Oluşturma

#### Adım 1: Google Cloud Console'a Gidin
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin

#### Adım 2: Google Drive API'yi Etkinleştirin
1. Sol menüden "APIs & Services" > "Library" seçin
2. "Google Drive API" arayın ve seçin
3. "Enable" butonuna tıklayın

#### Adım 3: Service Account Oluşturun
1. Sol menüden "APIs & Services" > "Credentials" seçin
2. "Create Credentials" > "Service Account" seçin
3. Service account için bir isim girin (örn: `fucom-survey-sa`)
4. "Create and Continue" tıklayın
5. Role olarak "Basic" > "Editor" seçin (veya daha kısıtlı roller)
6. "Done" tıklayın

#### Adım 4: JSON Key Oluşturun
1. Oluşturulan service account'a tıklayın
2. "Keys" sekmesine gidin
3. "Add Key" > "Create new key" seçin
4. "JSON" formatını seçin ve "Create" tıklayın
5. İndirilen JSON dosyasını güvenli bir yerde saklayın

#### Adım 5: Google Drive Klasörünü Paylaşın
1. Google Drive'da hedef klasöre gidin
2. Sağ tıklayın > "Share" / "Paylaş"
3. Service account e-mail adresini ekleyin (JSON dosyasındaki `client_email`)
4. "Editor" yetkisi verin

### 3. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

JSON key dosyasından değerleri alın:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
DRIVE_FOLDER_ID=1mRvzjLka8LaPY98oOb1HnVUgyXA3s3AS
```

> ⚠️ **Önemli**: `GOOGLE_PRIVATE_KEY` değerinde `\n` karakterleri olduğu gibi kalmalıdır. Tırnak işaretleri içinde yazın.

### 4. Uygulamayı Başlatın

```bash
# Development
npm run dev

# Production Build
npm run build
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 🌐 Vercel'e Deploy

### 1. Vercel CLI ile Deploy

```bash
npm i -g vercel
vercel
```

### 2. Environment Variables Ayarlayın

Vercel Dashboard'da:
1. Project Settings > Environment Variables
2. Aşağıdaki değişkenleri ekleyin:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `DRIVE_FOLDER_ID`

> 💡 **Not**: Vercel'de `GOOGLE_PRIVATE_KEY` için değeri eklerken `\n` karakterlerini gerçek satır sonlarına çevirmeniz gerekebilir.

## 📊 Excel Dosya Yapısı

Oluşturulan Excel dosyası şu bölümleri içerir:

1. **Değerlendirici Bilgileri** (Row 1-3)
   - Ad-Soyad, Yaş, Meslek, Cinsiyet, Eğitim Durumu

2. **Sıralama Belirleme** (Row 4-18)
   - Ana Kriterler sıralaması (C1, C2, C3)
   - Alt Kriterler sıralaması (Economical, Social, Environmental grupları)

3. **İkili Önem Belirleme** (Row 22-34)
   - Değerlendirme Skalası (WI, FI, EI, VI, AI)
   - Ana ve Alt Kriterler için ikili karşılaştırmalar

## 🔧 Teknik Detaylar

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Excel Generation**: ExcelJS
- **Google Drive API**: googleapis

## 📝 Kriterler

### Ana Kriterler
- C1: Economical (Ekonomik)
- C2: Social (Sosyal)
- C3: Environmental (Çevresel)

### Alt Kriterler

**Ekonomik Grup:**
- C11: Worklife (İş Yaşamı)
- C12: Income & Wealth (Gelir ve Servet)
- C13: Housing (Konut)

**Sosyal Grup:**
- C21: Health (Sağlık)
- C22: Education (Eğitim)
- C23: Civic Engagement (Sivil Katılım)

**Çevresel Grup:**
- C31: Infrastructure (Altyapı)
- C32: Safety (Güvenlik)
- C33: Environment/Green Space (Çevre/Yeşil Alan)
- C34: Life Satisfaction (Yaşam Memnuniyeti)

### Önem Skalası (FUCOM)
- **WI**: Çok Az Önemli (Weakly Important)
- **FI**: Orta Seviye Önemli (Fairly Important)
- **EI**: Eşit Önemde (Equally Important)
- **VI**: Çok Önemli (Very Important)
- **AI**: Kesinlikle Çok Önemli (Absolutely Important)

## 🐛 Sorun Giderme

### "Missing Google credentials" hatası
- `.env.local` dosyasının doğru yapılandırıldığından emin olun
- Private key'in tırnak içinde olduğundan emin olun

### "Failed to upload file to Google Drive" hatası
- Service account'un Drive klasörüne erişimi olduğundan emin olun
- Google Drive API'nin etkinleştirildiğinden emin olun

### Drag & Drop çalışmıyor
- Tarayıcınızın JavaScript'i desteklediğinden emin olun
- Sayfayı yenileyin

## 📄 Lisans

Bu proje akademik araştırma amaçlı geliştirilmiştir.
