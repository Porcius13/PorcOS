export default function TipPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Tıp &amp; Akademik
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Takip etmek istediğin tıbbi ve akademik odaklarını buraya bırak.
          </p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Başlık
            </label>
            <input
              type="text"
              placeholder="Örn. Nöroloji - Klinik notlar"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Kategori
            </label>
            <select className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900">
              <option value="">Seç</option>
              <option value="tus">TUS</option>
              <option value="academic">Akademik</option>
              <option value="clinical">Klinik</option>
              <option value="healthtech">HealthTech</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Skor / İlerleme
              </label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0 - 100"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Mod
              </label>
              <select className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900">
                <option value="">Seç</option>
                <option value="focused">Fokus</option>
                <option value="tired">Yorgun</option>
                <option value="excited">Heyecanlı</option>
                <option value="stressed">Stresli</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Not
            </label>
            <textarea
              rows={4}
              placeholder="Kısa bir not veya zihinsel çerçeve bırak."
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

