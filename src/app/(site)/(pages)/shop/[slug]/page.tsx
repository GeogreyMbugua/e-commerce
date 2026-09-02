import type { Metadata } from "next";
import ProductDetailsLoader from "@/components/ProductDetails/ProductDetailsLoader";
import { fetchProductBySlug, fetchProductSlugs } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return fetchProductSlugs();
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProductBySlug(slug);
    return {
      title: `${product.title} | AudioVintage`,
      description: product.description.slice(0, 160),
    };
  } catch {
    return {
      title: "Product | AudioVintage",
      description:
        "View details, condition, and availability for curated AudioVintage products.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <main>
      <ProductDetailsLoader slug={slug} />
    </main>
  );
}
