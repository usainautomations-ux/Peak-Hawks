import type { Metadata } from "next";
import { SanityImage as Image } from "@/components/ui/SanityImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getBlogPost, getAllBlogSlugs } from "@/lib/sanity/queries";
import { blogPortableTextComponents } from "@/components/PortableTextRenderer";

export const dynamic = "force-dynamic"; // always fetch fresh from Sanity, no caching

/** Pre-build every known blog slug at deploy time */
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seo?.title ?? `${post.title} — PeakHawks`,
    description: post.seo?.description ?? post.excerpt,
    openGraph: {
      title: post.seo?.title ?? post.title,
      description: post.seo?.description ?? post.excerpt,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}


export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen pt-[90px]">
          {/* cover image */}
          {post.coverImage && (
            <div className="relative h-[420px] w-full bg-surface-2 lg:h-[520px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
            </div>
          )}

          <div className="mx-auto max-w-[760px] px-6 py-16">
            {/* breadcrumb */}
            <div className="mb-8 font-mono text-[.68rem] uppercase tracking-wider text-grey">
              <Link href="/blog" className="transition hover:text-ember">
                ← All Posts
              </Link>
              {post.category && (
                <>
                  <span className="mx-2">·</span>
                  <span>{post.category}</span>
                </>
              )}
            </div>

            {/* header */}
            <h1 className="mb-5 text-[clamp(2rem,5vw,3rem)] leading-tight">{post.title}</h1>

            <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-line pb-8 font-mono text-[.68rem] uppercase tracking-wider text-grey">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
              {post.readTime && <span>{post.readTime} min read</span>}
            </div>

            {/* excerpt intro */}
            {post.excerpt && (
              <p className="mb-10 text-[1.12rem] font-medium leading-relaxed text-ink">
                {post.excerpt}
              </p>
            )}

            {/* body */}
            {post.body && (
              <div className="prose-peakhawks">
                <PortableText value={post.body} components={blogPortableTextComponents} />
              </div>
            )}

            {/* CTA at end of post */}
            <div className="mt-20 rounded-[18px] border border-line-strong bg-surface p-10 text-center [background:radial-gradient(600px_200px_at_50%_-10%,rgba(234,92,0,.10),transparent_70%),#FFFFFF]">
              <div className="eyebrow justify-center">Your Peak, Our Passion</div>
              <h3 className="mt-1 mb-3 text-2xl">Ready to launch your next bestseller?</h3>
              <p className="mb-6 text-[.95rem]">
                One strategy call is all it takes to map out your next product opportunity.
              </p>
              <Link href="/#book-a-call" className="btn-primary">
                Book a Strategy Call <span className="arrow">→</span>
              </Link>
            </div>

            {/* back to blog */}
            <div className="mt-10 text-center">
              <Link
                href="/blog"
                className="font-mono text-[.72rem] uppercase tracking-wider text-grey transition hover:text-ember"
              >
                ← Back to all posts
              </Link>
            </div>
          </div>
    </main>
  );
}
