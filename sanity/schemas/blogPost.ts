export const blogPost = {
  name: "blogPost",
  title: "Blog Posts",
  type: "document",
  fields: [
    // ── CORE ───────────────────────────────────────────────────────────
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (R: any) => R.required(),
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R: any) => R.required(),
      description: "Auto-generated from the title. The URL will be /blog/this-slug",
    },
    {
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on the blog listing page and in SEO.",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Amazon SEO", value: "Amazon SEO" },
          { title: "Product Research", value: "Product Research" },
          { title: "PPC & Ads", value: "PPC & Ads" },
          { title: "Launch Strategy", value: "Launch Strategy" },
          { title: "Case Study", value: "Case Study" },
          { title: "Industry News", value: "Industry News" },
        ],
        layout: "radio",
      },
    },
    {
      name: "readTime",
      title: "Read time (minutes)",
      type: "number",
    },

    // ── MEDIA ──────────────────────────────────────────────────────────
    {
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description: "Shown at the top of the post and on the listing card.",
    },

    // ── BODY ───────────────────────────────────────────────────────────
    {
      name: "body",
      title: "Post body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              { name: "link", type: "object", title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }] },
            ],
          },
        },
        // Inline images in body
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Alt text" },
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
        // Callout box
        {
          type: "object",
          name: "callout",
          title: "Callout box",
          fields: [
            { name: "type", type: "string", title: "Type",
              options: { list: ["tip", "warning", "note"], layout: "radio" } },
            { name: "text", type: "text", title: "Text" },
          ],
          preview: { select: { title: "text", subtitle: "type" } },
        },
      ],
    },

    // ── SEO ────────────────────────────────────────────────────────────
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Meta title", type: "string",
          description: "Defaults to post title if blank." },
        { name: "description", title: "Meta description", type: "text", rows: 2,
          description: "Defaults to excerpt if blank." },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }: any) {
      return {
        title,
        subtitle: subtitle ? subtitle.slice(0, 10) : "draft",
        media,
      };
    },
  },
};
