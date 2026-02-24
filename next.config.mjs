import nextra from "nextra";

const repoBasePath = "/poc-react-fiber-architecture-book";
const isProd = process.env.NODE_ENV === "production";

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/book",
});

export default withNextra({
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? repoBasePath : "",
  assetPrefix: isProd ? repoBasePath : undefined,
});
