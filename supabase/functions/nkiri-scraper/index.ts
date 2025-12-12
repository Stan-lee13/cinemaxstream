
// Deno runtime provides `serve`. Declare it here for local type-checking.
declare function serve(handler: (req: Request) => Promise<Response> | Response): void;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Whitelist of allowed domains
const ALLOWED_DOMAINS = ['nkiri.com', 'www.nkiri.com'];

// Security: Block private IP ranges (SSRF protection)
const PRIVATE_IP_PATTERNS = [
  /^127\./,                        // Loopback
  /^10\./,                         // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[01])\./,// Private Class B
  /^192\.168\./,                   // Private Class C
  /^169\.254\./,                   // Link-local
  /^0\./,                          // Current network
  /^localhost$/i,                  // Localhost
  /^::1$/,                         // IPv6 loopback
  /^fc00:/,                        // IPv6 private
  /^fe80:/,                        // IPv6 link-local
];

function isBlockedIP(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname));
}

function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed' };
    }
    
    // Check domain whitelist
    if (!isAllowedDomain(urlObj.hostname)) {
      return { valid: false, error: 'Domain not allowed' };
    }
    
    // Block private IPs
    if (isBlockedIP(urlObj.hostname)) {
      return { valid: false, error: 'Access denied' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, requestId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Security: Validate URL before processing
    const validation = validateUrl(url);
    if (!validation.valid) {
      console.warn(`Blocked request to invalid URL: ${url.substring(0, 100)}`);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Scraping Nkiri page: ${url}, requestId: ${requestId || 'none'}`);

    // Perform the scraping
    const scrapeResult = await scrapeNkiriPage(url);

    if (scrapeResult.success) {
      console.log(`Successfully extracted download link`);
      
      return new Response(
        JSON.stringify(scrapeResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: scrapeResult.error || 'Failed to extract download link'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Nkiri scraping error:', error);
    const msg = (error as Error)?.message ?? String(error);
    return new Response(
      JSON.stringify({ success: false, error: 'Processing error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

type ScrapeResult =
  | { success: true; downloadLink: string; quality?: string; fileSize?: string }
  | { success: false; error: string };

async function scrapeNkiriPage(url: string): Promise<ScrapeResult> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML to extract download links
    const downloadLinks = extractDownloadLinks(html);

    if (downloadLinks.length > 0) {
      const bestLink = downloadLinks[0]; // Get the first/best quality link

      return {
        success: true,
        downloadLink: bestLink.url,
        quality: bestLink.quality,
        fileSize: bestLink.size,
      };
    }

    return {
      success: false,
      error: 'No download links found on the page'
    };

  } catch (error) {
    console.error('Scraping error:', error);
    const msg = (error as Error)?.message ?? String(error);
    return {
      success: false,
      error: 'Failed to process page',
    };
  }
}

type DownloadLink = { url: string; quality?: string; size?: string; text?: string };

function extractDownloadLinks(html: string): DownloadLink[] {
  const links: DownloadLink[] = [];
  
  try {
    // Common patterns for download links on Nkiri
    const patterns = [
      // Direct downloadwella links
      /href="(https?:\/\/[^"]*downloadwella[^"]*)"[^>]*>([^<]*)/gi,
      // Other download patterns
      /href="(https?:\/\/[^"]*download[^"]*)"[^>]*>([^<]*)/gi,
      // MP4 or MKV direct links
      /href="([^"]*\.(mp4|mkv|avi)[^"]*)"[^>]*>([^<]*)/gi
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        const text = match[2] || match[3] || '';

        // Extract quality info from text
        const quality = extractQuality(text) ?? 'Unknown';
        const size = extractFileSize(text) ?? 'Unknown';

        links.push({
          url: url,
          quality,
          size,
          text: text.trim(),
        });
      }
    });

    // Remove duplicates and sort by quality preference
    const uniqueLinks = links.filter((link, index, self) => index === self.findIndex((l) => l.url === link.url));

    // Sort by quality preference (1080p, 720p, 480p, etc.)
    return uniqueLinks.sort((a, b) => {
      const qualityOrder = ['1080p', '720p', '480p', '360p'];
      const aIndex = qualityOrder.indexOf(a.quality ?? '');
      const bIndex = qualityOrder.indexOf(b.quality ?? '');

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      return 0;
    });

  } catch (error) {
    console.error('Link extraction error:', error);
    return [];
  }
}

function extractQuality(text: string): string | null {
  const qualityMatch = text.match(/(\d+p)/i);
  return qualityMatch ? qualityMatch[1] : null;
}

function extractFileSize(text: string): string | null {
  const sizeMatch = text.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i);
  return sizeMatch ? sizeMatch[1] : null;
}
