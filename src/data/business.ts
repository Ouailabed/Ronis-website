/*
 * ============================================================================
 *  RONI'S BUSINESS DATA — the one file to edit for facts shown on the site.
 * ============================================================================
 *  Every fact here was taken from Roni's official website (ronisonline.co.uk)
 *  or, where marked, from Roni's official listings on Deliveroo / Facebook.
 *  See VERIFICATION.md for the source and date of each fact and what is still
 *  missing. Please re-check anything marked `needsCheck: true` with the shops.
 *
 *  Do not add prices, reviews, awards or opening hours you have not confirmed.
 * ============================================================================
 */

export const LAST_CHECKED = "September 2026";

export const brand = {
  name: "Roni's",
  legalName: "Ronis Bagel Bakery Limited",
  tagline: "Fresh from Roni's",
  founded: 1989,
  founder: "Roni Avital",
  origin: "West Hampstead",
  url: "https://www.ronisonline.co.uk",
  instagram: "https://www.instagram.com/ronisbb/",
  facebook: "https://www.facebook.com/Ronisbakery/",
};

/* ---------------------------------------------------------------------------
 * ORDERING DESTINATIONS (all verified live pages on Roni's official site)
 * ------------------------------------------------------------------------- */
export const ordering = {
  /** Roni's official online ordering ("Online Orders (New)") */
  online: "https://www.ronisonline.co.uk/online-ordering",
  /** Official catering page: platters, 48-hour notice, collect in store */
  catering: "https://www.ronisonline.co.uk/catering",
  /** Official platters menu */
  plattersMenu: "https://www.ronisonline.co.uk/menu?menu=platters",
  /** Official "Order for Any Occasion" page: platters and bespoke cakes */
  occasions: "https://www.ronisonline.co.uk/order-for-any-occasion",
  /** Official feedback page */
  review: "https://www.ronisonline.co.uk/review",
};

export const catering = {
  leadTimeHours: 48,
  leadTimeText: "Please allow 48 hours for catering orders.",
  collection: "Order online and collect from your chosen Roni's.",
  lastMinute: "For last-minute orders, call the shop you wish to collect from.",
  dietary: "Vegetarian and vegan options are available on the platters menu.",
  miniBagelPlatter: {
    name: "Mini bagel platter",
    count: 25,
    price: 55, // £ — from Roni's official platters menu. Confirm when ordering.
    fillings: ["Smoked salmon & cream cheese", "Tuna mix & cucumber", "Cheddar cheese & tomato"],
  },
  otherPlatters: [
    { name: "Breaded chicken breast fingers & chips", note: "Platter" },
    { name: "Breaded white fish nuggets & chips", note: "Platter" },
    {
      name: "Vegetable bites",
      note: "Blanched and roasted broccoli, green beans & cauliflower nugget bites in a sweet chilli & garlic sauce",
    },
    { name: "Signature mini desserts", note: "A selection" },
  ],
};

/* ---------------------------------------------------------------------------
 * LOCATIONS
 *  hours: 24-hour times. close "24:00" = midnight.
 *  deliveroo: Roni's own listing for that shop (delivery), or "" if none.
 *  approx: rough map position for the schematic finder ONLY (not for
 *          navigation — the Directions buttons use the address).
 * ------------------------------------------------------------------------- */
export type Hours = { days: string; open: string; close: string };

export type Location = {
  slug: string;
  name: string;
  street: string;
  locality: string;
  postcode: string;
  phone: string;
  hours: Hours[];
  opened?: string;
  deliveroo: string;
  approx: { lat: number; lng: number };
  needsCheck?: string;
};

export const locations: Location[] = [
  {
    slug: "west-hampstead",
    name: "West Hampstead",
    street: "250 West End Lane",
    locality: "London",
    postcode: "NW6 1LG",
    phone: "020 7794 6663",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "24:00" }],
    opened: "The original Roni's, opened 1989",
    deliveroo: "https://deliveroo.co.uk/menu/london/west-hampstead/ronis-bakery",
    approx: { lat: 51.5476, lng: -0.1911 },
  },
  {
    slug: "belsize-village",
    name: "Belsize Village",
    street: "37 Belsize Lane",
    locality: "London",
    postcode: "NW3 5AS",
    phone: "020 7998 1477",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "18:00" }],
    opened: "Opened 2011",
    deliveroo: "https://deliveroo.co.uk/menu/london/belsize-park/ronis-belsize",
    approx: { lat: 51.5503, lng: -0.1708 },
  },
  {
    slug: "hampstead",
    name: "Hampstead",
    street: "44 Rosslyn Hill",
    locality: "London",
    postcode: "NW3 1NH",
    phone: "020 7433 3103",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "20:00" }],
    opened: "Opened 2013",
    deliveroo: "https://deliveroo.co.uk/menu/london/hampstead/ronis-hampstead",
    approx: { lat: 51.5541, lng: -0.1712 },
  },
  {
    slug: "swains-lane",
    name: "Swains Lane",
    street: "2 Swains Lane",
    locality: "London",
    postcode: "N6 6AG",
    phone: "020 8340 4404",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "18:00" }],
    deliveroo: "",
    approx: { lat: 51.5627, lng: -0.1472 },
  },
  {
    slug: "muswell-hill",
    name: "Muswell Hill",
    street: "348 Muswell Hill Broadway",
    locality: "London",
    postcode: "N10 1DJ",
    phone: "020 8829 4999",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "20:00" }],
    deliveroo: "https://deliveroo.co.uk/menu/london/muswell-hill/ronis",
    approx: { lat: 51.5904, lng: -0.1437 },
  },
  {
    slug: "brent-cross",
    name: "Brent Cross",
    street: "Brent Cross Shopping Centre",
    locality: "London",
    postcode: "",
    phone: "020 8457 4999",
    hours: [],
    deliveroo: "",
    approx: { lat: 51.5764, lng: -0.2233 },
    needsCheck: "Opening hours and exact unit/postcode are not published on Roni's website — call the shop.",
  },
];

/* ---------------------------------------------------------------------------
 * MENU — items as described on Roni's official site and official Deliveroo
 * listings. Prices differ between shops and channels, so they're not shown
 * (except the platter price published on Roni's own platters menu).
 * ------------------------------------------------------------------------- */
export type MenuCategory = "bagels" | "bakery" | "breakfast" | "cakes" | "cafe" | "platters";

export type MenuItem = {
  name: string;
  description: string;
  category: MenuCategory;
  price?: string;
  signature?: boolean;
};

export const menuCategories: { id: MenuCategory; label: string; blurb: string }[] = [
  { id: "bagels", label: "Filled bagels", blurb: "Freshly filled at the counter." },
  { id: "bakery", label: "Bakery", blurb: "Bagels, challah and bakes to take home." },
  { id: "breakfast", label: "Breakfast", blurb: "Served in the café." },
  { id: "cakes", label: "Cakes & sweet", blurb: "Homemade, and made to order." },
  { id: "cafe", label: "Café", blurb: "Salads and coffee." },
  { id: "platters", label: "Platters", blurb: "For sharing — order 48 hours ahead." },
];

export const menu: MenuItem[] = [
  { category: "bagels", name: "Smoked salmon & cream cheese", description: "Roni's famous homemade bagel with premium smoked salmon and cream cheese.", signature: true },
  { category: "bagels", name: "Hot salt beef", description: "Homemade hot salt beef with mustard, mayonnaise and pickles.", signature: true },
  { category: "bagels", name: "Cheddar & tomato", description: "Plain bagel with mild cheddar and tomato slices." },
  { category: "bagels", name: "Tuna mix & cucumber", description: "Tuna mix with cucumber." },

  { category: "bakery", name: "Plain bagels", description: "The classic." },
  { category: "bakery", name: "Sesame bagels", description: "Covered in sesame seeds." },
  { category: "bakery", name: "Poppy seed bagels", description: "Covered in poppy seeds." },
  { category: "bakery", name: "Homemade challah", description: "Roni's own plaited challah." },
  { category: "bakery", name: "Challah rolls", description: "Individual challah rolls." },
  { category: "bakery", name: "Biscuits & pastries", description: "Homemade, made from scratch and preservative free." },

  { category: "breakfast", name: "Full breakfast", description: "Fried eggs, beef sausage, baked beans, homemade hash brown and grilled tomato, served with homemade toasted bread." },
  { category: "breakfast", name: "Tricolore on toast", description: "Avocado, poached eggs and tomato on toasted sourdough." },
  { category: "breakfast", name: "Porridge", description: "Oats with honey, banana and cinnamon." },
  { category: "breakfast", name: "Granola", description: "Greek yoghurt, fresh fruit and honey." },
  { category: "breakfast", name: "Fruit bowl", description: "Fresh fruit." },

  { category: "cakes", name: "Carrot cake", description: "A Roni's favourite." },
  { category: "cakes", name: "Bespoke celebration cakes", description: "Made to order for any occasion and collected in store." },

  { category: "cafe", name: "Salads", description: "Fresh salads from the café." },
  { category: "cafe", name: "Coffee", description: "Freshly made coffee." },

  { category: "platters", name: "Mini bagel platter", description: "25 mini bagels: smoked salmon & cream cheese, tuna mix & cucumber, and cheddar cheese & tomato.", price: "£55", signature: true },
  { category: "platters", name: "Chicken fingers & chips platter", description: "Breaded chicken breast fingers and chips." },
  { category: "platters", name: "Fish nuggets & chips platter", description: "Breaded white fish nuggets and chips." },
  { category: "platters", name: "Vegetable bites platter", description: "Broccoli, green beans and cauliflower nugget bites in a sweet chilli & garlic sauce." },
  { category: "platters", name: "Mini desserts", description: "A selection of signature mini desserts." },
];

/* ---------------------------------------------------------------------------
 * STORY — wording from Roni's official home page.
 * ------------------------------------------------------------------------- */
export const story = {
  intro:
    "Roni's Bagel Bakery was opened by Roni Avital in 1989 in West Hampstead, specialising in authentic bagels and Jewish baked goods with an artisan style.",
  reputation:
    "It quickly became well established for quality fresh goods, and got the reputation of the best bagel bakery selling bagels and cakes around the UK.",
  timeline: [
    { year: "1989", title: "West End Lane", text: "Roni Avital opens the first Roni's Bagel Bakery in West Hampstead." },
    { year: "2011", title: "Belsize Village", text: "Roni and Alon open the new Roni's Bagel Bakery and Café, with fresh hot bagels, breads, pastries, cakes, breakfasts, salads and coffee." },
    { year: "2013", title: "Hampstead", text: "The Hampstead branch opens on Rosslyn Hill." },
    { year: "Today", title: "Six bakeries", text: "West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross." },
  ],
};
