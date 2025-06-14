export default {
  siteUrl: 'https://example.com',
  pathPrefix:
    process.env.ELEVENTY_RUN_MODE === 'serve' ? '' : '/therunicedda-landing/',
  language: 'en',
  title: 'This title comes from the metadata.',
  description: 'This desc comes from the metadata.',
}
