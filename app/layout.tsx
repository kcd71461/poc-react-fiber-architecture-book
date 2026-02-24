import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "@/src/app.css";

export const metadata = {
  metadataBase: new URL("https://kcd71461.github.io/poc-react-fiber-architecture-book"),
  title: {
    default: "React Fiber Architecture Ebook",
    template: "%s | React Fiber Architecture Ebook",
  },
  description:
    "React Fiber의 추상 개념을 브라우저 레벨 동작으로 연결해 설명하는 교육용 전자책",
  applicationName: "React Fiber Architecture Ebook",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap("/book");

  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="RF" />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <div style={{ fontWeight: 700 }}>
                  React Fiber Architecture Ebook
                </div>
              }
            />
          }
          footer={<Footer>{new Date().getFullYear()} © React Fiber Ebook.</Footer>}
          docsRepositoryBase="https://github.com/facebook/react/tree/v18.2.0/packages"
          editLink="참고 소스 보기"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
          search
          toc={{ backToTop: true }}
          feedback={{ content: "이 장에서 가장 어려웠던 부분은 무엇인가요?" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
