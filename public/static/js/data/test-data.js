/**
 * Museflow v4.0 - Test Data Generator
 * Creates virtual users and projects for testing
 */

const TestData = {
  /**
   * Initialize test data if not exists
   */
  init() {
    const users = JSON.parse(localStorage.getItem('museflow_users') || '[]');
    
    if (users.length === 0) {
      console.log('🎭 No users found - Creating test users...');
      this.createTestUsers();
    } else {
      console.log(`👥 Found ${users.length} existing users`);
    }
  },
  
  /**
   * Create 5 test users with realistic data
   */
  createTestUsers() {
    const testUsers = [
      {
        id: 1000001,
        email: 'admin@museflow.com',
        password: 'admin123',
        name: '김관리',
        role: 'admin',
        createdAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 1000002,
        email: 'curator@museflow.com',
        password: 'curator123',
        name: '박큐레이터',
        role: 'curator',
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 1000003,
        email: 'researcher@museflow.com',
        password: 'research123',
        name: '이연구원',
        role: 'researcher',
        createdAt: new Date('2024-02-01').toISOString()
      },
      {
        id: 1000004,
        email: 'educator@museflow.com',
        password: 'edu123',
        name: '최교육',
        role: 'educator',
        createdAt: new Date('2024-02-15').toISOString()
      },
      {
        id: 1000005,
        email: 'test@museflow.com',
        password: 'test1234',
        name: '테스트 사용자',
        role: 'user',
        createdAt: new Date('2024-03-01').toISOString()
      }
    ];
    
    // Save to localStorage
    localStorage.setItem('museflow_users', JSON.stringify(testUsers));
    console.log('✅ Created 5 test users:');
    testUsers.forEach(user => {
      console.log(`   - ${user.email} / ${user.password} (${user.name})`);
    });
    
    // Create sample projects for each user
    this.createTestProjects(testUsers);
  },
  
  /**
   * Create sample projects for test users
   */
  createTestProjects(users) {
    const projectTemplates = [
      {
        title: '2024 특별 전시회 기획',
        description: '현대미술 특별전시회 기획 및 운영 프로젝트',
        module: 'exhibition',
        status: 'in-progress'
      },
      {
        title: '아동 교육 프로그램 개발',
        description: '초등학생 대상 체험형 교육 프로그램',
        module: 'education',
        status: 'in-progress'
      },
      {
        title: '문화재 디지털 아카이브',
        description: '소장품 디지털화 및 데이터베이스 구축',
        module: 'archive',
        status: 'pending'
      },
      {
        title: '전시 도록 제작',
        description: '2024 봄 기획전 전시 도록 출판',
        module: 'publication',
        status: 'in-progress'
      },
      {
        title: '미술사 연구 프로젝트',
        description: '19세기 한국 미술 연구 및 논문 작성',
        module: 'research',
        status: 'completed'
      },
      {
        title: '예산 계획 수립',
        description: '2024년 상반기 예산 편성 및 관리',
        module: 'administration',
        status: 'completed'
      }
    ];
    
    let projectCount = 0;
    
    users.forEach(user => {
      const userProjects = [];
      const numProjects = Math.floor(Math.random() * 3) + 2; // 2-4 projects per user
      
      for (let i = 0; i < numProjects; i++) {
        const template = projectTemplates[Math.floor(Math.random() * projectTemplates.length)];
        const projectId = Date.now() + projectCount++;
        
        const project = {
          id: projectId,
          title: `${template.title} ${i > 0 ? `(Phase ${i + 1})` : ''}`,
          description: template.description,
          module: template.module,
          status: template.status,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          progress: Math.floor(Math.random() * 100),
          tags: this.generateRandomTags()
        };
        
        userProjects.push(project);
        
        // Create canvas data for each project
        this.createCanvasData(user.id, projectId, template.module);
      }
      
      // Save projects for this user
      const storageKey = `museflow_projects_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(userProjects));
    });
    
    console.log(`✅ Created ${projectCount} test projects`);
  },
  
  /**
   * Create sample canvas data (nodes + connections)
   */
  createCanvasData(userId, projectId, module) {
    // Sample nodes for different modules
    const nodeSamples = {
      exhibition: [
        { type: 'Artwork', x: 100, y: 100 },
        { type: 'Timeline', x: 400, y: 100 },
        { type: 'Gallery', x: 700, y: 100 },
        { type: 'Catalog', x: 250, y: 300 },
        { type: 'Budget', x: 550, y: 300 }
      ],
      education: [
        { type: 'Curriculum', x: 100, y: 100 },
        { type: 'Workshop', x: 400, y: 100 },
        { type: 'Assessment', x: 700, y: 100 },
        { type: 'Instructor', x: 250, y: 300 }
      ],
      archive: [
        { type: 'Digitization', x: 100, y: 100 },
        { type: 'Metadata', x: 400, y: 100 },
        { type: 'Storage', x: 700, y: 100 },
        { type: 'Catalog', x: 250, y: 300 }
      ],
      publication: [
        { type: 'Manuscript', x: 100, y: 100 },
        { type: 'Edit', x: 400, y: 100 },
        { type: 'Design', x: 700, y: 100 },
        { type: 'Print', x: 550, y: 300 }
      ],
      research: [
        { type: 'Hypothesis', x: 100, y: 100 },
        { type: 'Data Collection', x: 400, y: 100 },
        { type: 'Analysis', x: 700, y: 100 },
        { type: 'Publication', x: 550, y: 300 }
      ],
      administration: [
        { type: 'Planning', x: 100, y: 100 },
        { type: 'Budget', x: 400, y: 100 },
        { type: 'HR', x: 700, y: 100 },
        { type: 'Report', x: 400, y: 300 }
      ]
    };
    
    const samples = nodeSamples[module] || nodeSamples.exhibition;
    
    // Create nodes
    const nodes = samples.map((sample, index) => ({
      id: `node_${projectId}_${index}`,
      type: sample.type,
      module: module,
      x: sample.x,
      y: sample.y,
      width: 280,
      height: 180,
      status: ['pending', 'in-progress', 'completed'][Math.floor(Math.random() * 3)],
      progress: Math.floor(Math.random() * 100),
      inputs: [{ id: 'input-0', label: 'Input', connected: false }],
      outputs: [{ id: 'output-0', label: 'Output', connected: false }]
    }));
    
    // Create connections between sequential nodes
    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: `conn_${projectId}_${i}`,
        sourceNodeId: nodes[i].id,
        sourceOutputIndex: 0,
        targetNodeId: nodes[i + 1].id,
        targetInputIndex: 0,
        type: 'sequential'
      });
    }
    
    const canvasData = {
      nodes: nodes,
      connections: connections,
      viewport: { x: 0, y: 0, zoom: 1 },
      lastSaved: new Date().toISOString()
    };
    
    const storageKey = `museflow_canvas_${userId}_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(canvasData));
  },
  
  /**
   * Generate random tags
   */
  generateRandomTags() {
    const allTags = ['urgent', 'research', 'collaborative', 'milestone', 'funded', 'public', 'internal'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  },
  
  /**
   * Show login hints in console
   */
  showLoginHints() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 TEST USER LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('👤 Admin:      admin@museflow.com / admin123');
    console.log('🎨 Curator:    curator@museflow.com / curator123');
    console.log('🔬 Researcher: researcher@museflow.com / research123');
    console.log('📚 Educator:   educator@museflow.com / edu123');
    console.log('🧪 Test User:  test@museflow.com / test1234');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
};

// Auto-initialize test data on load
TestData.init();
TestData.showLoginHints();

// Expose globally
window.TestData = TestData;
console.log('✅ Test Data loaded');
