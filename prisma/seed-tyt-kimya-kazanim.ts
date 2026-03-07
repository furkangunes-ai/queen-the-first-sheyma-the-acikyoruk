/**
 * TYT Kimya kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Kimya Dersi Öğretim Programı (2018)
 * 9. sınıf: sayfa 183-188, 10. sınıf: sayfa 189-193
 * 11-12. sınıf konuları AYT Kimya kazanımlarıyla aynı
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-kimya-kazanim.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface KazanimDef {
  code: string;
  subTopicName: string;
  description: string;
  details?: string;
  isKeyKazanim?: boolean;
}

// =====================================================================
// PDF'DEN ÇIKARILMIŞ KAZANIMLAR — TOPIC ADI → KAZANIM LİSTESİ
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== 9. SINIF KONULARI ====================

  // ==================== KİMYA BİLİMİ (9.1) ====================
  "Kimya Bilimi": [
    {
      code: "9.1.1.1",
      subTopicName: "Simyadan Kimyaya",
      description: "Kimyanın bilim olma sürecini açıklar.",
      details: [
        "a) Simya ile kimya bilimi arasındaki fark vurgulanır.",
        "b) Kimya biliminin gelişim süreci ele alınırken Mezopotamya, Çin, Hint, Mısır, Yunan, Orta Asya ve İslam uygarlıklarının kimya bilimine yaptığı katkılara ilişkin okuma parçası verilir.",
        "c) Simyadan kimyaya geçiş sürecine katkı sağlayan bilim insanlarının (Empedokles, Democritus, Aristo, Cabir bin Hayyan, Ebubekir er-Razi, Robert Boyle, Antoine Lavoisier) kimya bilimine ilişkin çalışmaları kısaca tanıtılır.",
      ].join("\n"),
    },
    {
      code: "9.1.2.1",
      subTopicName: "Kimya Disiplinleri ve Çalışma Alanları",
      description:
        "Kimyanın ve kimyacıların başlıca çalışma alanlarını açıklar.",
      details: [
        "a) Biyokimya, analitik kimya, organik kimya, anorganik kimya, fizikokimya, polimer kimyası ve endüstriyel kimya disiplinleri kısaca tanıtılır.",
        "b) İlaç, gübre, petrokimya, arıtım, boya-tekstil alanlarının kimya ile ilişkisi belirtilir.",
        "c) Kimya alanı ile ilgili kimya mühendisliği, metalurji mühendisliği, eczacı, kimyager, kimya öğretmenliği meslekleri tanıtılır.",
      ].join("\n"),
    },
    {
      code: "9.1.3.1",
      subTopicName: "Kimyanın Sembolik Dili",
      description:
        "Günlük hayatta sıklıkla etkileşimde bulunulan elementlerin adlarını sembolleriyle eşleştirir.",
      details: [
        "a) Element tanımı yapılır.",
        "b) Periyodik sistemdeki ilk 20 element ve günlük hayatta sıkça kullanılan krom, mangan, demir, kobalt, nikel, bakır, çinko, brom, gümüş, kalay, iyot, baryum, platin, altın, cıva, kurşun elementlerinin sembolleri tanıtılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.3.2",
      subTopicName: "Kimyanın Sembolik Dili",
      description: "Bileşiklerin formüllerini adlarıyla eşleştirir.",
      details: [
        "a) Bileşik tanımı yapılır.",
        "b) H₂O, HCl, H₂SO₄, HNO₃, CH₃COOH, CaCO₃, NaHCO₃, NH₃, Ca(OH)₂, NaOH, KOH, CaO ve NaCl bileşiklerinin yaygın adları tanıtılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.4.1",
      subTopicName: "İş Sağlığı ve Güvenliği",
      description:
        "Kimya laboratuvarlarında uyulması gereken iş sağlığı ve güvenliği kurallarını açıklar.",
      details: [
        "a) Kimyada kullanılan sağlık ve güvenlik amaçlı temel uyarı işaretleri (yanıcı, yakıcı, korozif, patlayıcı, tahriş edici, zehirli, radyoaktif ve çevreye zararlı) tanıtılır.",
        "b) İş sağlığı ve güvenliği için temel uyarı işaretlerinin bilinmesinin gerekliliği ve önemi vurgulanır.",
      ].join("\n"),
    },
    {
      code: "9.1.4.2",
      subTopicName: "İş Sağlığı ve Güvenliği",
      description:
        "Kimyasal maddelerin insan sağlığı ve çevre üzerindeki etkilerini açıklar.",
      details: [
        "a) Na, K, Fe, Ca, Mg, H₂O maddelerinin insan sağlığı ve çevre için önemine değinilir.",
        "b) Hg, Pb, CO₂, NO₂, SO₃, CO, Cl₂ maddelerinin insan sağlığı ve çevre üzerindeki zararlı etkileri vurgulanır.",
      ].join("\n"),
    },
    {
      code: "9.1.4.3",
      subTopicName: "İş Sağlığı ve Güvenliği",
      description:
        "Kimya laboratuvarında kullanılan bazı temel malzemeleri tanır.",
      details:
        "Beherglas, erlenmayer, dereceli silindir (mezür), pipet, cam balon, balon joje, büret ve ayırma hunisi gibi laboratuvarda bulunan temel araç gereçler tanıtılır.",
    },
  ],

  // ==================== ATOM VE YAPISI (9.2.1 + 9.2.2) ====================
  "Atom ve Yapısı": [
    {
      code: "9.2.1.1",
      subTopicName: "Atom Modelleri",
      description:
        "Dalton, Thomson, Rutherford ve Bohr atom modellerini açıklar.",
      details: [
        "a) Bohr atom modeli, atomların soğurduğu/yaydığı ışınlar ile ilişkilendirilir. Hesaplamalara girilmeden sadece ışın soğurma/yayma üzerinde durulur.",
        "b) Bohr atom modelinin sınırlılıkları belirtilerek modern atom teorisinin (bulut modelinin) önemi vurgulanır. Orbital kavramına girilmez.",
        "c) Atom modellerinin açıklanmasında bilişim teknolojilerinden (animasyon, simülasyon, video vb.) yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2.1",
      subTopicName: "Atomun Yapısı",
      description:
        "Elektron, proton ve nötronun yüklerini, kütlelerini ve atomda bulundukları yerleri karşılaştırır.",
      details: [
        "a) Elektron, proton, nötron, atom numarası, kütle numarası, izotop, izoton, izobar ve izoelektronik kavramları tanıtılır.",
        "b) Elektron, proton ve nötronun yük ve kütlelerinin nasıl bulunduğu sürecine ve izotop atomlarda ortalama atom kütlesi hesabına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PERİYODİK SİSTEM (9.2.3) ====================
  "Periyodik Sistem": [
    {
      code: "9.2.3.1",
      subTopicName: "Periyodik Sistem",
      description:
        "Elementlerin periyodik sistemdeki yerleşim esaslarını açıklar.",
      details: [
        "a) Mendeleyev'in periyodik sistem üzerine yaptığı çalışmalar ve Moseley'in katkıları üzerinde durulur.",
        "b) Atomların katman-elektron dağılımlarıyla periyodik sistemdeki yerleri arasındaki ilişki açıklanır. İlk 20 element esas olup diğer elementlerin katman elektron dağılımlarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.3.2",
      subTopicName: "Periyodik Sistem",
      description:
        "Elementleri periyodik sistemdeki yerlerine göre sınıflandırır.",
      details:
        "Elementlerin sınıflandırılması metal, ametal, yarı metal ve asal (soy) gazlar olarak yapılır.",
    },
    {
      code: "9.2.3.3",
      subTopicName: "Periyodik Özellikler",
      description: "Periyodik özelliklerin değişme eğilimlerini açıklar.",
      details: [
        "a) Periyodik özelliklerden metalik-ametalik, atom yarıçapı, iyonlaşma enerjisi, elektron ilgisi ve elektronegatiflik kavramları açıklanır; bunların nasıl ölçüldüğü konusuna girilmez.",
        "b) Kovalent, iyonik, metalik, van der Waals yarıçap tanımlarına girilmez.",
        "c) Periyodik özelliklerin açıklanmasında bilişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KİMYASAL TÜRLER ARASI ETKİLEŞİMLER (9.3) ====================
  "Kimyasal Türler Arası Etkileşimler": [
    {
      code: "9.3.1.1",
      subTopicName: "Kimyasal Tür",
      description: "Kimyasal türleri açıklar.",
      details: "Radikal kavramına girilmez.",
    },
    {
      code: "9.3.2.1",
      subTopicName: "Etkileşimlerin Sınıflandırılması",
      description:
        "Kimyasal türler arasındaki etkileşimleri sınıflandırır.",
      details: [
        "a) Bağlanan türler arası sınıflandırma, atomlar arası ve moleküller arası şeklinde yapılır; bu sınıflandırmanın getirdiği güçlüklere değinilir.",
        "b) Güçlü etkileşimlere örnek olarak iyonik, kovalent ve metalik bağ; zayıf etkileşimlere örnek olarak da hidrojen bağı ve van der Waals kuvvetleri verilir.",
      ].join("\n"),
    },
    {
      code: "9.3.3.1",
      subTopicName: "Güçlü Etkileşimler",
      description:
        "İyonik bağın oluşumunu iyonlar arası etkileşimler ile ilişkilendirir.",
      details: [
        "a) Nötr atomların ve tek atomlu iyonların Lewis sembolleri verilir. Örnekler periyodik sistemde ilk 20 element arasından seçilir.",
        "b) İyonik bileşiklerin yapısal birimleri ile molekül kavramının karıştırılmamasına vurgu yapılır.",
        "c) İyonik bağların açıklanmasında bilişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.3.2",
      subTopicName: "Güçlü Etkileşimler",
      description:
        "İyonik bağlı bileşiklerin sistematik adlandırmasını yapar.",
      details: [
        "a) Tek atomlu ve çok atomlu iyonların (NH₄⁺, OH⁻, NO₃⁻, SO₄²⁻, CO₃²⁻, PO₄³⁻, CN⁻, CH₃COO⁻) oluşturduğu bileşiklerin adlandırılması yapılır.",
        "b) Değişken değerlikli metallerin (Cu, Fe, Hg, Sn, Pb) oluşturduğu bileşiklerin adlandırılması yapılır.",
        "c) Hidrat bileşiklerinin adlandırmasına girilmez.",
      ].join("\n"),
    },
    {
      code: "9.3.3.3",
      subTopicName: "Güçlü Etkileşimler",
      description:
        "Kovalent bağın oluşumunu atomlar arası elektron ortaklaşması temelinde açıklar.",
      details: [
        "a) Kovalent bağlar sınıflandırılırken polar ve apolar kovalent bağlar verilir; koordine kovalent bağa girilmez.",
        "b) Basit moleküllerin (H₂, Cl₂, O₂, N₂, HCl, H₂O, BH₃, NH₃, CH₄, CO₂) Lewis elektron nokta formülleri üzerinden bağın ve moleküllerin polarlık-apolarlık durumları üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.3.4",
      subTopicName: "Güçlü Etkileşimler",
      description:
        "Kovalent bağlı bileşiklerin sistematik adlandırmasını yapar.",
      details:
        "H₂O, HCl, H₂SO₄, HNO₃, NH₃ bileşik örneklerinin sistematik adları verilir.",
    },
    {
      code: "9.3.3.5",
      subTopicName: "Güçlü Etkileşimler",
      description: "Metalik bağın oluşumunu açıklar.",
      details:
        "Metalik bağın açıklanmasında elektron denizi modeli kullanılır.",
    },
    {
      code: "9.3.4.1",
      subTopicName: "Zayıf Etkileşimler",
      description:
        "Zayıf ve güçlü etkileşimleri bağ enerjisi esasına göre ayırt eder.",
    },
    {
      code: "9.3.4.2",
      subTopicName: "Zayıf Etkileşimler",
      description:
        "Kimyasal türler arasındaki zayıf etkileşimleri sınıflandırır.",
      details: [
        "a) Van der Waals kuvvetleri (dipol-dipol etkileşimleri, iyon-dipol etkileşimleri, dipol-indüklenmiş dipol etkileşimleri, iyon-indüklenmiş dipol etkileşimleri ve London kuvvetleri) açıklanır.",
        "b) Dipol-dipol etkileşimleri, iyon-dipol etkileşimleri ve London kuvvetlerinin genel etkileşme güçleri karşılaştırılır.",
      ].join("\n"),
    },
    {
      code: "9.3.4.3",
      subTopicName: "Zayıf Etkileşimler",
      description:
        "Hidrojen bağları ile maddelerin fiziksel özellikleri arasında ilişki kurar.",
      details: [
        "a) Hidrojen bağının oluşumu açıklanır.",
        "b) Uygun bileşik serilerinin kaynama noktası değişimleri grafik üzerinde, hidrojen bağları ve diğer etkileşimler kullanılarak açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.5.1",
      subTopicName: "Fiziksel ve Kimyasal Değişimler",
      description:
        "Fiziksel ve kimyasal değişimi, kopan ve oluşan bağ enerjilerinin büyüklüğü temelinde ayırt eder.",
    },
  ],

  // ==================== BİLEŞİKLER (9.3 bileşik kısımları) ====================
  Bileşikler: [
    {
      code: "9.3.3.2b",
      subTopicName: "İyonik ve Kovalent Bileşikler",
      description:
        "Bileşikleri iyonik ve kovalent olarak sınıflandırır ve adlandırır.",
      details: [
        "a) İyonik bileşiklerin adlandırılması: tek atomlu ve çok atomlu iyonların oluşturduğu bileşikler.",
        "b) Kovalent bağlı bileşiklerin sistematik adlandırması.",
        "c) Bileşiklerin formüllerinden adlarına, adlarından formüllerine geçiş yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== MADDENİN HALLERİ (9.4) ====================
  "Maddenin Halleri": [
    {
      code: "9.4.1.1",
      subTopicName: "Maddenin Fiziksel Halleri",
      description:
        "Maddenin farklı hallerde olmasının canlılar ve çevre için önemini açıklar.",
      details: [
        "a) Suyun fiziksel hallerinin (katı, sıvı, gaz) farklı işlevler sağladığı vurgulanır.",
        "b) LPG, deodorantlardaki itici gazlar, LNG, soğutucularda kullanılan gazların davranışları üzerinden hal değişimlerinin önemi vurgulanır.",
        "c) Havadan azot ve oksijen eldesi üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "9.4.2.1",
      subTopicName: "Katılar",
      description:
        "Katıların özellikleri ile bağların güçü arasında ilişki kurar.",
      details:
        "Katılar sınıflandırılarak günlük hayatta sıkça karşılaşılan tuz, iyot, elmas ve çinko katılarının taneciklerini bir arada tutan kuvvetler üzerinde durulur.",
    },
    {
      code: "9.4.3.1",
      subTopicName: "Sıvılar",
      description: "Sıvılarda viskozite kavramını açıklar.",
    },
    {
      code: "9.4.3.2",
      subTopicName: "Sıvılar",
      description:
        "Sıvılarda viskoziteyi etkileyen faktörleri açıklar.",
      details: [
        "a) Viskozitenin moleküller arası etkileşim ile ilişkilendirilmesi sağlanır.",
        "b) Farklı sıvıların viskoziteleri sıcaklıkla ilişkilendirilir.",
        "c) Farklı sıcaklıklarda su, gliserin ve zeytinyağının viskozite deneyleri yaptırılır.",
      ].join("\n"),
    },
    {
      code: "9.4.3.3",
      subTopicName: "Sıvılar",
      description:
        "Kapalı kaplarda gerçekleşen buharlaşma-yoğuşma süreçleri üzerinden denge buhar basıncı kavramını açıklar.",
      details: [
        "a) Kaynama olayı dış basınca bağlı olarak açıklanır.",
        "b) Faz diyagramlarına girilmeden kaynama ile buharlaşma olayının birbirinden farklı olduğu belirtilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.3.4",
      subTopicName: "Sıvılar",
      description:
        "Doğal olayları açıklamada sıvılar ve özellikleri ile ilgili kavramları kullanır.",
      details: [
        "a) Atmosferdeki su buharının varlığının nem kavramıyla ifade edildiği belirtilir.",
        "b) Meteoroloji haberlerinde verilen gerçek ve hissedilen sıcaklık kavramlarının bağıl nem kavramıyla ifade edildiği belirtilir. Bağıl nem hesaplamalarına girilmez.",
      ].join("\n"),
    },
    {
      code: "9.4.4.1",
      subTopicName: "Gazlar",
      description: "Gazların genel özelliklerini açıklar.",
      details:
        "Gaz yasaları ve kinetik-moleküler teoriye girilmez.",
    },
    {
      code: "9.4.4.2",
      subTopicName: "Gazlar",
      description:
        "Gazların basınç, sıcaklık, hacim ve miktar özelliklerini birimleriyle ifade eder.",
      details:
        "Basınç birimleri olarak (atm ve mmHg); hacim birimi olarak litre (L); sıcaklık birimleri olarak Celcius (°C) ve Kelvin (K); miktar birimi olarak da mol verilir. Birim dönüşümlerine ve hesaplamalara girilmez.",
    },
    {
      code: "9.4.4.3",
      subTopicName: "Gazlar",
      description: "Saf maddelerin hal değişim grafiklerini yorumlar.",
      details: [
        "a) Hal değişim grafikleri üzerinden erime-donma, buharlaşma-yoğuşma ve kaynama süreçleri incelenir.",
        "b) Gizli erime ve buharlaşma ısılarıyla ısınma-soğuma süreçlerine ilişkin hesaplamalara girilmez.",
        "c) Saf suyun hal değişim deneyi yaptırılarak grafiğinin çizdirilmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.5.1",
      subTopicName: "Plazma",
      description: "Plazma halini açıklar.",
      details:
        "Sıcak ve soğuk plazma sınıflandırmasına girilmez.",
    },
  ],

  // ==================== KİMYA HER YERDE (9.5 + 10.4) ====================
  "Kimya Her Yerde": [
    {
      code: "9.5.1.1",
      subTopicName: "Su ve Hayat",
      description: "Suyun varlıklar için önemini açıklar.",
      details:
        "Su kaynaklarının ve korunmasının önemi açıklanır.",
    },
    {
      code: "9.5.1.2",
      subTopicName: "Su ve Hayat",
      description:
        "Su tasarrufuna ve su kaynaklarının korunmasına yönelik çözüm önerileri geliştirir.",
    },
    {
      code: "9.5.1.3",
      subTopicName: "Su ve Hayat",
      description:
        "Suyun sertlik ve yumuşaklık özelliklerini açıklar.",
    },
    {
      code: "9.5.2.1",
      subTopicName: "Çevre Kimyası",
      description:
        "Hava, su ve toprak kirliliğine sebep olan kimyasal kirleticileri açıklar.",
      details: [
        "a) Hava kirleticiler olarak azot oksitler, karbon dioksit ve kükürt oksitleri üzerinde durulur.",
        "b) Su ve toprak kirleticiler olarak plastikler, deterjanlar, organik sıvılar, ağır metaller, piller ve endüstriyel atıklar üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "9.5.2.2",
      subTopicName: "Çevre Kimyası",
      description:
        "Çevreye zarar veren kimyasal kirleticilerin etkilerinin azaltılması konusunda çözüm önerilerinde bulunur.",
    },
    {
      code: "10.4.1.1",
      subTopicName: "Yaygın Günlük Hayat Kimyasalları",
      description: "Temizlik maddelerinin özelliklerini açıklar.",
      details: [
        "a) Yapısal ayrıntılara girmeden sabun ve deterjan aktif maddelerinin kirleri nasıl temizlediği belirtilir.",
        "b) Kişisel temizlikte kullanılan temizlik maddelerinin (şampuan, diş macunu, katı sabun, sıvı sabun) fayda ve zararları vurgulanır.",
        "c) Hijyen amacıyla kullanılan temizlik maddeleri (çamaşır suyu, kireç kaymağı) tanıtılır.",
      ].join("\n"),
    },
    {
      code: "10.4.1.2",
      subTopicName: "Yaygın Günlük Hayat Kimyasalları",
      description: "Yaygın polimerlerin kullanım alanlarına örnekler verir.",
      details: [
        "a) Polimerleşme olayı açıklanarak -mer, monomer ve polimer kavramları üzerinde durulur.",
        "b) Kauçuk, polietilen (PE), polietilen teraftalat (PET), kevlar, polivinil klorür (PVC), politetraflor eten (TEFLON) ve polistirenin (PS) başlıca kullanım alanlarına değinilir.",
      ].join("\n"),
    },
    {
      code: "10.4.1.3",
      subTopicName: "Yaygın Günlük Hayat Kimyasalları",
      description:
        "Polimer, kâğıt, cam ve metal malzemelerin geri dönüşümünün ülke ekonomisine katkısını açıklar.",
    },
    {
      code: "10.4.1.4",
      subTopicName: "Yaygın Günlük Hayat Kimyasalları",
      description:
        "Kozmetik malzemelerin içerebileceği zararlı kimyasalları açıklar.",
      details:
        "Kişisel bakım ve estetik amacıyla kullanılan parfüm, saç boyası, kalıcı dövme boyası ve jöle üzerinde durulur.",
    },
    {
      code: "10.4.1.5",
      subTopicName: "Yaygın Günlük Hayat Kimyasalları",
      description:
        "İlaçların farklı formlarda kullanılmasının nedenlerini açıklar.",
      details: [
        "a) Piyasadaki ilaç formlarının (hap, şurup, iğne, merhem) temel özelliklerine değinilir.",
        "b) Yanlış ve gereksiz ilaç kullanımının insan sağlığına, ülke ekonomisine ve çevreye verdiği zararlar vurgulanır.",
      ].join("\n"),
    },
    {
      code: "10.4.2.1",
      subTopicName: "Gıdalar",
      description:
        "Hazır gıdaları seçerken ve tüketirken dikkat edilmesi gereken hususları açıklar.",
      details: [
        "a) Hazır gıdaların doğal gıdalardan başlıca farklarına (koruyucular, renklendiriciler, emülsiyonlaştırıcılar, tatlandırıcılar, pastörizasyon, UHT sütün işlenmesi) değinilir.",
        "b) Hazır gıda etiketlerindeki üretim ve son kullanım tarihlerinin önemi vurgulanır.",
        "c) Koruyucular, renklendiriciler ve yapay tatlandırıcıların kullanılmasının sağlık üzerindeki etkilerine değinilir.",
      ].join("\n"),
    },
    {
      code: "10.4.2.2",
      subTopicName: "Gıdalar",
      description: "Yenilebilir yağ türlerini sınıflandırır.",
      details: [
        "a) Yağ türlerinden katı (tereyağı, margarin) ve sıvı (zeytin yağı, ayçiçek yağı, mısır özü yağı, fındık yağı) yağlara değinilir.",
        "b) Yağ endüstrisinde kullanılan sızma, rafine, riviera ve vinterize kavramları açıklanır.",
        "c) Yenilebilir yağların yanlış kullanımının sağlık üzerindeki etkileri vurgulanır.",
      ].join("\n"),
    },
  ],

  // ==================== 10. SINIF KONULARI ====================

  // ==================== KİMYANIN TEMEL YASALARI (10.1.1) ====================
  "Kimyanın Temel Yasaları": [
    {
      code: "10.1.1.1",
      subTopicName: "Kimyanın Temel Kanunları",
      description: "Kimyanın temel kanunlarını açıklar.",
      details: [
        "a) Kütlenin korunumu, sabit oranlar ve katlı oranlar kanunları ile ilgili hesaplamalar yapılır.",
        "b) Demir(II) sülfür bileşiğinin elde edilmesi deneyi yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KİMYASAL TEPKİMELER (10.1.2 + 10.1.3 + 10.1.4) ====================
  "Kimyasal Tepkimeler": [
    {
      code: "10.1.2.1",
      subTopicName: "Mol Kavramı",
      description: "Mol kavramını açıklar.",
      details: [
        "a) Mol kavramının tarihsel süreç içerisindeki değişimi üzerinde durulur.",
        "b) Bağıl atom kütlesi tanımlanır.",
        "c) İzotop kavramı ve bazı elementlerin mol kütlelerinin tam sayı çıkmayışının nedeni örneklerle açıklanır.",
        "ç) Mol hesaplamaları yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.3.1",
      subTopicName: "Kimyasal Tepkimeler ve Denklemler",
      description: "Kimyasal tepkimeleri açıklar.",
      details: [
        "a) Kimyasal tepkime denklemlerinin denkleştirilmesi sağlanır. Redoks tepkimelerine girilmez.",
        "b) Yanma, sentez (oluşum), analiz (ayrışma), asit-baz, çözünme-çökelme tepkimeleri örneklerle açıklanır.",
        "c) Kurşun(II) iyodürün çökmesi deneyi yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.4.1",
      subTopicName: "Kimyasal Tepkimelerde Hesaplamalar",
      description:
        "Kütle, mol sayısı, molekül sayısı, atom sayısı ve gazlar için normal şartlarda hacim kavramlarını birbirleriyle ilişkilendirerek hesaplamalar yapar.",
      details: [
        "a) Sınırlayıcı bileşen hesapları üzerinde durulur.",
        "b) Tepkime denklemleri temelinde % verim hesapları yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KARIŞIMLAR (10.2) ====================
  Karışımlar: [
    {
      code: "10.2.1.1",
      subTopicName: "Homojen ve Heterojen Karışımlar",
      description:
        "Karışımları niteliklerine göre sınıflandırır.",
      details: [
        "a) Homojen ve heterojen karışımların ayırt edilmesinde belirleyici olan özellikler açıklanır.",
        "b) Homojen karışımların çözelti olarak adlandırıldığı vurgulanır ve günlük hayattan çözelti örnekleri verilir.",
        "c) Heterojen karışımlar, dağılan maddenin ve dağılma ortamının fiziksel haline göre sınıflandırılır.",
        "ç) Karışımlar çözünenin ve/veya dağılanın tanecik boyutu esas alınarak sınıflandırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.2",
      subTopicName: "Homojen ve Heterojen Karışımlar",
      description: "Çözünme sürecini moleküler düzeyde açıklar.",
      details: [
        "a) Tanecikler arası etkileşimlerden faydalanılarak çözünme açıklanır.",
        "b) Çözünme ile polarlık, hidrojen bağı ve çözücü-çözünen benzerliği ilişkilendirilir.",
      ].join("\n"),
    },
    {
      code: "10.2.1.3",
      subTopicName: "Homojen ve Heterojen Karışımlar",
      description:
        "Çözünmüş madde oranını belirten ifadeleri yorumlar.",
      details: [
        "a) Çözünen madde oranının yüksek (derişik) ve düşük (seyreltik) olduğu çözeltilere örnekler verilir.",
        "b) Kütlece yüzde, hacimce yüzde ve ppm derişimleri tanıtılır; ppm ile ilgili hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "10.2.1.4",
      subTopicName: "Homojen ve Heterojen Karışımlar",
      description:
        "Çözeltilerin özelliklerini günlük hayattan örneklerle açıklar.",
      details:
        "Çözeltilerin donma ve kaynama noktasının çözücülerinkinden farklı olduğu ve derişime bağlı olarak değişimi açıklanır. Hesaplamalara girilmez.",
    },
    {
      code: "10.2.2.1",
      subTopicName: "Ayırma ve Saflaştırma Teknikleri",
      description:
        "Endüstri ve sağlık alanlarında kullanılan karışım ayırma tekniklerini açıklar.",
      details: [
        "a) Mıknatıs ile ayırma bunun yanı sıra tanecik boyutu (eleme, süzme, diyaliz), yoğunluk (ayırma hunisi, yüzdürme), erime noktası, kaynama noktası (basit damıtma, ayrımsal damıtma) ve çözünürlük (özütleme, kristallendirme, ayrımsal kristallendirme) farkından yararlanılarak uygulanan ayırma teknikleri üzerinde durulur.",
        "b) Karışımları ayırma deneyleri yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ASİTLER-BAZLAR VE TUZLAR (10.3) ====================
  "Asitler-Bazlar ve Tuzlar": [
    {
      code: "10.3.1.1",
      subTopicName: "Asitler ve Bazlar",
      description:
        "Asitleri ve bazları bilinen özellikleri yardımıyla ayırt eder.",
      details: [
        "a) Limon suyu, sirke gibi maddelerin ekşilik ve aşındırma özellikleri, asitlikleriyle ilişkilendirilir.",
        "b) Kirecin, sabunun ve deterjanların ciltte oluşturduğu kayganlık hissi bazlıkla ilişkilendirilir.",
        "c) Asitler ve bazların bazı renkli maddelerin rengini değiştirmesi deneyleri yapılarak indikatör kavramı ve pH kâğıdı tanıtılır.",
        "ç) Sirke, limon suyu, çamaşır suyu, sodyum hidroksit, hidroklorik asit ve sodyum klorür çözeltilerinin asitlik veya bazlık değerlerinin pH kâğıdı kullanılarak yorumlanması sağlanır.",
        "d) pH kavramı asitlik ve bazlık ile ilişkilendirilerek açıklanır. Logaritmik tanıma girilmez.",
        "e) Günlük hayatta kullanılan tüketim maddelerinin ambalajlarında yer alan pH değerlerinin asitlik-bazlıkla ilişkilendirilmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1.2",
      subTopicName: "Asitler ve Bazlar",
      description:
        "Maddelerin asitlik ve bazlık özelliklerini moleküler düzeyde açıklar.",
      details: [
        "a) Asitler su ortamında H₃O⁺ iyonu oluşturma, bazlar ise OH⁻ iyonu oluşturma özellikleriyle tanıtılarak basit örnekler verilir.",
        "b) Su ile etkileşerek asit/baz oluşturan CO₂, SO₂ ve N₂O₅ maddelerinin çözeltilerinin neden asit gibi davrandığı; NH₃ ve CaO maddelerinin çözeltilerinin de neden baz gibi davrandığı bu tepkimeler üzerinden açıklanır. Lewis asit-baz tanımına girilmez.",
      ].join("\n"),
    },
    {
      code: "10.3.2.1",
      subTopicName: "Asitlerin ve Bazların Tepkimeleri",
      description:
        "Asitler ve bazlar arasındaki tepkimeleri açıklar.",
      details: [
        "a) Nötralleşme tepkimeleri, asidin ve bazın mol sayıları üzerinden açıklanır.",
        "b) Sodyum hidroksit ile sülfürik asidin etkileşiminden sodyum sülfat oluşumu deneyi yaptırılarak asit, baz ve tuz kavramları ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.2.2",
      subTopicName: "Asitlerin ve Bazların Tepkimeleri",
      description:
        "Asitlerin ve bazların günlük hayat açısından önemli tepkimelerini açıklar.",
      details: [
        "a) Asitlerin ve bazların metallerle etkileşerek hidrojen gazı oluşturması reaksiyonlarına örnekler verilir; aktif metal, yarı soy metal, soy metal ve amfoter metal kavramları üzerinde durulur.",
        "b) Alüminyum metalinin amfoterlik özelliğini gösteren deney yaptırılır.",
        "c) Nitrik asit, sülfürik asit ve hidroflorik asidin soy metal ve cam/porselen aşındırma özelliklerine değinilir.",
        "ç) Derişik sülfürik asit, fosforik asit ve asetik asidin nem çekme ve çözünürken ısı açığa çıkarma özellikleri nedeniyle yol açtıkları tehlikeler vurgulanır.",
      ].join("\n"),
    },
    {
      code: "10.3.3.1",
      subTopicName: "Hayatımızda Asitler ve Bazlar",
      description:
        "Asitlerin ve bazların fayda ve zararlarını açıklar.",
      details: [
        "a) Asit yağmurlarının oluşumuna, çevreye ve tarihi eserlere etkilerine değinilir.",
        "b) Kirecin ve kostiğin yağ, saç ve deriye etkisi deney yapılarak açıklanır.",
      ].join("\n"),
    },
    {
      code: "10.3.3.2",
      subTopicName: "Hayatımızda Asitler ve Bazlar",
      description:
        "Asit ve bazlarla çalışırken alınması gereken sağlık ve güvenlik önlemlerini açıklar.",
      details: [
        "a) Birbiriyle karıştırılması sakıncalı evsel kimyasallara (çamaşır suyu ile tuz ruhu) örnekler verilir.",
        "b) Asit ve baz ambalajlarındaki güvenlik uyarılarına dikkat çekilir.",
        "c) Aşırı temizlik malzemesi ve lavabo açıcı kullanmanın sağlık, çevre ve tesisat açısından sakıncaları üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "10.3.4.1",
      subTopicName: "Tuzlar",
      description:
        "Tuzların özelliklerini ve kullanım alanlarını açıklar.",
      details:
        "Sodyum klorür, sodyum karbonat, sodyum bikarbonat, kalsiyum karbonat ve amonyum klorür tuzları üzerinde durulur.",
    },
  ],

  // ==================== ENDÜSTRİDE VE CANLILARDA ENERJİ (11.4 AYT'den) ====================
  "Endüstride ve Canlılarda Enerji": [
    {
      code: "11.4.1.1",
      subTopicName: "Tepkimelerde Isı Değişimi",
      description:
        "Tepkimelerde meydana gelen enerji değişimlerini açıklar.",
      details: [
        "a) Tepkimelerin ekzotermik ve endotermik olması ısı alışverişiyle ilişkilendirilir.",
        "b) Ekzotermik ve endotermik tepkimelerin açıklanmasında bilişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "11.4.2.1",
      subTopicName: "Oluşum Entalpisi",
      description:
        "Standart oluşum entalpileri üzerinden tepkime entalpilerini hesaplar.",
      details: [
        "a) Standart oluşum entalpileri tanımlanır.",
        "b) Tepkime entalpisi potansiyel enerji-tepkime koordinatı grafiği üzerinden açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.3.1",
      subTopicName: "Bağ Enerjileri",
      description:
        "Bağ enerjileri ile tepkime entalpisi arasındaki ilişkiyi açıklar.",
      details:
        "Oluşan ve kırılan bağ enerjileri üzerinden tepkime entalpisi hesaplamaları yapılır.",
      isKeyKazanim: true,
    },
    {
      code: "11.4.4.1",
      subTopicName: "Tepkime Isılarının Toplanabilirliği",
      description: "Hess Yasasını açıklar.",
      details: "Hess Yasası ile ilgili hesaplamalar yapılır.",
      isKeyKazanim: true,
    },
  ],
};

// =====================================================================
// SEED LOGİĞİ
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const kimyaSubject = await prisma.subject.findFirst({
    where: { name: "Kimya", examTypeId: tyt.id },
  });
  if (!kimyaSubject) {
    console.log("TYT Kimya subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: kimyaSubject.id },
    include: { _count: { select: { kazanimlar: true } } },
  });

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [topicName, kazanimList] of Object.entries(KAZANIMLAR)) {
    const topic = topics.find((t) => t.name === topicName);
    if (!topic) {
      console.log(`⚠️  Topic bulunamadı: "${topicName}" — atlanıyor`);
      continue;
    }

    if (topic._count.kazanimlar > 0) {
      console.log(
        `⏭️  "${topicName}" zaten ${topic._count.kazanimlar} kazanıma sahip, atlanıyor`
      );
      totalSkipped += kazanimList.length;
      continue;
    }

    for (let i = 0; i < kazanimList.length; i++) {
      const k = kazanimList[i];
      await prisma.topicKazanim.create({
        data: {
          topicId: topic.id,
          code: k.code,
          subTopicName: k.subTopicName,
          description: k.description,
          details: k.details || null,
          isKeyKazanim: k.isKeyKazanim || false,
          sortOrder: i,
        },
      });
      totalCreated++;
    }

    console.log(
      `✅ "${topicName}" → ${kazanimList.length} kazanım eklendi`
    );
  }

  console.log(
    `\n📊 Toplam: ${totalCreated} kazanım eklendi, ${totalSkipped} atlandı`
  );
}

main()
  .catch((e) => {
    console.error("seed-tyt-kimya-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
