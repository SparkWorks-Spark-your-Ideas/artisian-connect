import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Initialize default groups in Firestore
 * Run this once during deployment setup
 */
export const initializeDefaultGroups = async () => {
  const defaultGroups = [
    {
      id: 'pottery-ceramics',
      name: 'Pottery & Ceramics',
      description: 'Traditional pottery makers and ceramic artists',
      category: 'pottery',
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'textiles-weaving',
      name: 'Textiles & Weaving',
      description: 'Handloom weavers and textile artisans',
      category: 'textiles',
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'jewelry-metalwork',
      name: 'Jewelry & Metalwork',
      description: 'Traditional jewelry makers and metal craftsmen',
      category: 'jewelry',
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'woodwork-carving',
      name: 'Woodwork & Carving',
      description: 'Wood carvers and furniture makers',
      category: 'woodwork',
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'painting-art',
      name: 'Painting & Art',
      description: 'Traditional painters and visual artists',
      category: 'painting',
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    }
  ];

  const batch = db.batch();
  
  for (const group of defaultGroups) {
    const groupRef = db.collection('groups').doc(group.id);
    batch.set(groupRef, group);
  }
  
  await batch.commit();
  console.log('Default groups initialized successfully');
};

/**
 * Initialize default categories in Firestore
 * Run this once during deployment setup
 */
export const initializeDefaultCategories = async () => {
  const defaultCategories = [
    {
      id: 'textiles',
      name: 'Textiles & Fabrics',
      description: 'Handwoven fabrics, embroidery, traditional clothing',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date()
    },
    {
      id: 'pottery',
      name: 'Pottery & Ceramics',
      description: 'Clay pots, decorative ceramics, terracotta items',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date()
    },
    {
      id: 'jewelry',
      name: 'Jewelry & Accessories',
      description: 'Traditional jewelry, handmade accessories',
      isActive: true,
      sortOrder: 3,
      createdAt: new Date()
    },
    {
      id: 'woodwork',
      name: 'Woodwork & Carving',
      description: 'Wooden crafts, sculptures, furniture',
      isActive: true,
      sortOrder: 4,
      createdAt: new Date()
    },
    {
      id: 'metalwork',
      name: 'Metalwork',
      description: 'Brass items, copper crafts, traditional metalwork',
      isActive: true,
      sortOrder: 5,
      createdAt: new Date()
    },
    {
      id: 'painting',
      name: 'Painting & Art',
      description: 'Traditional paintings, folk art, canvas work',
      isActive: true,
      sortOrder: 6,
      createdAt: new Date()
    },
    {
      id: 'other',
      name: 'Other Crafts',
      description: 'Various other traditional crafts and handmade items',
      isActive: true,
      sortOrder: 99,
      createdAt: new Date()
    }
  ];

  const batch = db.batch();
  
  for (const category of defaultCategories) {
    const categoryRef = db.collection('categories').doc(category.id);
    batch.set(categoryRef, category);
  }
  
  await batch.commit();
  console.log('Default categories initialized successfully');
};