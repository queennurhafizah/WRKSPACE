import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getBrand } from "@/lib/brand";

// Layout untuk seluruh halaman publik: navbar sticky + footer.
// Brand diambil dari data owner (server-side) lalu diturunkan ke komponen.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar brandName={brand.name} />
      <main className="flex-1">{children}</main>
      <Footer brand={brand} />
    </div>
  );
}
