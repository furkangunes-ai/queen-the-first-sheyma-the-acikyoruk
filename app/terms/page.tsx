import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Kullanım Koşulları | Şeyda",
  description: "Şeyda uygulaması kullanım koşulları ve hizmet sözleşmesi.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/welcome"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400/60" />
            <span className="font-bold text-white/60">Şeyda</span>
          </div>
        </div>

        {/* Content */}
        <div className="glass-panel p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={24} className="text-cyan-400" />
            <h1 className="text-3xl font-black text-white tracking-tight">
              Kullanım Koşulları
            </h1>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 leading-relaxed">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Son Güncelleme: Mart 2026
            </p>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">1. Taraflar</h2>
              <p>
                Bu sözleşme, Şeyda platformu (&quot;Hizmet Sağlayıcı&quot;) ile platformu
                kullanan kişi (&quot;Kullanıcı&quot;) arasında akdedilmiştir. Platforma kayıt
                olarak bu koşulları kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">2. Hizmet Tanımı</h2>
              <p>
                Şeyda, YKS (Yükseköğretim Kurumları Sınavı) hazırlık sürecini destekleyen
                bir dijital platformdur. Aşağıdaki hizmetleri sunar:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>Deneme sınavı sonuçlarının kaydı ve analizi</li>
                <li>Günlük çalışma takibi</li>
                <li>Bilişsel motor tabanlı konu önerileri</li>
                <li>AI destekli çalışma planı ve analiz</li>
                <li>Haftalık değerlendirme ve ilerleme raporları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">3. Üyelik ve Hesap</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Platforma kayıt ücretsizdir ve &quot;Temel&quot; plan ile başlar.</li>
                <li>Kullanıcı, doğru ve güncel bilgiler sağlamakla yükümlüdür.</li>
                <li>Hesap bilgileri kişiseldir ve üçüncü kişilerle paylaşılmamalıdır.</li>
                <li>Hesap güvenliğinden kullanıcı sorumludur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">4. Abonelik ve Ücretlendirme</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-white/70">Temel Plan:</strong> Ücretsiz, temel özellikleri içerir.</li>
                <li><strong className="text-white/70">Premium Plan:</strong> Ücretli, tüm özelliklere erişim sağlar.</li>
                <li>Fiyatlar önceden bildirilmeksizin değiştirilebilir, mevcut abonelikler dönem sonuna kadar geçerliliğini korur.</li>
                <li>Ödeme bilgileri güvenli ödeme altyapıları üzerinden işlenir ve tarafımızca saklanmaz.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">5. İptal ve İade</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Kullanıcı, aboneliğini istediği zaman iptal edebilir.</li>
                <li>İptal durumunda mevcut dönem sonuna kadar hizmet devam eder.</li>
                <li>14 gün içinde yapılan iptal taleplerinde tam iade yapılır (Tüketici Hakları Kanunu gereği).</li>
                <li>14 günü aşan dönemlerde kısmi iade hakkı kullanıcının başvurusuyla değerlendirilir.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">6. Kullanıcı Yükümlülükleri</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Platformu yasa dışı amaçlarla kullanmamak</li>
                <li>Diğer kullanıcıların haklarını ihlal etmemek</li>
                <li>Sisteme zarar verecek eylemlerden kaçınmak</li>
                <li>Otomatik veri toplama araçları (bot, scraper vb.) kullanmamak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">7. AI Hizmeti Sorumluluk Sınırı</h2>
              <p>
                Platformdaki AI destekli öneriler (çalışma planı, sınav analizi, haftalık
                değerlendirme) bilgi amaçlıdır ve profesyonel eğitim danışmanlığı yerine
                geçmez. AI çıktıları doğruluk garantisi taşımaz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">8. Fikri Mülkiyet</h2>
              <p>
                Platform üzerindeki tüm içerik, tasarım, yazılım ve algoritmalar Şeyda&apos;nın
                fikri mülkiyetindedir. Kullanıcı tarafından girilen veriler kullanıcıya aittir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">9. Sorumluluk Sınırı</h2>
              <p>
                Hizmet Sağlayıcı, platformun kesintisiz veya hatasız çalışacağını garanti
                etmez. Teknik arıza, veri kaybı veya üçüncü taraf hizmet kesintilerinden
                kaynaklanan zararlardan sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">10. Uyuşmazlık</h2>
              <p>
                Bu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları
                uygulanır. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">11. Değişiklikler</h2>
              <p>
                Bu koşullar önceden bildirimde bulunmaksızın güncellenebilir. Güncellemeler
                yayınlandığı tarihte yürürlüğe girer. Kullanıcılar önemli değişiklikler
                hakkında uygulama içi bildirim alır.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">12. İletişim</h2>
              <p>
                Bu koşullar hakkında sorularınız için:
              </p>
              <p className="mt-2">
                <strong className="text-white/70">E-posta:</strong> destek@seyda.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
