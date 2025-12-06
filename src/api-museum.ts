/**
 * MuseFlow Museum API Integration
 * Version: 17.0.0
 * Description: Museum collection data integration
 */

import { Hono } from 'hono'

type Bindings = {
  MUSEUM_API_KEY?: string;
  MUSEUM_API_BASE_URL?: string;
  ENABLE_MUSEUM_API?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// ==========================================
// Museum API - Artwork Search
// ==========================================
app.post('/artwork/search', async (c) => {
  try {
    const { query, limit = 10, category = 'all' } = await c.req.json()

    // Check if Museum API is enabled
    const isEnabled = c.env.ENABLE_MUSEUM_API === 'true'
    const apiKey = c.env.MUSEUM_API_KEY
    const baseUrl = c.env.MUSEUM_API_BASE_URL || 'https://api.museum.example.com'

    if (!isEnabled || !apiKey) {
      console.log('⚠️ Museum API not configured, returning simulated data')
      
      // Return simulated artwork data
      return c.json({
        success: true,
        data: {
          artworks: generateSimulatedArtworks(query, limit, category),
          total: limit,
          query: query,
          category: category
        },
        fallback: true,
        message: 'Museum API not configured. Using simulated data.'
      })
    }

    // Call real Museum API
    console.log(`🎨 [Museum API] Searching artworks: "${query}"`)
    
    const response = await fetch(`${baseUrl}/artworks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        limit,
        category
      })
    })

    if (!response.ok) {
      throw new Error(`Museum API error: ${response.status}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: {
        artworks: data.artworks || [],
        total: data.total || 0,
        query: query,
        category: category
      },
      fallback: false
    })

  } catch (error: any) {
    console.error('❌ Museum API error:', error)
    
    // Fallback to simulated data
    const { query, limit = 10, category = 'all' } = await c.req.json()
    
    return c.json({
      success: true,
      data: {
        artworks: generateSimulatedArtworks(query, limit, category),
        total: limit,
        query: query,
        category: category
      },
      fallback: true,
      message: 'Museum API failed. Using simulated data.',
      error: error.message
    })
  }
})

// ==========================================
// Museum API - Artwork Details
// ==========================================
app.get('/artwork/:id', async (c) => {
  try {
    const artworkId = c.req.param('id')

    const isEnabled = c.env.ENABLE_MUSEUM_API === 'true'
    const apiKey = c.env.MUSEUM_API_KEY
    const baseUrl = c.env.MUSEUM_API_BASE_URL || 'https://api.museum.example.com'

    if (!isEnabled || !apiKey) {
      return c.json({
        success: true,
        data: generateSimulatedArtworkDetail(artworkId),
        fallback: true
      })
    }

    const response = await fetch(`${baseUrl}/artworks/${artworkId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Museum API error: ${response.status}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data,
      fallback: false
    })

  } catch (error: any) {
    const artworkId = c.req.param('id')
    
    return c.json({
      success: true,
      data: generateSimulatedArtworkDetail(artworkId),
      fallback: true,
      error: error.message
    })
  }
})

// ==========================================
// Museum API - Collection Statistics
// ==========================================
app.get('/statistics', async (c) => {
  try {
    const isEnabled = c.env.ENABLE_MUSEUM_API === 'true'
    const apiKey = c.env.MUSEUM_API_KEY
    const baseUrl = c.env.MUSEUM_API_BASE_URL || 'https://api.museum.example.com'

    if (!isEnabled || !apiKey) {
      return c.json({
        success: true,
        data: generateSimulatedStatistics(),
        fallback: true
      })
    }

    const response = await fetch(`${baseUrl}/statistics`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Museum API error: ${response.status}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data,
      fallback: false
    })

  } catch (error: any) {
    return c.json({
      success: true,
      data: generateSimulatedStatistics(),
      fallback: true,
      error: error.message
    })
  }
})

// ==========================================
// Helper Functions - Simulated Data
// ==========================================

function generateSimulatedArtworks(query: string, limit: number, category: string) {
  const artworks = []
  
  for (let i = 0; i < limit; i++) {
    artworks.push({
      id: `artwork_${Date.now()}_${i}`,
      title: `${query} 관련 작품 ${i + 1}`,
      artist: ['모네', '르누아르', '고흐', '드가', '세잔'][i % 5],
      year: 1870 + (i * 5),
      category: category === 'all' ? ['회화', '조각', '사진'][i % 3] : category,
      description: `${query}와 관련된 ${category} 작품입니다. 시뮬레이션 데이터입니다.`,
      imageUrl: `https://picsum.photos/400/300?random=${Date.now() + i}`,
      museum: '시뮬레이션 뮤지엄',
      availability: ['대여 가능', '대여 불가', '협의 필요'][i % 3]
    })
  }
  
  return artworks
}

function generateSimulatedArtworkDetail(artworkId: string) {
  return {
    id: artworkId,
    title: '시뮬레이션 작품',
    artist: '클로드 모네',
    year: 1872,
    category: '회화',
    medium: '캔버스에 유채',
    dimensions: '48 × 63 cm',
    description: '인상주의의 대표작. 르 아브르 항구의 일출 풍경을 그린 작품입니다. (시뮬레이션 데이터)',
    imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
    museum: '시뮬레이션 뮤지엄',
    location: '서울',
    availability: '대여 가능',
    rentalFee: '협의 필요',
    insurance: '별도 협의',
    condition: '양호',
    lastRestored: '2020-03-15',
    provenance: '개인 소장 → 뮤지엄 기증',
    exhibitions: [
      { title: '인상주의 걸작전', year: 2019, venue: 'ABC 미술관' },
      { title: '19세기 프랑스 미술', year: 2021, venue: 'XYZ 갤러리' }
    ]
  }
}

function generateSimulatedStatistics() {
  return {
    totalArtworks: 12547,
    totalArtists: 3421,
    categories: {
      '회화': 5234,
      '조각': 2156,
      '사진': 1987,
      '설치': 1543,
      '기타': 1627
    },
    centuries: {
      '19세기': 3421,
      '20세기': 6543,
      '21세기': 2583
    },
    availability: {
      '대여 가능': 8234,
      '대여 불가': 3156,
      '협의 필요': 1157
    },
    lastUpdated: new Date().toISOString()
  }
}

// ==========================================
// Health Check
// ==========================================
app.get('/health', (c) => {
  const isEnabled = c.env.ENABLE_MUSEUM_API === 'true'
  const hasApiKey = !!c.env.MUSEUM_API_KEY
  
  return c.json({
    status: 'ok',
    service: 'Museum API Integration',
    version: '17.0.0',
    enabled: isEnabled,
    configured: hasApiKey,
    mode: isEnabled && hasApiKey ? 'real' : 'simulation'
  })
})

export default app
