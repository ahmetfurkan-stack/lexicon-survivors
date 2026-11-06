# Hikâye için karakter model sayfaları

Bu sayfalar oyundaki altı oynanabilir karakterin hikâye çizimlerinde kullanılacak yüksek ayrıntılı çizim modellerini tanımlar. Oyun kimliği `assets/sprites/upgrade_v1/hero_*.png` içindeki 64×64 sprite'lardan gelir. Her karakter için ayrıca [tam boy yüksek ayrıntılı model referansı](character-reference-gallery.html) üretildi. Bu model referansları Neris örneğinin işçilik, ışık ve malzeme kalitesinde; sahne üretim brief'indeki piksel çizim yönü ayrıca korunur. Sprite ana siluet/renk/ekipman kaynağı, üretilen model görseli ise sahnelerdeki yüz, kumaş ve ayrıntı sürekliliği kaynağıdır.

## Ortak model kuralları

- Kaynak sprite ile aynı dış çizgiyi, ana renk bloklarını ve imza eşyayı koru. Model referansındaki detayları karakterin hikâye sürümü olarak sabitle; yeni kıyafet, rastgele insignia veya alternatif ekipman uydurma.
- Aynı karakterin 600 panel içindeki yüzü, saç/başlık şekli, vücut yapısı ve ekipmanı aynı modeldir. Yakın plan, tam boy, profil, arka açı ve aksiyon pozu için de aynı tasarım sayfasını izle.
- Duygu farkını göz, kaş, omuz, el ve ağırlık merkezinde göster. Karakteri pozdan poza başka yaşta, cinsiyette veya yapıda çizme.
- İzin verilen sahne değişimleri: toz, küçük çizik, ıslak kumaş, ışığın rengi, geçici yüz ifadesi ve sahnenin gerektirdiği kontrollü hasar. İmza rengi, silahı, başlığı, zırhı veya pelerini değiştiren kalıcı dönüşüm yok.
- Üretilmiş model referansları 1536×1024 PNG'dir; tam boy açıların tamamı ve ekipman ayrıntıları için tek kaynak bunlardır. Üzerinde yazı veya karakter adı bulunmaz.
- Bu referanslar production/model sheet'tir, oyuna atılacak sprite değildir. Oyun içi karakter sprite'ları 64×64 olarak kalır. Hikâye panel çizimlerinde pixel-art yönü, panel brief'indeki 640×360 mantıksal ölçek ve 2× nearest-neighbor kuralıyla korunur.

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

## Üretilmiş tam boy model referansları

| Karakter | Model görseli |
| --- | --- |
| Inky | `docs/story-art-600/references/inky.png` |
| Quillmaster | `docs/story-art-600/references/quillmaster.png` |
| Word Knight | `docs/story-art-600/references/word_knight.png` |
| Rune Sorceress | `docs/story-art-600/references/rune_sorceress.png` |
| Alchemist | `docs/story-art-600/references/alchemist.png` |
| Shadow Scribe | `docs/story-art-600/references/shadow_scribe.png` |

Görsellerin tümü 1536×1024 RGBA PNG'dir. Aynı modelin önden, 3/4 ve arkadan görünüşünü; ifade ve ekipman detaylarını birlikte içerir. Bunlar 600 hikâye sahnesinden ayrı, tutarlılık referanslarıdır.

## Üretilmiş NPC model referansları

| NPC | Model görseli |
| --- | --- |
| Neris | `docs/story-art-600/references/npcs/neris.png` |
| Mira | `docs/story-art-600/references/npcs/mira.png` |
| Ada | `docs/story-art-600/references/npcs/ada.png` |
| Lale | `docs/story-art-600/references/npcs/lale.png` |
| Lio | `docs/story-art-600/references/npcs/lio.png` |
| Shadow Double | `docs/story-art-600/references/npcs/shadow_double.png` |
| Blank Page / Whisper | `docs/story-art-600/references/npcs/blank_page.png` |

NPC model sayfaları da tam boy, şeffaf fonlu, yüksek ayrıntılı PNG'dir. Mira ayrı ve bağımsız bir kişi olarak çizilmiştir; Shadow Double insan siluetini korur; Blank Page'in yüz alanı boş bırakılmıştır. Gerçek piksel ölçüleri galeri ve manifestte kayıtlıdır.

### Ek yan karakterler

| NPC | Model görseli | Görsel imza / dramatik işlev |
| --- | --- | --- |
| Sera | `docs/story-art-600/references/npcs/extra/sera.png` | Turuncu rota çantası ve iki çentikli zarf makası; adresi ve teslim kararını korur. |
| Mara | `docs/story-art-600/references/npcs/extra/mara.png` | Onarılmış el feneri; geçit tanığıdır, kahramanı hemen bağışlamaz. |
| Yel | `docs/story-art-600/references/npcs/extra/yel.png` | Ters ölçü pergeli ve harita ruloları; iki farklı çıkış gösterir. |
| Tavi | `docs/story-art-600/references/npcs/extra/tavi.png` | Lekeli önlük ve çatlak ölçü kabı; Alchemist'in kararlarından zarar görmüştür. |
| Lira | `docs/story-art-600/references/npcs/extra/lira.png` | Arması sökülmüş nöbet zırhı; eski emri savunmadan anlatır. |
| Mürekkep Çocuğu | `docs/story-art-600/references/npcs/extra/murekkep-cocugu.png` | Not taşıyan genç yetişkin; tek kampanyaya ait maskot değildir. |
| Dilsiz Tamirci | `docs/story-art-600/references/npcs/extra/dilsiz-tamirci.png` | Boss düzeneklerinin dilini bilen arşiv mühendisi; çözümleri hazır vermez. |

Ek yan karakterlerin tamamı ayrı, tam boy şeffaf PNG model sayfasıdır. Galeriye düşük boyutlu önizleme yerine yüksek çözünürlüklü sayfa açılınca yüklenir.

## Üretilmiş boss model referansları

| Boss modeli | Model görseli |
| --- | --- |
| Red Pen Inquisitor | `docs/story-art-600/references/bosses/red_pen_inquisitor.png` |
| Syntax Titan | `docs/story-art-600/references/bosses/syntax_titan.png` |
| Oxymoron Ogre | `docs/story-art-600/references/bosses/oxymoron_ogre.png` |
| Homophone Harpy | `docs/story-art-600/references/bosses/homophone_harpy.png` |
| Lexicon Dragon | `docs/story-art-600/references/bosses/lexicon_dragon.png` |
| Run-on Reaper | `docs/story-art-600/references/bosses/run_on_reaper.png` |
| Malapropism Mimic | `docs/story-art-600/references/bosses/malapropism_mimic.png` |
| Vocabulary Void | `docs/story-art-600/references/bosses/vocabulary_void.png` |
| Punctuation Phantom | `docs/story-art-600/references/bosses/punctuation_phantom.png` |
| Double Negative Drake | `docs/story-art-600/references/bosses/double_negative_drake.png` |
| Palindrome Phantom | `docs/story-art-600/references/bosses/palindrome_phantom.png` |
| Tautology Twin | `docs/story-art-600/references/bosses/tautology_twin.png` |
| Dangling Modifier | `docs/story-art-600/references/bosses/dangling_modifier.png` |
| Spelling Spectre | `docs/story-art-600/references/bosses/spelling_spectre.png` |
| Idiom Imp | `docs/story-art-600/references/bosses/idiom_imp.png` |

Bu 15 boss modeli 20 dalgalık takvimdeki tekrar eden karşılaşmaları kapsar; aynı modelin farklı dalga adı yeni bir model sayılmaz. Her sayfada tam boy açılar, saldırı pozu ve imza malzeme/silah ayrıntıları bulunur. İki sheet'te süs amaçlı küçük işaretler görülebilir; sahne görsellerinde yazı ve sahte yazı yasağı geçerlidir.

## Devam eden karakterler için model sayfası standardı
