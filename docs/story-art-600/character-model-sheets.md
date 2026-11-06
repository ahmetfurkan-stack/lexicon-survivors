# Hikâye için karakter model sayfaları

Bu sayfalar oyundaki altı oynanabilir karakterin hikâye çizimlerinde kullanılacak yüksek ayrıntılı çizim modellerini tanımlar. Kaynak kimlik görselleri [referans galerisinde](character-reference-gallery.html) ve `assets/sprites/upgrade_v1/hero_*.png` altında bulunur. Her kaynak sprite 64×64 pikseldir; nihai çizimler daha ayrıntılı olabilir ama karakter tasarımı değişemez.

## Ortak model kuralları

- Her panelde kaynak sprite ile aynı baş-gövde oranını, ana dış çizgiyi, kıyafeti, ana renk bloklarını ve imza eşyayı koru. Yeni kıyafet veya alternatif kostüm uydurma.
- Aynı karakterin 600 panel içindeki yüzü, saç/başlık şekli, vücut yapısı ve ekipmanı aynı modeldir. Yakın plan, tam boy, profil, arka açı ve aksiyon pozu için de aynı tasarım sayfasını izle.
- Duygu farkını göz, kaş, omuz, el ve ağırlık merkezinde göster. Karakteri pozdan poza başka yaşta, cinsiyette veya yapıda çizme.
- İzin verilen sahne değişimleri: toz, küçük çizik, ıslak kumaş, ışığın rengi, geçici yüz ifadesi ve sahnenin gerektirdiği kontrollü hasar. İmza rengi, silahı, başlığı, zırhı veya pelerini değiştiren kalıcı dönüşüm yok.
- Pixel-art çizgi ölçeği sabit olsun. Ana çizgi ve gölge kümeleri bilinçli, kenarlar basamaklı ve keskin; bulanıklaştırma, pürüzsüz vektör kenarı ve sonradan pixel filtresi yok.
- Standart sahne modeli 640×360 mantıksal piksel tuvalinde çizilir ve 2× nearest-neighbor ile 1280×720'ye çıkarılır. Yüz ve el ayrıntısı bu piksel ölçeğinde okunmalı.

## Inky — oyundaki mavi bilgin

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_inky.png`.

Kompakt ve hafif yapılı yetişkin gezgin-bilgin; yuvarlak/okunaklı yüz, kobalt sivri şapka, belirgin altın şapka kenarı ve tek altın tüy iğnesi. Kısa mavi pelerin, mavi ana giysi, sıcak altın küçük aksesuarlar. Siluetini uzatan yeni bir asa, uzun pelerin veya başka karaktere ait eşya eklenmez. Yürürken meraklı ve temkinli; saldırıda gövdeyi hafifçe öne verip silahını kontrollü savurur. Yorgunluk gözlerde ve düşen omuzda görünür, kostüm değişmez.

**İfade aralığı:** merak, suçluluk, şüphe, kararlı cesaret, Mira'yı hatırlarken yumuşama. Çocuklaştırma veya maskot ifadesi yok.

**Sabit tanıma işaretleri:** kobalt sivri şapka + altın kenar/tüy + kısa mavi pelerin.

## Quillmaster — oyundaki bordo düellocu

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_quillmaster.png`.

Uzun ve ince yetişkin silueti; koyu saç, bordo ceket, koyu eldiven ve çizgiyi kesen ince tüy-rapier. Başında kısa, açık renkli tüy detaylı düellocu başlığı bulunur; sivri büyücü şapkası yok. Duruşu dengeli ve yana dönüktür; rapier omuz hizasından ince bir çizgi gibi uzanır. Aksiyon çizgileri zarif ve ölçülü; Word Knight gibi ağır veya Shadow Scribe gibi gölgeli çizilmez.

**İfade aralığı:** kendinden emin nezaket, bastırılmış kaygı, savunmaya geçme, utanç, içten özür.

**Sabit tanıma işaretleri:** bordo ceket + kısa açık tüy başlık + ince rapier.

## Word Knight — oyundaki ağır zırhlı şövalye

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_word_knight.png`.

Geniş ve alçak ağırlık merkezli yetişkin beden; gümüş plaka zırh, mavi miğfer, kısa kırmızı sorguç ve koyu turkuaz pelerin. Sözlük biçimli ağır kılıç ile sağlam kalkanı iki ayrı, okunaklı kütle olarak koru. Eklem plakaları ve zırh çizikleri ayrıntılanabilir; zırhı ince elbiseye veya parlak altın şövalye zırhına dönüştürme. Savuruşta önce ayaklar ve kalça döner; güçlü darbe sonrası ağırlığı görünür biçimde toparlar.

**İfade aralığı:** disiplin, kuşku, pişmanlık, koruyuculuk, sakin kararlılık. Yüzü tamamen farklı bir şövalye yüzüyle değiştirme.

**Sabit tanıma işaretleri:** gümüş zırh + mavi miğfer/kırmızı sorguç + turkuaz pelerin + ağır kitap silahı.

## Rune Sorceress — oyundaki yetişkin kadın büyücü

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_rune_sorceress.png`.

Yetişkin kadın; sakin, odaklı yüz ve orta/ince beden yapısı. Gece mavisi katmanlı büyücü giysisi, açık mavi başlık ve hilal biçimli baş silueti, ince altın kenarlar. Mor rün ışığı tek bir belirgin odak olarak elde veya yakın çevrede görünür. Yeni sivri kobalt şapka, büyük asa veya kırmızı pelerin ekleme. Büyü hareketi parmak ve bilekten başlar, dirseğe ve omuz çizgisine yayılır; ışık kıyafet renklerini tamamen yutmaz.

**İfade aralığı:** kontrollü dikkat, yas, öfkeyi dizginleme, annesini anarken şefkat, kendi kararını verirken dinginlik.

**Sabit tanıma işaretleri:** açık mavi hilal başlık + gece mavisi katlar + altın ince işçilik + mor rün.

## Alchemist — oyundaki yetişkin kadın simyacı

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_alchemist.png`.

Yetişkin kadın ve sahada çalışan sağlam yapılı gezgin; yosun yeşili başlık/kısa pelerin, yeşil ana giysi, sıcak deri kemer ve birkaç küçük cam şişe. Kompakt pirinç mercek tanınır kalmalı; büyük gözlük veya laboratuvar önlüğüyle silueti baştan kurma. Şişeler kemerde güvenli durur, sayıları sahneden sahneye artmaz. Karıştırma hareketinde bir eli ölçer/karıştırır, diğeri şişeyi dengeler; patlama animasyonu komik maskot reaksiyonuna dönmez.

**İfade aralığı:** pratik odak, bilimsel merak, kendini suçlama, gergin mizah, kabullenme.

**Sabit tanıma işaretleri:** yosun yeşili başlık/pelerin + deri kemer + pirinç mercek + az sayıda şişe.

## Shadow Scribe — oyundaki siyah kukuletalı kılıç ustası

**Kimlik kaynağı:** `assets/sprites/upgrade_v1/hero_shadow_scribe.png`.

İnce yetişkin beden; siyah yakın duran kukuleta ve koyu yüz gölgesi, tek soğuk mavi göz ışığı, koyu kırmızı atkı/kenar ve dar hat katanası. Karanlık sahnelerde baş ve silah çevresine ince değer farkı koyarak biçimi kaybetme; gölgeyi duman, canavar veya pelerin yığınına dönüştürme. Kılıç kullanımı kısa, kontrollü ve anatomik olarak okunur. Shadow Double aynı temel modelin ayrı iradeli eşidir; yeni yüz deformasyonu veya canavar uzvu eklenmez, yalnızca ölçülü bordo kenar ışığıyla ayrılır.

**İfade aralığı:** sessiz gözlem, tetikte olma, bastırılmış korku, öfkesini tutma, karşısındakini eşit kabul etme.

**Sabit tanıma işaretleri:** siyah kukuleta + soğuk mavi göz + koyu kırmızı atkı + ince katana.

## Her karakter için sanatçıya verilecek model sayfası isteği

Kaynak sprite'ı kompozisyon ve kimlik referansı olarak ekle. Aynı karakterin önden, 3/4, profilden ve arkadan tam boy görünüşünü; yüz için nötr, kaygılı, öfkeli ve rahatlamış ifadeleri; imza silah/eşyasının elde ve dinlenme konumlarını gösteren tek bir **model referans sayfası** hazırla. Bu sayfa yalnızca üretim kılavuzudur; 600 panelden biri değildir ve oyun içine konmaz. Kaynak sprite'ın oranlarını ve tanıma işaretlerini koru, ayrıntıyı kaliteli el çizimi pixel-art kümeleriyle yükselt. Model sayfasına sadece karakter adı ve yön etiketleri yazılabilir; sahne görsellerinde yazı kesinlikle kullanılmaz.
