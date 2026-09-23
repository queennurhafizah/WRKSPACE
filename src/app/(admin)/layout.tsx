import { getBrand } from "@/lib/brand";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileBar } from "@/components/admin/mobile-bar";
import { AdminGuard } from "@/components/admin/guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();

  return (
    <AdminGuard>
      <div className="flex h-dvh overflow-hidden bg-ivory">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:shrink-0">
          <AdminSidebar brandName={brand.name} />
        </div>

        {/* Konten utama */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar mobile */}
          <AdminMobileBar brandName={brand.name} />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-7">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
