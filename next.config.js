const withTM = require('next-transpile-modules')([
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-react',
  '@project-serum/anchor',
  '@project-serum/borsh',
  '@project-serum/serum',
  'jazzicon',
  'raphael', // what is this?
]);

module.exports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  
  const nextConfig = {
    /* config options here */

    webpack: (config, { webpack }) => {
      config.plugins.push(new webpack.IgnorePlugin({
          resourceRegExp: /^electron$/
      }),);
      return config
    },

    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: false,
    },

    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },   
    images: {
      domains: ["strapi.therealgimmicks.com","strapi-staging.therealgimmicks.com",`${process.env.NEXT_PUBLIC_DATA_URL_STAGING}`, `${process.env.NEXT_PUBLIC_DATA_URL_PROD}`, `${process.env.NEXT_PUBLIC_API_URL_LOCAL}`, "arweave.net", "www.arweave.net", "localhost"],
    },
  }
  return withTM(nextConfig)
}
