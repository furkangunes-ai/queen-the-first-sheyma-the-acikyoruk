import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "KVKK & Gizlilik Politikası | Şeyda",
  description: "Şeyda uygulaması kişisel verilerin korunması kanunu (KVKK) ve gizlilik politikası.",
};

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

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
            <Shield size={24} className="text-pink-400" />
            <h1 className="text-3xl font-black text-white tracking-tight">
              KVKK & Gizlilik Politikası
            </h1>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 leading-relaxed">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Son Güncelleme: Mart 2026
            </p>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">1. Veri Sorumlusu</h2>
              <p>
                Bu uygulama kapsamında kişisel verileriniz, 6698 sayılı Kişisel Verilerin
                Korunması Kanunu (KVKK) uyarınca veri sorumlusu sıfatıyla Şeyda platformu
                tarafından işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">2. İşlenen Kişisel Veriler</h2>
              <p>Uygulama kapsamında aşağıdaki kişisel veriler işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li><strong className="text-white/70">Kimlik bilgileri:</strong> Kullanıcı adı, görünen ad</li>
                <li><strong className="text-white/70">İletişim bilgileri:</strong> E-posta adresi (opsiyonel)</li>
                <li><strong className="text-white/70">Eğitim bilgileri:</strong> Sınav sonuçları, çalışma kayıtları, konu bilgi düzeyleri</li>
                <li><strong className="text-white/70">Kullanım verileri:</strong> Oturum bilgileri, uygulama içi aktiviteler</li>
                <li><strong className="text-white/70">Sağlık ilişkili veriler:</strong> Ruh hali, enerji seviyesi, uyku süresi (check-in verileri)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">3. Verilerin İşlenme Amacı</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Kişiselleştirilmiş çalışma planı oluşturulması</li>
                <li>Sınav performans analizi ve ilerleme takibi</li>
                <li>AI destekli öneriler ve analizler sunulması</li>
                <li>Kullanıcı hesabının yönetimi ve güvenliği</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">4. Verilerin Aktarımı</h2>
              <p>
                Kişisel verileriniz, AI analiz hizmeti kapsamında OpenAI API&apos;ye (ABD merkezli)
                anonimleştirilmiş şekilde aktarılabilir. Bunun dışında kişisel verileriniz
                üçüncü taraflarla paylaşılmaz.
              </p>
              <p className="mt-2">
                Verileriniz Railway (bulut altyapısı) üzerinde barındırılan PostgreSQL
                veritabanında şifrelenmiş bağlantı üzerinden saklanır.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">5. Saklama Süresi</h2>
              <p>
                Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır. Hesap silme
                talebinde bulunmanız halinde verileriniz 30 gün içinde kalıcı olarak silinir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">6. Haklarınız</h2>
              <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yanlış veya eksik işlenmiş verilerin düzeltilmesini isteme</li>
                <li>KVKK&apos;nın 7. maddesi kapsamında verilerin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kendi aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">7. Çerezler</h2>
              <p>
                Uygulama, oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler
                oturumunuzun güvenli şekilde devam etmesi için gereklidir ve pazarlama amacıyla
                kullanılmaz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-white/80 mb-3">8. İletişim</h2>
              <p>
                KVKK kapsamındaki haklarınızı kullanmak veya kişisel verileriniz hakkında
                bilgi almak için aşağıdaki iletişim kanalları üzerinden bize ulaşabilirsiniz:
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
