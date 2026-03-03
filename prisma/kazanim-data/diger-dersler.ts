// =============================================================================
// DİĞER DERSLER KAZANIM DATA
// Edebiyat, Tarih, Coğrafya, Din Kültürü, İnkılap Tarihi, Felsefe, Mantık, Sosyoloji, Psikoloji
// TODO: Bu derslerin kazanımları henüz ÖSYM PDF'inden çıkarılmadı.
// Mevcut veriler eski seed dosyasından alınmıştır ve geliştirilmelidir.
// =============================================================================

import { TopicEntry } from "./kimya";

// ============================================================
//  TÜRK DİLİ VE EDEBİYATI
// ============================================================

export function getEdebiyatTopics(): TopicEntry[] {
  return [
    // TYT (9-10. sınıf)
    {
      topicKey: "okuma",
      topicName: "Okuma",
      examType: "TYT",
      subjectName: "Edebiyat",
      sortOrder: 1,
      kazanimlar: [
        { code: "9.1.1.1", subTopicName: "Metin Türleri", description: "Metin türlerini (öyküleyici, bilgilendirici, şiir) tanır.", isKeyKazanim: true, details: [] },
        { code: "9.1.1.2", subTopicName: "Metin Türleri", description: "Ana düşünce ve yardımcı düşünceleri belirler.", isKeyKazanim: true, details: [] },
        { code: "9.1.2.1", subTopicName: "Sözcükte Anlam", description: "Sözcükte ve söz öbeklerinde anlam ilişkilerini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "siir",
      topicName: "Şiir",
      examType: "TYT",
      subjectName: "Edebiyat",
      sortOrder: 2,
      kazanimlar: [
        { code: "9.2.1.1", subTopicName: "Ahenk Unsurları", description: "Şiirde ahenk unsurlarını (ölçü, uyak, redif) belirler.", isKeyKazanim: true, details: [] },
        { code: "9.2.1.2", subTopicName: "Nazım Biçimleri", description: "Nazım birimlerini ve şekillerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.2.2.1", subTopicName: "İmge ve Söz Sanatları", description: "Şiirde imge ve söz sanatlarını yorumlar.", details: [] },
      ],
    },
    {
      topicKey: "oyku",
      topicName: "Öykü",
      examType: "TYT",
      subjectName: "Edebiyat",
      sortOrder: 3,
      kazanimlar: [
        { code: "9.3.1.1", subTopicName: "Yapı Unsurları", description: "Öykünün yapı unsurlarını (olay, kişi, mekân, zaman) belirler.", isKeyKazanim: true, details: [] },
        { code: "9.3.1.2", subTopicName: "Anlatıcı", description: "Anlatıcı ve bakış açısını belirler.", isKeyKazanim: true, details: [] },
        { code: "9.3.2.1", subTopicName: "Öykü Türleri", description: "Olay ve durum öyküsünü karşılaştırır.", details: [] },
      ],
    },
    {
      topicKey: "tiyatro",
      topicName: "Tiyatro",
      examType: "TYT",
      subjectName: "Edebiyat",
      sortOrder: 4,
      kazanimlar: [
        { code: "10.1.1.1", subTopicName: "Tiyatro Türleri", description: "Tiyatro türlerini (trajedi, komedi, dram) açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.1.2", subTopicName: "Yapı Unsurları", description: "Tiyatro metninin yapı unsurlarını belirler.", details: [] },
        { code: "10.1.2.1", subTopicName: "Geleneksel Tiyatro", description: "Geleneksel Türk tiyatrosunu (Karagöz, orta oyunu) açıklar.", details: [] },
      ],
    },
    {
      topicKey: "bilgilendirici_metin",
      topicName: "Bilgilendirici Metin",
      examType: "TYT",
      subjectName: "Edebiyat",
      sortOrder: 5,
      kazanimlar: [
        { code: "10.2.1.1", subTopicName: "Metin Türleri", description: "Makale, deneme, fıkra türlerini ayırt eder.", isKeyKazanim: true, details: [] },
        { code: "10.2.1.2", subTopicName: "Yapısal Özellikler", description: "Bilgilendirici metinlerin yapısal özelliklerini belirler.", details: [] },
        { code: "10.2.2.1", subTopicName: "Gazete ve Dergi", description: "Gazete ve dergi yazılarını değerlendirir.", details: [] },
      ],
    },
    // AYT (11-12. sınıf)
    {
      topicKey: "divan_edebiyati",
      topicName: "Divan Edebiyatı",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 6,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Genel Özellikler", description: "Divan edebiyatının genel özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Nazım Biçimleri", description: "Divan şiiri nazım biçimlerini (gazel, kaside, mesnevi) açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.2.1", subTopicName: "Temsilciler", description: "Divan edebiyatının önemli temsilcilerini tanır.", details: [] },
      ],
    },
    {
      topicKey: "halk_edebiyati",
      topicName: "Halk Edebiyatı",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 7,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Genel Özellikler", description: "Halk edebiyatının özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Âşık ve Anonim", description: "Âşık edebiyatı ve anonim halk edebiyatını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.2.1", subTopicName: "Tekke-Tasavvuf", description: "Tekke-tasavvuf edebiyatını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "tanzimat_edebiyati",
      topicName: "Tanzimat Edebiyatı",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 8,
      kazanimlar: [
        { code: "11.3.1.1", subTopicName: "Dönem Özellikleri", description: "Tanzimat döneminin özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.3.1.2", subTopicName: "Sanatçılar", description: "Tanzimat I. ve II. dönem sanatçılarını karşılaştırır.", isKeyKazanim: true, details: [] },
        { code: "11.3.2.1", subTopicName: "Türler", description: "Tanzimat döneminde roman, tiyatro ve gazetenin gelişimini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "servetifunun_fecriati",
      topicName: "Servetifünun ve Fecriati",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 9,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Servetifünun", description: "Servetifünun edebiyatının özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Temsilciler", description: "Tevfik Fikret, Cenap Şahabettin ve Halit Ziya'yı tanır.", details: [] },
        { code: "12.1.2.1", subTopicName: "Fecriati", description: "Fecriati topluluğunun özelliklerini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "milli_edebiyat",
      topicName: "Milli Edebiyat",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 10,
      kazanimlar: [
        { code: "12.2.1.1", subTopicName: "Genel Özellikler", description: "Milli Edebiyat akımının özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.2.1.2", subTopicName: "Temsilciler", description: "Ömer Seyfettin, Ziya Gökalp, Halide Edip gibi temsilcileri tanır.", isKeyKazanim: true, details: [] },
        { code: "12.2.2.1", subTopicName: "Roman ve Hikâye", description: "Milli Edebiyat döneminde roman ve hikâyenin gelişimini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "cumhuriyet_donemi",
      topicName: "Cumhuriyet Dönemi",
      examType: "AYT",
      subjectName: "Edebiyat",
      sortOrder: 11,
      kazanimlar: [
        { code: "12.3.1.1", subTopicName: "Genel Özellikler", description: "Cumhuriyet dönemi Türk edebiyatının genel özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.3.1.2", subTopicName: "Akımlar", description: "Garip, İkinci Yeni ve toplumcu gerçekçi akımları açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.3.2.1", subTopicName: "Yazarlar", description: "Cumhuriyet dönemi roman ve hikâye yazarlarını tanır.", details: [] },
      ],
    },
  ];
}

// ============================================================
//  TARİH
// ============================================================

export function getTarihTopics(): TopicEntry[] {
  return [
    // TYT
    {
      topicKey: "tarih_zaman",
      topicName: "Tarih ve Zaman",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 1,
      kazanimlar: [
        { code: "9.1.1.1", subTopicName: "Tarih Bilimi", description: "Tarih biliminin tanımını ve önemini açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.1.1.2", subTopicName: "Dönemlendirme", description: "Tarihi dönemlendirme ve takvim sistemlerini açıklar.", details: [] },
        { code: "9.1.2.1", subTopicName: "Yöntem ve Kaynaklar", description: "Tarih biliminin yöntemlerini ve kaynaklarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "insanligin_ilk",
      topicName: "İnsanlığın İlk Dönemleri",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 2,
      kazanimlar: [
        { code: "9.2.1.1", subTopicName: "Tarih Öncesi", description: "Tarih öncesi dönemleri ve insanlığın gelişim sürecini açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.2.1.2", subTopicName: "İlk Uygarlıklar", description: "İlk uygarlıkları (Mezopotamya, Mısır, Anadolu) tanır.", isKeyKazanim: true, details: [] },
        { code: "9.2.2.1", subTopicName: "Yazının İcadı", description: "Yazının icadının tarihsel önemini değerlendirir.", details: [] },
      ],
    },
    {
      topicKey: "orta_cag",
      topicName: "Orta Çağ",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 3,
      kazanimlar: [
        { code: "9.3.1.1", subTopicName: "Kavimler Göçü", description: "Kavimler Göçü ve sonuçlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.3.1.2", subTopicName: "Feodalizm", description: "Feodalizm ve Orta Çağ Avrupasını açıklar.", details: [] },
        { code: "9.3.2.1", subTopicName: "Türk Tarihi", description: "Türklerin Orta Asya'daki tarihini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "islam_medeniyeti",
      topicName: "İslam Medeniyetinin Doğuşu",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 4,
      kazanimlar: [
        { code: "9.4.1.1", subTopicName: "Hz. Muhammed Dönemi", description: "Hz. Muhammed dönemini ve İslamiyet'in yayılışını açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.4.1.2", subTopicName: "Dört Halife", description: "Dört Halife dönemini ve önemli olayları açıklar.", details: [] },
        { code: "9.4.2.1", subTopicName: "Emeviler ve Abbasiler", description: "Emeviler ve Abbasiler dönemini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "turk_islam_devletleri",
      topicName: "Türk-İslam Devletleri",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 5,
      kazanimlar: [
        { code: "9.5.1.1", subTopicName: "Karahanlılar ve Gazneliler", description: "Karahanlılar ve Gaznelileri açıklar.", details: [] },
        { code: "9.5.1.2", subTopicName: "Büyük Selçuklu", description: "Büyük Selçuklu Devleti'ni açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.5.2.1", subTopicName: "Anadolu Selçuklu", description: "Anadolu Selçuklu Devleti ve beylikler dönemini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "osmanli_kurulus",
      topicName: "Osmanlı Devleti Kuruluş",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 6,
      kazanimlar: [
        { code: "10.1.1.1", subTopicName: "Kuruluş", description: "Osmanlı Devleti'nin kuruluş sürecini açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.1.2", subTopicName: "Padişahlar", description: "Kuruluş dönemi padişahlarını ve önemli olayları açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.2.1", subTopicName: "Devlet Yapısı", description: "Osmanlı'nın devlet yapısını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "osmanli_yukselme",
      topicName: "Osmanlı Yükselme",
      examType: "TYT",
      subjectName: "Tarih",
      sortOrder: 7,
      kazanimlar: [
        { code: "10.2.1.1", subTopicName: "Fetihler", description: "Yükselme dönemi fetihlerini (İstanbul'un Fethi) açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.1.2", subTopicName: "Dünya Gücü", description: "Osmanlı'nın dünya gücü olma sürecini değerlendirir.", isKeyKazanim: true, details: [] },
        { code: "10.2.2.1", subTopicName: "Kültür ve Medeniyet", description: "Osmanlı kültür ve medeniyetini açıklar.", details: [] },
      ],
    },
    // AYT
    {
      topicKey: "degisen_dunya",
      topicName: "Değişen Dünya Dengeleri",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 8,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Coğrafi Keşifler", description: "Coğrafi Keşifler ve Rönesans'ın etkilerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Reform", description: "Reform hareketlerini açıklar.", details: [] },
        { code: "11.1.2.1", subTopicName: "Aydınlanma", description: "Aydınlanma Çağı ve sanayi devrimini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "osmanli_duraklama",
      topicName: "Osmanlı Duraklama",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 9,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Duraklama Nedenleri", description: "Osmanlı'nın duraklama nedenlerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Islahatlar", description: "Duraklama dönemi ıslahat hareketlerini açıklar.", details: [] },
        { code: "11.2.2.1", subTopicName: "Siyasi Olaylar", description: "XVII. yüzyıl siyasi olaylarını değerlendirir.", details: [] },
      ],
    },
    {
      topicKey: "avrupa_osmanli_18_19",
      topicName: "Avrupa ve Osmanlı (18-19 yy)",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 10,
      kazanimlar: [
        { code: "11.3.1.1", subTopicName: "Fransız İhtilali", description: "Fransız İhtilali ve etkilerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.3.1.2", subTopicName: "Modernleşme", description: "Osmanlı modernleşme çabalarını (Tanzimat, Meşrutiyet) açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.3.2.1", subTopicName: "Milliyetçilik", description: "XIX. yüzyılda milliyetçilik akımlarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "dunya_savasi_1",
      topicName: "I. Dünya Savaşı",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 11,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Nedenler ve Cepheler", description: "I. Dünya Savaşı'nın nedenlerini ve cephelerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Osmanlı Cepheleri", description: "Osmanlı'nın savaştaki cephelerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.2.1", subTopicName: "Sonuçlar", description: "Savaşın sonuçlarını ve barış antlaşmalarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "kurtulus_savasi",
      topicName: "Kurtuluş Savaşı",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 12,
      kazanimlar: [
        { code: "12.2.1.1", subTopicName: "Mondros ve İşgaller", description: "Mondros Mütarekesi ve işgalleri açıklar.", details: [] },
        { code: "12.2.1.2", subTopicName: "Örgütlenme", description: "Milli Mücadele'nin örgütlenme sürecini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.2.2.1", subTopicName: "Cepheler", description: "Kurtuluş Savaşı'nın cephelerini ve muharebelerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.2.2.2", subTopicName: "Barış", description: "Mudanya ve Lozan Antlaşmalarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "ataturk_donemi",
      topicName: "Atatürk Dönemi",
      examType: "AYT",
      subjectName: "Tarih",
      sortOrder: 13,
      kazanimlar: [
        { code: "12.3.1.1", subTopicName: "İnkılaplar", description: "Cumhuriyetin ilanını ve inkılapları açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.3.1.2", subTopicName: "Atatürk İlkeleri", description: "Atatürk ilkelerini (altı ok) açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.3.2.1", subTopicName: "Dış Politika", description: "Atatürk dönemi dış politikasını açıklar.", details: [] },
      ],
    },
  ];
}

// ============================================================
//  COĞRAFYA
// ============================================================

export function getCografyaTopics(): TopicEntry[] {
  return [
    // TYT
    {
      topicKey: "dogal_sistemler",
      topicName: "Doğal Sistemler",
      examType: "TYT",
      subjectName: "Coğrafya",
      sortOrder: 1,
      kazanimlar: [
        { code: "9.1.1.1", subTopicName: "Dünya'nın Şekli", description: "Dünya'nın şeklini ve boyutlarını açıklar.", details: [] },
        { code: "9.1.1.2", subTopicName: "Coğrafi Konum", description: "Coğrafi konum türlerini (matematik, özel) açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.1.2.1", subTopicName: "Dünya'nın Hareketleri", description: "Dünya'nın hareketlerini ve sonuçlarını açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "harita_bilgisi",
      topicName: "Harita Bilgisi",
      examType: "TYT",
      subjectName: "Coğrafya",
      sortOrder: 2,
      kazanimlar: [
        { code: "9.2.1.1", subTopicName: "Harita Çeşitleri", description: "Harita çeşitlerini ve kullanım alanlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.2.1.2", subTopicName: "Ölçek", description: "Ölçek kavramını ve ölçek hesaplamalarını yapar.", isKeyKazanim: true, details: [] },
        { code: "9.2.2.1", subTopicName: "İzohips", description: "İzohips haritalarını okur ve yorumlar.", details: [] },
      ],
    },
    {
      topicKey: "iklim",
      topicName: "İklim",
      examType: "TYT",
      subjectName: "Coğrafya",
      sortOrder: 3,
      kazanimlar: [
        { code: "9.3.1.1", subTopicName: "İklim Elemanları", description: "İklim elemanlarını (sıcaklık, basınç, rüzgâr, nem, yağış) açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.3.1.2", subTopicName: "İklim Tipleri", description: "İklim tiplerini ve özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.3.2.1", subTopicName: "Türkiye İklimi", description: "Türkiye'nin iklim özelliklerini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "nufus_yerlesme",
      topicName: "Nüfus ve Yerleşme",
      examType: "TYT",
      subjectName: "Coğrafya",
      sortOrder: 4,
      kazanimlar: [
        { code: "10.1.1.1", subTopicName: "Nüfus Dağılışı", description: "Nüfusun dağılışını etkileyen faktörleri açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.1.2", subTopicName: "Nüfus Piramitleri", description: "Nüfus piramitlerini yorumlar.", isKeyKazanim: true, details: [] },
        { code: "10.1.2.1", subTopicName: "Göç", description: "Göç türlerini ve nedenlerini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "turkiye_yer_sekilleri",
      topicName: "Türkiye'nin Yer Şekilleri",
      examType: "TYT",
      subjectName: "Coğrafya",
      sortOrder: 5,
      kazanimlar: [
        { code: "10.2.1.1", subTopicName: "İç Kuvvetler", description: "İç kuvvetleri (tektonizma, volkanizma, deprem) açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.1.2", subTopicName: "Dış Kuvvetler", description: "Dış kuvvetleri (akarsu, rüzgâr, buzul, dalga) açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.2.1", subTopicName: "Bölgesel Yer Şekilleri", description: "Türkiye'nin bölgelerine göre yer şekillerini açıklar.", details: [] },
      ],
    },
    // AYT
    {
      topicKey: "biyomlar",
      topicName: "Biyomlar",
      examType: "AYT",
      subjectName: "Coğrafya",
      sortOrder: 6,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Dünya Biyomları", description: "Dünya biyomlarını (tropikal, ılıman, kutup) açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Dağılış Faktörleri", description: "Biyomların dağılışını etkileyen faktörleri açıklar.", details: [] },
        { code: "11.1.2.1", subTopicName: "Biyoçeşitlilik", description: "Biyoçeşitliliği ve korunmasını açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "ekonomik_cografya",
      topicName: "Ekonomik Coğrafya",
      examType: "AYT",
      subjectName: "Coğrafya",
      sortOrder: 7,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Tarım ve Hayvancılık", description: "Tarım, hayvancılık ve ormancılık faaliyetlerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Madencilik", description: "Madencilik ve enerji kaynaklarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.2.1", subTopicName: "Sanayi ve Ticaret", description: "Sanayi ve ticaret faaliyetlerini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "turkiye_ekonomisi",
      topicName: "Türkiye Ekonomisi",
      examType: "AYT",
      subjectName: "Coğrafya",
      sortOrder: 8,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Sektörler", description: "Türkiye'nin tarım, sanayi ve hizmet sektörlerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Dış Ticaret", description: "Türkiye'nin dış ticaretini değerlendirir.", isKeyKazanim: true, details: [] },
        { code: "12.1.2.1", subTopicName: "Ulaşım", description: "Türkiye'nin ulaşım ağını ve önemini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "kuresel_ortam",
      topicName: "Küresel Ortam",
      examType: "AYT",
      subjectName: "Coğrafya",
      sortOrder: 9,
      kazanimlar: [
        { code: "12.2.1.1", subTopicName: "Çevre Sorunları", description: "Küresel çevre sorunlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.2.1.2", subTopicName: "Doğal Afetler", description: "Doğal afetleri ve afet yönetimini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.2.2.1", subTopicName: "Küreselleşme", description: "Küreselleşmenin etkilerini tartışır.", details: [] },
      ],
    },
  ];
}

// ============================================================
//  DİN KÜLTÜRÜ VE AHLAK BİLGİSİ
// ============================================================

export function getDinKulturuTopics(): TopicEntry[] {
  return [
    {
      topicKey: "bilgi_inanc",
      topicName: "Bilgi ve İnanç",
      examType: "TYT",
      subjectName: "Din Kültürü",
      sortOrder: 1,
      kazanimlar: [
        { code: "9.1.1.1", subTopicName: "Bilgi ve İnanç İlişkisi", description: "Bilgi ve inanç arasındaki ilişkiyi açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.1.1.2", subTopicName: "Bilgi Kaynakları", description: "Vahiy, akıl ve duyuların bilgi kaynağı olarak rolünü açıklar.", details: [] },
        { code: "9.1.2.1", subTopicName: "İnanç Çeşitleri", description: "İnanç çeşitlerini (monoteizm, politeizm, ateizm, deizm) açıklar.", details: [] },
      ],
    },
    {
      topicKey: "din_islam",
      topicName: "Din ve İslam",
      examType: "TYT",
      subjectName: "Din Kültürü",
      sortOrder: 2,
      kazanimlar: [
        { code: "9.2.1.1", subTopicName: "İnanç Esasları", description: "İslam'ın inanç esaslarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.2.1.2", subTopicName: "İbadetler", description: "İbadetlerin bireysel ve toplumsal faydalarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "9.2.2.1", subTopicName: "İslam Ahlakı", description: "İslam ahlakının temel ilkelerini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "hz_muhammed",
      topicName: "Hz. Muhammed'in Hayatı",
      examType: "TYT",
      subjectName: "Din Kültürü",
      sortOrder: 3,
      kazanimlar: [
        { code: "10.1.1.1", subTopicName: "Hayatı", description: "Hz. Muhammed'in hayatının ana hatlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.1.2", subTopicName: "Ahlaki Özellikleri", description: "Hz. Muhammed'in ahlaki özelliklerini örneklendirir.", isKeyKazanim: true, details: [] },
        { code: "10.1.2.1", subTopicName: "Toplumsal Değişim", description: "Hz. Muhammed'in toplumsal değişimdeki rolünü açıklar.", details: [] },
      ],
    },
    {
      topicKey: "kuran_yorum",
      topicName: "Kur'an ve Yorumu",
      examType: "TYT",
      subjectName: "Din Kültürü",
      sortOrder: 4,
      kazanimlar: [
        { code: "10.2.1.1", subTopicName: "Temel Özellikler", description: "Kur'an-ı Kerim'in temel özelliklerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.1.2", subTopicName: "Tefsir ve Meal", description: "Kur'an'ın anlaşılmasında tefsir ve meal kavramlarını açıklar.", details: [] },
        { code: "10.2.2.1", subTopicName: "Temel Konular", description: "Kur'an'ın temel konularını açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
  ];
}

// ============================================================
//  FELSEFE
// ============================================================

export function getFelsefeTopics(): TopicEntry[] {
  return [
    // TYT
    {
      topicKey: "felsefeyi_tanima",
      topicName: "Felsefeyi Tanıma",
      examType: "TYT",
      subjectName: "Felsefe",
      sortOrder: 1,
      kazanimlar: [
        { code: "10.1.1.1", subTopicName: "Felsefenin Tanımı", description: "Felsefenin tanımını ve konusunu açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.1.1.2", subTopicName: "Felsefi Düşünce", description: "Felsefi düşüncenin özelliklerini açıklar.", details: [] },
        { code: "10.1.2.1", subTopicName: "Diğer Alanlarla İlişki", description: "Felsefenin diğer bilgi alanlarıyla ilişkisini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "bilgi_felsefesi",
      topicName: "Bilgi Felsefesi",
      examType: "TYT",
      subjectName: "Felsefe",
      sortOrder: 2,
      kazanimlar: [
        { code: "10.2.1.1", subTopicName: "Bilgi Türleri", description: "Bilgi türlerini (günlük, bilimsel, felsefi, dini) açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.1.2", subTopicName: "Doğruluk ve Gerçeklik", description: "Doğruluk ve gerçeklik kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.2.2.1", subTopicName: "Temel Problemler", description: "Bilgi felsefesinin temel problemlerini tartışır.", details: [] },
      ],
    },
    {
      topicKey: "varlik_felsefesi",
      topicName: "Varlık Felsefesi",
      examType: "TYT",
      subjectName: "Felsefe",
      sortOrder: 3,
      kazanimlar: [
        { code: "10.3.1.1", subTopicName: "Temel Kavramlar", description: "Varlık felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.3.1.2", subTopicName: "Varlık Sorusu", description: "Varlığın ne olduğu sorusuna verilen cevapları karşılaştırır.", details: [] },
        { code: "10.3.2.1", subTopicName: "Materyalizm ve İdealizm", description: "Materyalizm ve idealizmi açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "ahlak_felsefesi",
      topicName: "Ahlak Felsefesi",
      examType: "TYT",
      subjectName: "Felsefe",
      sortOrder: 4,
      kazanimlar: [
        { code: "10.4.1.1", subTopicName: "Temel Kavramlar", description: "Ahlak felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "10.4.1.2", subTopicName: "Evrensel Ahlak", description: "Evrensel ahlak yasasının olup olmadığını tartışır.", isKeyKazanim: true, details: [] },
        { code: "10.4.2.1", subTopicName: "Yaklaşımlar", description: "Ahlak felsefesinin temel yaklaşımlarını karşılaştırır.", details: [] },
      ],
    },
    // AYT
    {
      topicKey: "bilim_felsefesi",
      topicName: "Bilim Felsefesi",
      examType: "AYT",
      subjectName: "Felsefe",
      sortOrder: 5,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Bilim ve Yöntem", description: "Bilimin tanımını ve bilimsel yöntemi açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Bilimsel Bilgi", description: "Bilimsel bilginin özelliklerini açıklar.", details: [] },
        { code: "11.1.2.1", subTopicName: "Temel Problemler", description: "Bilim felsefesinin temel problemlerini tartışır.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "din_felsefesi",
      topicName: "Din Felsefesi",
      examType: "AYT",
      subjectName: "Felsefe",
      sortOrder: 6,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Konu ve Problemler", description: "Din felsefesinin konusunu ve problemlerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Tanrı'nın Varlığı", description: "Tanrı'nın varlığına ilişkin felsefi yaklaşımları tartışır.", isKeyKazanim: true, details: [] },
        { code: "11.2.2.1", subTopicName: "İnanç ve Akıl", description: "İnanç ve akıl ilişkisini tartışır.", details: [] },
      ],
    },
    {
      topicKey: "siyaset_felsefesi",
      topicName: "Siyaset Felsefesi",
      examType: "AYT",
      subjectName: "Felsefe",
      sortOrder: 7,
      kazanimlar: [
        { code: "11.3.1.1", subTopicName: "Temel Kavramlar", description: "Siyaset felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.3.1.2", subTopicName: "İdeal Devlet", description: "İdeal devlet anlayışlarını karşılaştırır.", isKeyKazanim: true, details: [] },
        { code: "11.3.2.1", subTopicName: "Birey-Devlet", description: "Birey-devlet ilişkisini tartışır.", details: [] },
      ],
    },
    {
      topicKey: "sanat_felsefesi",
      topicName: "Sanat Felsefesi",
      examType: "AYT",
      subjectName: "Felsefe",
      sortOrder: 8,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Temel Kavramlar", description: "Sanat felsefesinin konusunu ve temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Güzellik ve Estetik", description: "Güzellik ve estetik kavramlarını tartışır.", isKeyKazanim: true, details: [] },
        { code: "12.1.2.1", subTopicName: "Toplumsal İşlev", description: "Sanatın toplumsal işlevini tartışır.", details: [] },
      ],
    },
  ];
}

// ============================================================
//  MANTIK
// ============================================================

export function getMantikTopics(): TopicEntry[] {
  return [
    {
      topicKey: "klasik_mantik",
      topicName: "Klasik Mantık",
      examType: "AYT",
      subjectName: "Mantık",
      sortOrder: 1,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Temel Kavramlar", description: "Mantık biliminin konusunu ve temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Kavram, Önerme, Kıyas", description: "Kavram, terim, önerme ve kıyas kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.2.1", subTopicName: "Aristoteles Kıyası", description: "Aristoteles kıyasının çeşitlerini ve kurallarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "modern_mantik",
      topicName: "Modern Mantık",
      examType: "AYT",
      subjectName: "Mantık",
      sortOrder: 2,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Sembolik Mantık", description: "Sembolik mantığın temel kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Doğruluk Tabloları", description: "Doğruluk tablolarını oluşturur ve yorumlar.", isKeyKazanim: true, details: [] },
        { code: "12.1.2.1", subTopicName: "Çıkarım ve Geçerlilik", description: "Çıkarım ve geçerlilik kavramlarını uygular.", details: [] },
      ],
    },
  ];
}

// ============================================================
//  SOSYOLOJİ
// ============================================================

export function getSosyolojiTopics(): TopicEntry[] {
  return [
    {
      topicKey: "sosyolojiye_giris",
      topicName: "Sosyolojiye Giriş",
      examType: "AYT",
      subjectName: "Sosyoloji",
      sortOrder: 1,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Tanım ve Konu", description: "Sosyolojinin tanımını ve konusunu açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Yöntemler", description: "Sosyolojinin yöntemlerini açıklar.", details: [] },
        { code: "11.1.2.1", subTopicName: "Diğer Bilimler", description: "Sosyolojinin diğer bilimlerle ilişkisini açıklar.", details: [] },
      ],
    },
    {
      topicKey: "toplumsal_yapi",
      topicName: "Toplumsal Yapı",
      examType: "AYT",
      subjectName: "Sosyoloji",
      sortOrder: 2,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Yapı ve İlişki", description: "Toplumsal yapı ve toplumsal ilişki kavramlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Tabakalaşma", description: "Toplumsal tabakalaşmayı açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.2.1", subTopicName: "Toplumsal Kurumlar", description: "Toplumsal kurumları (aile, eğitim, ekonomi, siyaset, din) açıklar.", details: [] },
      ],
    },
    {
      topicKey: "toplumsal_degisme",
      topicName: "Toplumsal Değişme",
      examType: "AYT",
      subjectName: "Sosyoloji",
      sortOrder: 3,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Değişme Faktörleri", description: "Toplumsal değişmeyi etkileyen faktörleri açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Gelişme ve Kalkınma", description: "Toplumsal gelişme ve kalkınma kavramlarını açıklar.", details: [] },
        { code: "12.1.2.1", subTopicName: "Küreselleşme", description: "Küreselleşme ve toplumsal değişme ilişkisini tartışır.", isKeyKazanim: true, details: [] },
      ],
    },
  ];
}

// ============================================================
//  PSİKOLOJİ
// ============================================================

export function getPsikolojiTopics(): TopicEntry[] {
  return [
    {
      topicKey: "psikoloji_bilimi",
      topicName: "Psikoloji Bilimi",
      examType: "AYT",
      subjectName: "Psikoloji",
      sortOrder: 1,
      kazanimlar: [
        { code: "11.1.1.1", subTopicName: "Tanım ve Amaçlar", description: "Psikolojinin tanımını ve amaçlarını açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.1.1.2", subTopicName: "Alt Dallar", description: "Psikolojinin alt dallarını ve yaklaşımlarını açıklar.", details: [] },
        { code: "11.1.2.1", subTopicName: "Araştırma Yöntemleri", description: "Psikolojide araştırma yöntemlerini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
    {
      topicKey: "psikoloji_temel_surecler",
      topicName: "Psikolojinin Temel Süreçleri",
      examType: "AYT",
      subjectName: "Psikoloji",
      sortOrder: 2,
      kazanimlar: [
        { code: "11.2.1.1", subTopicName: "Algı ve Bellek", description: "Algı, dikkat ve bellek süreçlerini açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.1.2", subTopicName: "Öğrenme Kuramları", description: "Öğrenme kuramlarını (klasik, edimsel, bilişsel) açıklar.", isKeyKazanim: true, details: [] },
        { code: "11.2.2.1", subTopicName: "Güdülenme", description: "Güdülenme ve duygusal süreçleri açıklar.", details: [] },
        { code: "11.2.2.2", subTopicName: "Kişilik", description: "Kişilik kuramlarını açıklar.", details: [] },
      ],
    },
    {
      topicKey: "ruh_sagligi",
      topicName: "Ruh Sağlığı",
      examType: "AYT",
      subjectName: "Psikoloji",
      sortOrder: 3,
      kazanimlar: [
        { code: "12.1.1.1", subTopicName: "Tanım ve Önem", description: "Ruh sağlığının tanımını ve önemini açıklar.", isKeyKazanim: true, details: [] },
        { code: "12.1.1.2", subTopicName: "Stres", description: "Stres ve başa çıkma yöntemlerini açıklar.", details: [] },
        { code: "12.1.2.1", subTopicName: "Bozukluklar ve Tedavi", description: "Psikolojik bozuklukları ve tedavi yöntemlerini açıklar.", isKeyKazanim: true, details: [] },
      ],
    },
  ];
}
