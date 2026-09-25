export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string) || 'trending'
  
  try {
    const url = `https://tenor.com/search/${encodeURIComponent(q)}-gifs`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Tenor: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Extract GIF URLs using regex
    const matches = html.match(/src="([^"]+\.gif[^"]*)"/g) || html.match(/src="([^"]*media\.tenor\.com[^"]*)"/g)
    
    if (!matches) {
      return { gifs: [] }
    }
    
    // Clean up and deduplicate URLs
    const gifUrls = [...new Set(
      matches.map(m => m.replace(/^src="/, '').replace(/"$/, ''))
    )]
    
    // Filter out some layout graphics that Tenor might include, keep only media.tenor.com
    const filteredUrls = gifUrls.filter(url => url.includes('media.tenor.com'))
    
    return { gifs: filteredUrls }
  } catch (error: any) {
    console.error('GIF Search Error:', error)
    return { gifs: [], error: error.message }
  }
})
