import type { Metadata } from "next";
import Link from "next/link";
import { SanityImage as Image } from "@/components/ui/SanityImage";
import { getBlogList } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic"; // always fetch fresh from Sanity, no caching

export const metadata: Metadata = {
  title: "Blog — PeakHawks | Amazon Growth Insights",
  description:
    "Product research, listing optimization, PPC strategy and launch playbooks from the PeakHawks team.",
};

export default async function BlogPage() {
  const posts = await getBlogList();

  return (
    <main className="min-h-screen pt-[100px]">
          {/* header */}
          <div className="border-b border-line bg-surface py-20 text-center">
            <span className="eyebrow justify-center">From the Team</span>
            <h1 className="mt-2 text-[clamp(2.4rem,5vw,3.6rem)]">
              Amazon Growth <span className="text-ember">Insights</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[520px] text-[1.05rem]">
              Product research, PPC strategy, launch playbooks and case studies
              from the PeakHawks team.
            </p>
            <Link
              href="/#book-a-call"
              className="btn-primary mt-8 inline-flex px-7 py-3.5 text-[.9rem] !text-bg"
            >
              Book a Strategy Call <span className="arrow">→</span>
            </Link>
          </div>

          <div className="mx-auto max-w-[1180px] px-6 py-20">
            {posts.length === 0 ? (
              <div className="py-32 text-center">
                <div className="mb-4 font-mono text-[.72rem] uppercase tracking-wider text-grey">
                  Coming soon
                </div>
                <h2 className="text-2xl">No posts published yet.</h2>
                <p className="mt-3 text-grey">
                  Check back soon — or{" "}
                  <Link href="/#book-a-call" className="text-ember hover:underline">
                    book a strategy call
                  </Link>{" "}
                  in the meantime.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post._id} href={`/blog/${post.slug}`} className="group">
                    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(21,23,26,.10)]">
                      {/* cover */}
                      <div className="relative aspect-[16/9] bg-surface-2">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-contain transition group-hover:scale-[1.02]"
                            sizes="(max-width:768px)100vw,(max-width:1180px)50vw,380px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[repeating-linear-gradient(45deg,rgba(21,23,26,.02)_0_12px,transparent_12px_24px)] font-mono text-[.7rem] uppercase tracking-wider text-grey">
                            No cover image
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute left-3 top-3 rounded-full bg-ember/90 px-3 py-1 font-mono text-[.62rem] uppercase tracking-wider text-white">
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* body */}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex items-center gap-3 font-mono text-[.62rem] uppercase tracking-wider text-grey">
                          {post.publishedAt && (
                            <time dateTime={post.publishedAt}>
                              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          )}
                          {post.readTime && (
                            <>
                              <span>·</span>
                              <span>{post.readTime} min read</span>
                            </>
                          )}
                        </div>
                        <h2 className="mb-2 font-display text-lg font-bold leading-snug transition group-hover:text-ember">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="line-clamp-3 flex-1 text-[.9rem]">{post.excerpt}</p>
                        )}
                        <div className="mt-4 font-mono text-[.72rem] font-bold uppercase tracking-wider text-ember">
                          Read more →
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
    </main>
  );
}
