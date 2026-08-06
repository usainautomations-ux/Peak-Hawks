"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { structure } from "@/sanity/structure";
import { pageContent } from "@/sanity/schemas/pageContent";
import { blogPost } from "@/sanity/schemas/blogPost";
import { caseStudy } from "@/sanity/schemas/caseStudy";
import { siteFooter } from "@/sanity/schemas/siteFooter";

export default defineConfig({
  name: "peakhawks",
  title: "PeakHawks Content",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [pageContent, blogPost, caseStudy, siteFooter],
  },
  plugins: [
    structureTool({ structure }),
    // GROQ playground for debugging queries — safe to remove for a fully
    // non-technical client, but harmless to leave in.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
