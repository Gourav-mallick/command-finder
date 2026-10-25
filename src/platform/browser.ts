import open from 'open';
export async function openWebSearch(query: string): Promise<void> {
  const url = new URL('https://www.google.com/search'); url.searchParams.set('q', query);
  await open(url.toString());
}
