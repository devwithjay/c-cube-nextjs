import "../client/index.css";

export const metadata = {
  title: "C Cube | Character • Competence • Culture",
  description: "C Cube — Character, Competence, and Culture | VIT Pune",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
