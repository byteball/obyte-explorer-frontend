export function prepareLink(link) {
  if (link.startsWith("/")) {
    link = link.replace(/\//g, "%2F");
  }
  
  if (link.includes('//')) {
    link = link.replace(/\/\//g, '%2F%2F');
  }
  
  return link;
}
