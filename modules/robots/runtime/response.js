export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain');
  return `User-agent: *
Crawl-Delay: 1`;
});
