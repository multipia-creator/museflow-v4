/**
 * NFT API Routes
 * Endpoints for NFT asset management
 */

import { Hono } from 'hono';
import { DatabaseService } from '../services/database.service';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Create NFT asset
 * POST /api/nft/assets
 */
app.post('/assets', async (c) => {
  try {
    const data = await c.req.json();

    // Validate required fields
    const required = ['token_id', 'contract_address', 'blockchain', 'name', 'metadata_url', 'creator_address'];
    for (const field of required) {
      if (!data[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const nft = await db.createNFTAsset(data);

    return c.json({
      success: true,
      data: nft,
    });
  } catch (error: any) {
    console.error('❌ Create NFT error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get NFT asset by ID
 * GET /api/nft/assets/:id
 */
app.get('/assets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = new DatabaseService(c.env.DB);
    const nft = await db.getNFTAsset(id);

    if (!nft) {
      return c.json({
        success: false,
        error: 'NFT not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: nft,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get NFT by token ID and contract
 * GET /api/nft/token/:tokenId/:contractAddress
 */
app.get('/token/:tokenId/:contractAddress', async (c) => {
  try {
    const tokenId = c.req.param('tokenId');
    const contractAddress = c.req.param('contractAddress');
    
    const db = new DatabaseService(c.env.DB);
    const nft = await db.getNFTByTokenId(tokenId, contractAddress);

    if (!nft) {
      return c.json({
        success: false,
        error: 'NFT not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: nft,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * List NFTs by exhibition
 * GET /api/nft/exhibition/:exhibitionId
 */
app.get('/exhibition/:exhibitionId', async (c) => {
  try {
    const exhibitionId = c.req.param('exhibitionId');
    const db = new DatabaseService(c.env.DB);
    const nfts = await db.listNFTsByExhibition(exhibitionId);

    return c.json({
      success: true,
      data: nfts,
      count: nfts.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * List NFTs by artwork
 * GET /api/nft/artwork/:artworkId
 */
app.get('/artwork/:artworkId', async (c) => {
  try {
    const artworkId = c.req.param('artworkId');
    const db = new DatabaseService(c.env.DB);
    const nfts = await db.listNFTsByArtwork(artworkId);

    return c.json({
      success: true,
      data: nfts,
      count: nfts.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * List NFTs by owner
 * GET /api/nft/owner/:ownerAddress
 */
app.get('/owner/:ownerAddress', async (c) => {
  try {
    const ownerAddress = c.req.param('ownerAddress');
    const db = new DatabaseService(c.env.DB);
    const nfts = await db.listNFTsByOwner(ownerAddress);

    return c.json({
      success: true,
      data: nfts,
      count: nfts.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Update NFT asset
 * PUT /api/nft/assets/:id
 */
app.put('/assets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();

    const db = new DatabaseService(c.env.DB);
    await db.updateNFTAsset(id, data);

    const updated = await db.getNFTAsset(id);

    return c.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Delete NFT asset
 * DELETE /api/nft/assets/:id
 */
app.delete('/assets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = new DatabaseService(c.env.DB);
    await db.deleteNFTAsset(id);

    return c.json({
      success: true,
      message: 'NFT deleted successfully',
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// ============================================================================
// NFT COLLECTIONS
// ============================================================================

/**
 * Create NFT collection
 * POST /api/nft/collections
 */
app.post('/collections', async (c) => {
  try {
    const data = await c.req.json();

    // Validate required fields
    const required = ['name', 'symbol', 'contract_address', 'blockchain'];
    for (const field of required) {
      if (!data[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const collection = await db.createNFTCollection(data);

    return c.json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    console.error('❌ Create collection error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get NFT collection by ID
 * GET /api/nft/collections/:id
 */
app.get('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = new DatabaseService(c.env.DB);
    const collection = await db.getNFTCollection(id);

    if (!collection) {
      return c.json({
        success: false,
        error: 'Collection not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * List all NFT collections
 * GET /api/nft/collections
 */
app.get('/collections', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const collections = await db.listNFTCollections();

    return c.json({
      success: true,
      data: collections,
      count: collections.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// ============================================================================
// NFT TRANSFER HISTORY
// ============================================================================

/**
 * Record NFT transfer
 * POST /api/nft/transfers
 */
app.post('/transfers', async (c) => {
  try {
    const data = await c.req.json();

    // Validate required fields
    const required = ['nft_id', 'token_id', 'from_address', 'to_address', 'transaction_hash', 'transfer_type'];
    for (const field of required) {
      if (!data[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const transfer = await db.recordNFTTransfer(data);

    // Update NFT owner if it's a transfer/sale
    if (data.transfer_type === 'transfer' || data.transfer_type === 'sale') {
      await db.updateNFTAsset(data.nft_id, {
        current_owner_address: data.to_address,
        last_sale_price: data.price_in_eth || null,
        total_sales: data.transfer_type === 'sale' ? 1 : 0,
      });
    }

    return c.json({
      success: true,
      data: transfer,
    });
  } catch (error: any) {
    console.error('❌ Record transfer error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get NFT transfer history
 * GET /api/nft/transfers/:nftId
 */
app.get('/transfers/:nftId', async (c) => {
  try {
    const nftId = c.req.param('nftId');
    const db = new DatabaseService(c.env.DB);
    const transfers = await db.getNFTTransferHistory(nftId);

    return c.json({
      success: true,
      data: transfers,
      count: transfers.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Test NFT endpoints
 * GET /api/nft/test
 */
app.get('/test', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);

    // Create test NFT
    const testNFT = await db.createNFTAsset({
      token_id: '1',
      contract_address: '0x1234567890abcdef',
      blockchain: 'ethereum',
      token_standard: 'ERC-721',
      name: 'Test Museum NFT #1',
      description: 'A test NFT for museum exhibition',
      metadata_url: 'ipfs://QmTest123',
      creator_address: '0xCreator123',
      exhibition_id: 'test-exhibition-1',
    });

    return c.json({
      success: true,
      message: 'NFT API test successful',
      testNFT,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;
