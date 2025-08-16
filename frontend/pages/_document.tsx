import Document, { Html, Head, Main, NextScript } from "next/document";

// Force dark mode by applying the "dark" class to <html>.
// If you want a toggle later, we can switch to a system/JS-based approach.
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="dark">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}