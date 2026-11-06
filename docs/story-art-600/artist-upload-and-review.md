# AI üretimi ve sanatçı müdahalesi: 600 panel teslim akışı

Bu çalışma dalı, 600 ayrı çizgi roman panelinin üretim ve değerlendirme alanıdır. AI üretimi ilk taslaktır; hiçbir görsel yalnızca üretildiği için oyuna kabul edilmiş sayılmaz. Sanatçı veya editör her dosyayı değiştirebilir, yeniden çizebilir, reddedebilir ya da aynı isteği yeni bir üretimle değiştirebilir.

## Her görselin kaynağı

1. `assets/data/story_art_600_manifest.json` içindeki tek bir kaydı seçin. `id`, karakter, tur, panel numarası ve `prompt` o görselin kanonik isteğidir.
2. Karakter referans galerisi ile ilgili 64×64 oyun sprite'ını açın. NPC veya boss varsa manifestteki model sayfasını da kullanın.
3. Yalnızca bu panel için tek bir görsel üretin. Kompozisyonu, karakter ifadesini, sahne ritmini ve piksel küme kalitesini insan gözüyle kontrol edin. Uymuyorsa dosyayı onarmak veya yeniden üretmek serbesttir; hatalı görseli sırf üretildi diye tutmayın.
4. Onay bekleyen özgün PNG'yi kayıpsız sanatçı/master arşivinde saklayın; PR açıklamasında arşiv yolunu belirtin. Oyun için manifestteki `expected_source_path` konumuna 1280×720 WebP dışa aktarın. Bu kaynak oyun paketi dosyasıdır; PNG master'ı runtime'a koymayın.
5. WebP'yi `expected_web_path` konumuna bayt bayt eşleyin. İki runtime WebP'sinin SHA-256 değeri aynı olmalı; 600 panelin runtime SHA-256 değerleri birbirinden farklı olmalı. Önceki bir kareyi başka isimle çoğaltmayın.

## İnsan incelemesi ve değiştirme hakkı

- AI taslağı yüklenince manifest kaydı `awaiting_human_review` olur; QA alanları `pending` kalır. Bu durum runtime'da kullanılmasına izin vermez.
- İnceleyen kişi yüz/siluet, kıyafet ve imza ekipmanı, NPC/boss kimliği, sahne olayı, özgün kompozisyon, okunaklı piksel kümeleri, yazı/emoji/dosya ikonu bulunmaması ve kaynak-web eşitliğini tek tek kontrol eder.
- Bir sorun varsa sanatçı PNG master'ı veya promptu düzeltebilir ve WebP'yi yeniden dışa aktarabilir. Eski dosyaya bağlı hash/QA bilgisini onaylı gibi bırakmayın; yeni sürüm yeniden incelemeye alınır.
- Yalnızca insan incelemesinden geçen dosyalarda QA maddelerini `pass` yapın ve durumu `approved` olarak değiştirin. Eksik veya tartışmalı maddeler `pending`/`needs_revision` kalır. Onay, dosya adı ve SHA-256 ile o anki sürüme bağlıdır.
- Karakter kanonunu daha iyi yapmak için model sayfası veya senaryo değişikliği gerekiyorsa önce referansı/senaryoyu güncelleyin, değişikliği PR açıklamasında belirtin ve etkilenmiş panelleri yeniden incelemeye alın. Tutarlılık adına hatalı tasarımı korumayın.

## PR teslim biçimi

Bir PR, tek veya küçük bir grup panel içerebilir. Açıklamaya panel ID'lerini, üretim aracını/insan çizim katkısını, yapılan rötuşları, QA sonuçlarını ve her panelin SHA-256 değerini ekleyin. Değiştirilen görselin 1280×720 olduğunu, kaynak PNG ile oyun WebP'sinin aynı sahne olduğunu ve 300 KB WebP sınırını koruduğunu belirtin. `story_expansion_regression.js` ve hikâye asset doğrulaması geçtiğinde dosyalar teknik olarak hazırdır; son görsel onayı yine editöre aittir.

Görsel üretme/yükleme PR'ı oyun kodu veya 600 görselin hepsini otomatik kabul etmez. Panel oyunda görünür hâle ancak kanonik kayıt, insan onayı, var olan dosya ve eş web kopyası birlikte sağlandığında gelmelidir.
