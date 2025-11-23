-- NFT Assets Table
-- Stores blockchain-based digital assets linked to artworks

CREATE TABLE IF NOT EXISTS nft_assets (
  id TEXT PRIMARY KEY,
  
  -- NFT Identification
  token_id TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  blockchain TEXT NOT NULL, -- 'ethereum', 'polygon', 'klaytn', etc.
  token_standard TEXT DEFAULT 'ERC-721', -- 'ERC-721', 'ERC-1155', 'KIP-17', etc.
  
  -- Asset Information
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  animation_url TEXT, -- For video/3D assets
  external_url TEXT, -- Link to exhibition or artwork page
  
  -- Metadata
  metadata_url TEXT NOT NULL, -- IPFS or HTTP URL to metadata JSON
  metadata_json TEXT, -- Cached metadata
  
  -- Artwork Association
  artwork_id TEXT, -- Links to knowledge_entities table
  exhibition_id TEXT, -- Links to workflows table
  
  -- Ownership & Rights
  creator_address TEXT NOT NULL,
  current_owner_address TEXT,
  minted_at DATETIME,
  minting_transaction TEXT, -- Transaction hash
  
  -- Attributes
  attributes TEXT, -- JSON array of traits/properties
  rarity_score REAL, -- Calculated rarity score
  
  -- Commercial
  price_in_eth REAL,
  last_sale_price REAL,
  total_sales INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'minted', -- 'draft', 'minted', 'listed', 'sold', 'burned'
  visibility TEXT DEFAULT 'public', -- 'public', 'private', 'unlisted'
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nft_token_id ON nft_assets(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_contract ON nft_assets(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_blockchain ON nft_assets(blockchain);
CREATE INDEX IF NOT EXISTS idx_nft_artwork_id ON nft_assets(artwork_id);
CREATE INDEX IF NOT EXISTS idx_nft_exhibition_id ON nft_assets(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_nft_creator ON nft_assets(creator_address);
CREATE INDEX IF NOT EXISTS idx_nft_owner ON nft_assets(current_owner_address);
CREATE INDEX IF NOT EXISTS idx_nft_status ON nft_assets(status);

-- NFT Collections Table
-- Groups NFTs into collections (e.g., exhibition series)

CREATE TABLE IF NOT EXISTS nft_collections (
  id TEXT PRIMARY KEY,
  
  -- Collection Info
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  
  -- Contract Info
  contract_address TEXT NOT NULL UNIQUE,
  blockchain TEXT NOT NULL,
  token_standard TEXT DEFAULT 'ERC-721',
  
  -- Metadata
  base_uri TEXT, -- Base URI for token metadata
  collection_image TEXT,
  external_url TEXT,
  
  -- Exhibition Association
  exhibition_id TEXT, -- Links to workflows table
  
  -- Stats
  total_supply INTEGER DEFAULT 0,
  max_supply INTEGER,
  minted_count INTEGER DEFAULT 0,
  floor_price REAL,
  total_volume REAL,
  
  -- Royalties
  royalty_percentage REAL DEFAULT 0, -- e.g., 5.0 for 5%
  royalty_recipient TEXT, -- Wallet address
  
  -- Status
  status TEXT DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collection_contract ON nft_collections(contract_address);
CREATE INDEX IF NOT EXISTS idx_collection_blockchain ON nft_collections(blockchain);
CREATE INDEX IF NOT EXISTS idx_collection_exhibition ON nft_collections(exhibition_id);

-- NFT Transfer History Table
-- Tracks ownership transfers

CREATE TABLE IF NOT EXISTS nft_transfers (
  id TEXT PRIMARY KEY,
  
  -- NFT Reference
  nft_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  
  -- Transfer Details
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER,
  
  -- Price Info
  price_in_eth REAL,
  price_in_usd REAL,
  
  -- Transfer Type
  transfer_type TEXT NOT NULL, -- 'mint', 'sale', 'transfer', 'burn'
  marketplace TEXT, -- 'opensea', 'rarible', 'internal', etc.
  
  -- Timestamp
  transferred_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (nft_id) REFERENCES nft_assets(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transfer_nft_id ON nft_transfers(nft_id);
CREATE INDEX IF NOT EXISTS idx_transfer_from ON nft_transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_transfer_to ON nft_transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_transfer_transaction ON nft_transfers(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transfer_date ON nft_transfers(transferred_at);
