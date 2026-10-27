require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const OutfitPlan = require('../models/OutfitPlan');
const WishlistItem = require('../models/WishlistItem');
const CommunityPost = require('../models/CommunityPost');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/closetiq';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      ClothingItem.deleteMany({}),
      Outfit.deleteMany({}),
      OutfitPlan.deleteMany({}),
      WishlistItem.deleteMany({}),
      CommunityPost.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const elena = await User.create({
      name: 'Elena Vance',
      email: 'elena@closetiq.fashion',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Fashion curator & minimalist enthusiast. Living in elevated neutrals & timeless silhouettes.',
    });

    const marcus = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@closetiq.fashion',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Architectural streetwear & tailored cuts. Capsule wardrobe experimenter.',
    });

    console.log('[Seed] Creating Elena\'s wardrobe items...');
    const clothingDefs = [
      {
        userId: elena._id,
        name: 'Silk Crepe Ivory Blouse',
        category: 'Tops',
        imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80',
        color: 'Ivory',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'Toteme',
        notes: 'Fluid silk crepe drape, mother-of-pearl buttons. Dry clean only.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Cashmere Ribbed Turtleneck',
        category: 'Tops',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
        color: 'Oatmeal',
        season: 'Winter',
        occasion: 'Casual',
        brand: 'Loro Piana',
        notes: 'Ultra-soft grade A cashmere. Warm yet lightweight.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Structured Poplin Button-Down',
        category: 'Tops',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
        color: 'Crisp White',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'Khaite',
        notes: 'Sharp oversized collar and elongated cuffs.',
        isFavorite: false,
      },
      {
        userId: elena._id,
        name: 'Wide-Leg Pleated Wool Trousers',
        category: 'Bottoms',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
        color: 'Charcoal',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'The Row',
        notes: 'Double front pleats, fluid high-rise fit. Pairs with everything.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'High-Rise Straight Selvedge Denim',
        category: 'Bottoms',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
        color: 'Washed Indigo',
        season: 'All-Season',
        occasion: 'Casual',
        brand: 'Agolde',
        notes: '100% organic cotton rigid denim. Flattering vintage cut.',
        isFavorite: false,
      },
      {
        userId: elena._id,
        name: 'Satin Column Slip Skirt',
        category: 'Bottoms',
        imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
        color: 'Champagne',
        season: 'Summer',
        occasion: 'Party',
        brand: 'Vince',
        notes: 'Bias-cut heavy satin with subtle sheen.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Asymmetric Drape Slip Dress',
        category: 'Dresses',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
        color: 'Muted Lavender',
        season: 'Summer',
        occasion: 'Formal',
        brand: 'Reformation',
        notes: 'Delicate cowl neckline and low back detail.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Tailored Wool Tuxedo Dress',
        category: 'Dresses',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
        color: 'Obsidian Black',
        season: 'Fall',
        occasion: 'Party',
        brand: 'Saint Laurent',
        notes: 'Satin lapels with structured shoulder pads. Statement piece.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Double-Breasted Wool Gabardine Trench',
        category: 'Outerwear',
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        color: 'Camel',
        season: 'Fall',
        occasion: 'Work',
        brand: 'Burberry',
        notes: 'Heritage storm flap, horn buttons, waist belt.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Oversized Boxy Wool Blazer',
        category: 'Outerwear',
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        color: 'Charcoal Grey',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'Frankie Shop',
        notes: 'Effortlessly oversized menswear-inspired silhouette.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Minimalist Leather Penny Loafers',
        category: 'Shoes',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
        color: 'Black',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'Prada',
        notes: 'Brushed spazzolato calfskin leather with subtle lug sole.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Strappy Sculptural Stiletto Sandals',
        category: 'Shoes',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
        color: 'Nude Beige',
        season: 'Summer',
        occasion: 'Party',
        brand: 'Bottega Veneta',
        notes: 'Square toe with architectural heel.',
        isFavorite: false,
      },
      {
        userId: elena._id,
        name: 'Clean Leather Low-Top Court Sneakers',
        category: 'Shoes',
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
        color: 'Optic White',
        season: 'All-Season',
        occasion: 'Casual',
        brand: 'Common Projects',
        notes: 'Italian nappa leather with gold serial stamp.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Structured Calfskin Everyday Tote',
        category: 'Bags',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
        color: 'Warm Taupe',
        season: 'All-Season',
        occasion: 'Work',
        brand: 'Polène',
        notes: 'Full-grain textured calf leather. Fits 15-inch laptop comfortably.',
        isFavorite: true,
      },
      {
        userId: elena._id,
        name: 'Woven Nappa Leather Crossbody Bag',
        category: 'Bags',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
        color: 'Butter Cream',
        season: 'All-Season',
        occasion: 'Casual',
        brand: 'Bottega Veneta',
        notes: 'Signature cassette weave with magnetic closure.',
        isFavorite: false,
      },
      {
        userId: elena._id,
        name: 'Architectural Gold Huggie Hoops',
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
        color: '18k Gold',
        season: 'All-Season',
        occasion: 'Casual',
        brand: 'Mejuri',
        notes: '18k gold vermeil chunky bold hoops.',
        isFavorite: true,
      },
    ];

    const items = await ClothingItem.insertMany(clothingDefs);
    console.log(`[Seed] Inserted ${items.length} clothing items.`);

    // Map item by name for easy outfit building
    const itemMap = {};
    items.forEach((item) => {
      itemMap[item.name] = item._id;
    });

    console.log('[Seed] Creating Elena\'s outfits...');
    const outfit1 = await Outfit.create({
      userId: elena._id,
      name: 'Editorial Atelier Workwear',
      description: 'Structured tailoring softened with silk drape and polished minimalist loafers. Ideal for presentations and executive meetings.',
      clothingItems: [
        itemMap['Silk Crepe Ivory Blouse'],
        itemMap['Wide-Leg Pleated Wool Trousers'],
        itemMap['Oversized Boxy Wool Blazer'],
        itemMap['Minimalist Leather Penny Loafers'],
        itemMap['Structured Calfskin Everyday Tote'],
        itemMap['Architectural Gold Huggie Hoops'],
      ],
      occasion: 'Work',
      season: 'All-Season',
      isFavorite: true,
    });

    const outfit2 = await Outfit.create({
      userId: elena._id,
      name: 'Autumn Trench & Cashmere Layering',
      description: 'Effortless weekend museum stroll and espresso bar ensemble. Warm oatmeal knit with heritage camel outerwear.',
      clothingItems: [
        itemMap['Cashmere Ribbed Turtleneck'],
        itemMap['High-Rise Straight Selvedge Denim'],
        itemMap['Double-Breasted Wool Gabardine Trench'],
        itemMap['Clean Leather Low-Top Court Sneakers'],
        itemMap['Woven Nappa Leather Crossbody Bag'],
      ],
      occasion: 'Casual',
      season: 'Fall',
      isFavorite: true,
    });

    const outfit3 = await Outfit.create({
      userId: elena._id,
      name: 'Gallery Vernissage & Cocktails',
      description: 'Fluid muted lavender silk with sharp masculine charcoal tailoring. Sensual yet composed.',
      clothingItems: [
        itemMap['Asymmetric Drape Slip Dress'],
        itemMap['Oversized Boxy Wool Blazer'],
        itemMap['Strappy Sculptural Stiletto Sandals'],
        itemMap['Architectural Gold Huggie Hoops'],
      ],
      occasion: 'Party',
      season: 'Summer',
      isFavorite: true,
    });

    const outfit4 = await Outfit.create({
      userId: elena._id,
      name: 'Sharp Evening Gala Look',
      description: 'Statuesque tailored tuxedo silhouette that demands attention without saying a word.',
      clothingItems: [
        itemMap['Tailored Wool Tuxedo Dress'],
        itemMap['Minimalist Leather Penny Loafers'],
        itemMap['Structured Calfskin Everyday Tote'],
        itemMap['Architectural Gold Huggie Hoops'],
      ],
      occasion: 'Formal',
      season: 'Winter',
      isFavorite: false,
    });

    console.log('[Seed] Scheduling outfits on calendar...');
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(today.getDate() + 3);

    const plans = [
      {
        userId: elena._id,
        outfitId: outfit1._id,
        plannedDate: today,
        dateString: today.toISOString().split('T')[0],
        notes: 'Board meeting & design review at 10 AM',
      },
      {
        userId: elena._id,
        outfitId: outfit2._id,
        plannedDate: tomorrow,
        dateString: tomorrow.toISOString().split('T')[0],
        notes: 'Coffee with styling client & Soho showroom visits',
      },
      {
        userId: elena._id,
        outfitId: outfit3._id,
        plannedDate: dayAfter,
        dateString: dayAfter.toISOString().split('T')[0],
        notes: 'Modern Art Foundation opening night',
      },
    ];
    await OutfitPlan.insertMany(plans);

    console.log('[Seed] Adding wishlist items...');
    await WishlistItem.insertMany([
      {
        userId: elena._id,
        name: 'The Row Bourgeoise Knee Boots',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
        price: 1890,
        productUrl: 'https://therow.com',
        category: 'Shoes',
        notes: 'Supple lambskin, sculpted cylindrical heel. Perfect winter hero boot.',
      },
      {
        userId: elena._id,
        name: 'Lemaire Croissant Medium Bag',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
        price: 1250,
        productUrl: 'https://lemaire.fr',
        category: 'Bags',
        notes: 'Dark chocolate nappa leather, topstitched seams.',
      },
      {
        userId: elena._id,
        name: 'Acne Studios V-Neck Mohair Knit',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
        price: 490,
        productUrl: 'https://acnestudios.com',
        category: 'Tops',
        notes: 'Airy brushed mohair-blend in heather moss green.',
      },
      {
        userId: elena._id,
        name: 'Jil Sander Geometric Silver Cuff',
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
        price: 680,
        productUrl: 'https://jilsander.com',
        category: 'Accessories',
        notes: 'Sterling silver minimalist architectural bangle.',
      },
    ]);

    console.log('[Seed] Creating community posts...');
    const post1 = await CommunityPost.create({
      userId: elena._id,
      outfitId: outfit1._id,
      caption: 'The power of high-waisted wool pleats and clean silk crepe. A uniform that feels calming yet sharp when your schedule is packed.',
      likes: [marcus._id],
    });

    const post2 = await CommunityPost.create({
      userId: elena._id,
      outfitId: outfit2._id,
      caption: 'Weekend transitional dressing: never underestimate the grounding presence of a heavy camel trench and worn-in selvedge denim.',
      likes: [marcus._id],
    });

    // Also Marcus creates a community post
    // Give Marcus 3 clothes and an outfit
    const marcusJacket = await ClothingItem.create({
      userId: marcus._id,
      name: 'Deconstructed Japanese Denim Chore Jacket',
      category: 'Outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
      color: 'Indigo',
      season: 'Spring',
      occasion: 'Casual',
      brand: 'Kapital',
      notes: 'Hand-dyed sashiko stitching.',
    });
    const marcusTee = await ClothingItem.create({
      userId: marcus._id,
      name: 'Heavyweight Drop-Shoulder Tee',
      category: 'Tops',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      color: 'Off-White',
      season: 'All-Season',
      occasion: 'Casual',
      brand: 'Studio Nicholson',
    });
    const marcusPants = await ClothingItem.create({
      userId: marcus._id,
      name: 'Relaxed Balloon Fit Cargo Pants',
      category: 'Bottoms',
      imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80',
      color: 'Olive Green',
      season: 'All-Season',
      occasion: 'Casual',
      brand: 'WTAPS',
    });
    const marcusOutfit = await Outfit.create({
      userId: marcus._id,
      name: 'Architectural Streetwear Silhouette',
      description: 'Proportions over branding. Heavyweight textures and voluminous drape.',
      clothingItems: [marcusJacket._id, marcusTee._id, marcusPants._id],
      occasion: 'Casual',
      season: 'Spring',
      isFavorite: true,
    });
    await CommunityPost.create({
      userId: marcus._id,
      outfitId: marcusOutfit._id,
      caption: 'Focusing on texture and drape this season. Organic cotton and natural indigo speak for themselves.',
      likes: [elena._id],
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('Demo Logins:');
    console.log('1. Elena Vance:  elena@closetiq.fashion  |  password123');
    console.log('2. Marcus Chen:  marcus@closetiq.fashion |  password123');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

