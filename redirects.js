const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Squarespace legacy URLs → new Payload URLs.
  // Sourced from squarespace-url-map.txt (crawled 2025-05-19).
  // These run at the Next.js layer so they resolve immediately, independent of
  // the database. Additional redirects can be managed in the admin panel under
  // the Redirects collection (powered by @payloadcms/plugin-redirects).
  const squarespaceRedirects = [
    {
      source: '/home',
      destination: '/',
      permanent: true,
    },
    {
      source: '/contact-us',
      destination: '/contact',
      permanent: true,
    },
    {
      source: '/cart',
      destination: '/',
      permanent: true,
    },
  ]

  const redirects = [internetExplorerRedirect, ...squarespaceRedirects]

  return redirects
}

export default redirects
