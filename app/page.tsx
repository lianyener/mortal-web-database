import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Mortal Web Database</h1>
        <p className="text-muted-foreground text-lg">
          請選擇您要探索的資料庫系統
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/script"
            className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📜</span>
            <span className="font-bold text-lg">劇本閱讀器</span>
            <span className="text-xs text-muted-foreground mt-2">檢視對話與分支條件</span>
          </Link>

          <Link
            href="/position?id=Alchemy_Work_001"
            className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🗺️</span>
            <span className="font-bold text-lg">地點與事件</span>
            <span className="text-xs text-muted-foreground mt-2">檢視養成與地點互動</span>
          </Link>
        </div>
      </div>
    </main>
  );
}