import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import { BlockingVsYieldingTimeline } from "@/src/components/ebook/BlockingVsYieldingTimeline";
import { SourceMapTable } from "@/src/components/ebook/SourceMapTable";
import { InlineAnnotation } from "@/src/components/ebook/InlineAnnotation";

export const useMDXComponents = (components = {}) => {
  const docsComponents = getDocsMDXComponents();

  return {
    ...docsComponents,
    BlockingVsYieldingTimeline,
    SourceMapTable,
    InlineAnnotation,
    ...components,
  };
};
