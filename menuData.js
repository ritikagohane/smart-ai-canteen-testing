// Menu catalog for AI Smart Canteen
export const MENU_ITEMS = [
  // --- Sandwiches ---
  {
    id: "veg-sandwich",
    name: "Veg Sandwich",
    category: "Sandwiches",
    price: 60,
    calories: "280 kcal",
    badge: "Bestseller",
    emoji: "🥪",
    description: "Grilled multigrain bread loaded with fresh cucumber, tomato, mint chutney & cheese slice.",
    keywords: ["veg sandwich", "vegetable sandwich", "grilled sandwich", "sandwich", "sandwiches", "veg sandwhich"]
  },
  {
    id: "cheese-corn-sandwich",
    name: "Cheese Corn Sandwich",
    category: "Sandwiches",
    price: 75,
    calories: "320 kcal",
    badge: "Cheesy",
    emoji: "🥪",
    description: "Golden toasted sandwich bursting with sweet corn, melted mozzarella cheese & herbs.",
    keywords: ["cheese corn sandwich", "corn sandwich", "cheese sandwich", "corn cheese sandwich"]
  },
  {
    id: "bombay-toast-sandwich",
    name: "Bombay Masala Toast",
    category: "Sandwiches",
    price: 65,
    calories: "290 kcal",
    badge: "Campus Hit",
    emoji: "🥪",
    description: "Mumbai style spiced potato masala, crunchy beetroot, onion, spicy mint chutney & crispy sev.",
    keywords: ["bombay masala toast", "bombay toast", "masala toast", "bombay sandwich"]
  },

  // --- South Indian Breakfast ---
  {
    id: "masala-dosa",
    name: "Crispy Masala Dosa",
    category: "South Indian",
    price: 70,
    calories: "310 kcal",
    badge: "Hot & Crisp",
    emoji: "🥞",
    description: "Golden fermented rice crepe stuffed with spiced potato masala, served with coconut chutney & sambar.",
    keywords: ["masala dosa", "crispy masala dosa", "dosa", "masala dhosa", "crispy dosa"]
  },
  {
    id: "idli-sambar",
    name: "Steamed Idli Sambar (2 pcs)",
    category: "South Indian",
    price: 40,
    calories: "180 kcal",
    badge: "Healthy",
    emoji: "⚪",
    description: "Piping hot fluffy steamed rice cakes immersed in flavorful lentil vegetable sambar & coconut chutney.",
    keywords: ["idli sambar", "idli", "idlis", "steamed idli", "idli plate"]
  },
  {
    id: "poha",
    name: "Indori Kanda Poha",
    category: "South Indian",
    price: 35,
    calories: "210 kcal",
    badge: "Morning Special",
    emoji: "🥣",
    description: "Light flattened rice tempered with mustard, curry leaves, onions, crunchy peanuts & fresh lemon juice.",
    keywords: ["poha", "kanda poha", "indori poha", "pohe"]
  },

  // --- Burgers & Pizzas ---
  {
    id: "veg-burger",
    name: "Crispy Veg Burger",
    category: "Burgers & Pizzas",
    price: 80,
    calories: "380 kcal",
    badge: "Crispy",
    emoji: "🍔",
    description: "Spiced herb potato patty with lettuce, tomatoes, and house garlic mayo in a toasted sesame bun.",
    keywords: ["veg burger", "crispy burger", "burger", "crispy veg burger", "burgers"]
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza (7-inch)",
    category: "Burgers & Pizzas",
    price: 120,
    calories: "510 kcal",
    badge: "Cheese Pull",
    emoji: "🍕",
    description: "Crispy thin crust topped with rich Italian tomato sauce, fragrant basil & 100% mozzarella cheese.",
    keywords: ["margherita pizza", "cheese pizza", "pizza", "margherita", "pizzas"]
  },
  {
    id: "veggie-supreme-pizza",
    name: "Veggie Supreme Pizza",
    category: "Burgers & Pizzas",
    price: 140,
    calories: "540 kcal",
    badge: "Loaded",
    emoji: "🍕",
    description: "Loaded with colorful bell peppers, diced onions, black olives, sweet corn & spicy jalapeños.",
    keywords: ["veggie supreme pizza", "veggie pizza", "veg pizza", "supreme pizza"]
  },

  // --- Rolls & Wraps ---
  {
    id: "paneer-wrap",
    name: "Paneer Tikka Wrap",
    category: "Rolls & Wraps",
    price: 90,
    calories: "340 kcal",
    badge: "Chef Special",
    emoji: "🌯",
    description: "Smoky tandoori paneer cubes wrapped in whole wheat flatbread with tangy chipotle sauce.",
    keywords: ["paneer wrap", "paneer roll", "paneer tikka wrap", "paneer tikka roll", "paneer", "wrap", "roll"]
  },
  {
    id: "falafel-wrap",
    name: "Crispy Falafel Wrap",
    category: "Rolls & Wraps",
    price: 85,
    calories: "320 kcal",
    badge: "Mediterranean",
    emoji: "🌯",
    description: "Crispy herb chickpea fritters wrapped with pickled veggies, hummus & creamy tahini dressing.",
    keywords: ["falafel wrap", "falafel roll", "falafel"]
  },

  // --- Meals & Combos ---
  {
    id: "chole-bhature",
    name: "Amritsari Chole Bhature",
    category: "Meals & Combos",
    price: 85,
    calories: "520 kcal",
    badge: "Hearty",
    emoji: "🍛",
    description: "Two puffed golden bhaturas served with spicy authentic chickpea curry, pickled chili & onions.",
    keywords: ["chole bhature", "chole bhatura", "chhole bhature", "bhature", "chole"]
  },
  {
    id: "rajma-rice-bowl",
    name: "Punjabi Rajma Rice Bowl",
    category: "Meals & Combos",
    price: 75,
    calories: "410 kcal",
    badge: "Comfort Meal",
    emoji: "🍚",
    description: "Slow-cooked Punjabi red kidney beans in thick spiced gravy over steaming aromatic basmati rice.",
    keywords: ["rajma rice", "rajma rice bowl", "rajma chawal", "rajma", "rice bowl"]
  },
  {
    id: "fried-rice-manchurian",
    name: "Fried Rice & Manchurian",
    category: "Meals & Combos",
    price: 110,
    calories: "480 kcal",
    badge: "Desi Chinese",
    emoji: "🥡",
    description: "Wok-tossed garlic vegetable fried rice served with crispy vegetable Manchurian dumplings in tangy gravy.",
    keywords: ["fried rice manchurian", "manchurian combo", "fried rice", "manchurian", "chinese combo"]
  },
  {
    id: "white-sauce-pasta",
    name: "Creamy White Sauce Pasta",
    category: "Meals & Combos",
    price: 110,
    calories: "450 kcal",
    badge: "Italian",
    emoji: "🍝",
    description: "Tender penne pasta simmered in rich creamy garlic Alfredo sauce with sweet corn, broccoli & herbs.",
    keywords: ["white sauce pasta", "pasta", "alfredo pasta", "creamy pasta", "penne pasta"]
  },

  // --- Quick Bites ---
  {
    id: "samosa-plate",
    name: "Samosa (2 pcs)",
    category: "Quick Bites",
    price: 30,
    calories: "260 kcal",
    badge: "Fresh & Hot",
    emoji: "🥟",
    description: "Golden fried pastry stuffed with spiced potatoes and green peas, served with sweet & mint chutney.",
    keywords: ["samosa", "samosas", "samosa plate", "samosa 2 pcs", "two samosas"]
  },
  {
    id: "vada-pav",
    name: "Mumbai Vada Pav (2 pcs)",
    category: "Quick Bites",
    price: 40,
    calories: "310 kcal",
    badge: "Street Special",
    emoji: "🍔",
    description: "Spiced golden potato fritters inside toasted buttered pav buns with fiery dry garlic chutney.",
    keywords: ["vada pav", "wada pav", "vadapav", "vada pao", "wadapav"]
  },
  {
    id: "pav-bhaji",
    name: "Butter Pav Bhaji",
    category: "Quick Bites",
    price: 80,
    calories: "420 kcal",
    badge: "Extra Butter",
    emoji: "🍲",
    description: "Spicy mashed seasonal vegetable bhaji topped with Amul butter, served with two soft toasted pavs.",
    keywords: ["pav bhaji", "pao bhaji", "bhaji pav", "butter pav bhaji"]
  },
  {
    id: "french-fries",
    name: "Peri Peri Fries",
    category: "Quick Bites",
    price: 70,
    calories: "310 kcal",
    badge: "Spicy",
    emoji: "🍟",
    description: "Crispy salted potato fries tossed in fiery African peri-peri seasoning.",
    keywords: ["french fries", "fries", "peri peri fries", "peri-peri fries", "chips"]
  },

  // --- Beverages ---
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    category: "Beverages",
    price: 50,
    calories: "190 kcal",
    badge: "Student Favorite",
    emoji: "🧋",
    description: "Thick, creamy chilled espresso blend topped with chocolate drizzle.",
    keywords: ["cold coffee", "chilled coffee", "iced coffee", "frappe", "coffee"]
  },
  {
    id: "masala-chai",
    name: "Masala Chai",
    category: "Beverages",
    price: 20,
    calories: "90 kcal",
    badge: "Hot & Fresh",
    emoji: "☕",
    description: "Traditional aromatic tea infused with ginger, cardamom, and clove.",
    keywords: ["masala chai", "tea", "chai", "hot tea", "ginger tea"]
  },
  {
    id: "mango-lassi",
    name: "Thick Mango Lassi",
    category: "Beverages",
    price: 45,
    calories: "210 kcal",
    badge: "Chilled",
    emoji: "🥭",
    description: "Traditional churned yogurt cooler infused with sweet Alphonso mango pulp and cardamom.",
    keywords: ["mango lassi", "lassi", "mango shake", "sweet lassi"]
  },
  {
    id: "oreo-milkshake",
    name: "Oreo Cookie Milkshake",
    category: "Beverages",
    price: 70,
    calories: "310 kcal",
    badge: "Thick Shake",
    emoji: "🥤",
    description: "Creamy vanilla ice cream blended with crunchy Oreo cookies & chocolate fudge sauce.",
    keywords: ["oreo milkshake", "oreo shake", "milkshake", "shake", "oreo"]
  },
  {
    id: "fresh-lemon-soda",
    name: "Fresh Lemon Soda",
    category: "Beverages",
    price: 30,
    calories: "70 kcal",
    badge: "Refreshing",
    emoji: "🍋",
    description: "Chilled sparkling soda with freshly squeezed lime juice, rock salt, mint leaves & crushed ice.",
    keywords: ["fresh lemon soda", "lemon soda", "nimbu soda", "lime soda", "lemonade"]
  },

  // --- Desserts ---
  {
    id: "chocolate-muffin",
    name: "Choco Lava Muffin",
    category: "Desserts",
    price: 65,
    calories: "320 kcal",
    badge: "Warm Center",
    emoji: "🧁",
    description: "Decadent warm chocolate muffin with a molten fudge center.",
    keywords: ["choco lava muffin", "chocolate muffin", "muffin", "choco lava", "cake", "dessert"]
  },
  {
    id: "gulab-jamun",
    name: "Hot Gulab Jamun (2 pcs)",
    category: "Desserts",
    price: 40,
    calories: "270 kcal",
    badge: "Melt-in-Mouth",
    emoji: "🍯",
    description: "Warm golden milk-solid dumplings soaked in aromatic saffron and green cardamom sugar syrup.",
    keywords: ["gulab jamun", "gulab jamuns", "gulab jamun 2 pcs", "sweets"]
  },
  {
    id: "ice-cream-sundae",
    name: "Chocolate Sundae Scoop",
    category: "Desserts",
    price: 60,
    calories: "220 kcal",
    badge: "Cold Treat",
    emoji: "🍨",
    description: "Double scoop vanilla bean ice cream drenched in warm hot fudge, toasted cashews & wafer roll.",
    keywords: ["chocolate sundae", "ice cream sundae", "ice cream", "sundae"]
  }
];

export const CATEGORIES = [
  "All",
  "Sandwiches",
  "South Indian",
  "Burgers & Pizzas",
  "Rolls & Wraps",
  "Meals & Combos",
  "Quick Bites",
  "Beverages",
  "Desserts"
];
