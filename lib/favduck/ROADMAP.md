# FavDuck Yol Haritası (Roadmap)

Bu dosya FavDuck modülü için planlanan ve ileride hayata geçirilecek "Self-Healing (Kendi Kendini Onaran)" scraper fikirlerini içerir.

## 🦆 FavDuck Self-Healing Scraper Projesi

### Problem Tanımı
E-ticaret siteleri (Decathlon, Trendyol, Amazon vb.) sürekli tasarım günceller. Bu da kodun içine gömülü (hardcoded) CSS selector'larının (örneğin `.price`) bozulmasına ve uygulamanın veri çekememesine neden olur.

### Önerilen Çözüm Mimarisi
1. **Watcher (Gözlemci):** Sisteme eklenen ürünleri belirli aralıklarla (haftalık/aylık) otomatik tarar.
2. **Anomaly Detection (Hata Saptama):** Veri çekme başarısız olduğunda (fiyat=0, başlık=null) alarm üretir.
3. **DOM Discovery (AI Analizi):** Bozuk olan sayfanın güncel HTML yapısını AI'a (Antigravity) gönderir.
4. **Dynamic Registry:** Selector'lar koddan bağımsız bir `json` dosyasında tutulur. AI yeni selector'ı bulduğunda bu dosya güncellenir ve kod yazmadan sistem düzelir.

### Teknik Gereksinimler
- Arka plan tarama modülü (Scanner).
- AI destekli selector keşif fonksiyonu.
- Dinamik Selector Veritabanı (JSON tabanlı).

---
*Not: Kullanıcı "ileride hayata geçirelim" dediği için bu not buraya kaydedilmiştir.*
