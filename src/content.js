/*
 * ============================================================
 *  RONI'S WEBSITE CONTENT
 * ============================================================
 *  This is the ONLY file you need to edit to change the text,
 *  menu, stores, opening hours and links on the website.
 *
 *  Rules of thumb:
 *   - Keep the quotes "..." around text.
 *   - Keep the commas at the end of each line/item.
 *   - Leave a field as "" (empty) to hide it on the site.
 *   - Photos: put image files in the /public/images folder and
 *     write the path like "/images/salmon-bagel.jpg".
 *
 *  Anything marked  TODO  still needs checking by Roni's.
 * ============================================================
 */

export const business = {
  name: "Roni's",
  fullName: "Roni's Bagel Bakery",
  tagline: "Boiled, baked & loved in North London since 1989.",
  intro:
    "Fresh hot bagels, homemade challah, cakes, pastries, breakfasts and good coffee — made every day and served across six neighbourhood stores.",
  email: "", // TODO: add the main contact email, e.g. "hello@ronisonline.co.uk"
  onlineOrderUrl: "https://www.ronisonline.co.uk/online-ordering",
  instagram: "https://www.instagram.com/ronisbb/",
  facebook: "https://www.facebook.com/Ronisbakery/",
};

// Short phrases that scroll across the page
export const marquee = [
  "Boiled & baked bagels",
  "Homemade challah",
  "Salt beef on rye",
  "Cakes for any occasion",
  "Platters & catering",
  "Fresh every morning",
];

export const story = {
  heading: "A North London bagel institution",
  paragraphs: [
    "Roni's first opened its doors on West End Lane, West Hampstead in 1989. Since then it has become known for quality fresh goods and a reputation as one of the best bagel bakeries in the UK.",
    "Our bagels are boiled then baked for that proper chewy crust and soft middle. We make our own challah, bake cakes in-house and fill everything generously — from classic smoked salmon & cream cheese to hot salt beef with mustard and pickles.",
  ],
  stats: [
    { value: "1989", label: "Baking since" },
    { value: "6", label: "London stores" },
    { value: "Daily", label: "Fresh bakes" },
  ],
};

/*
 * MENU
 *  Each category has a list of items.
 *  price: "" hides the price.  e.g. price: "£6.50"
 *  tags: small labels like "Bestseller", "V" (vegetarian), "VG" (vegan)
 *  image: optional photo path, e.g. "/images/salt-beef.jpg"
 */
export const menu = [
  {
    category: "Bagels",
    items: [
      { name: "Smoked Salmon & Cream Cheese", description: "Our famous homemade bagel with premium smoked salmon and cream cheese.", price: "", tags: ["Bestseller"], image: "" },
      { name: "Hot Salt Beef", description: "Homemade hot salt beef with mustard, mayonnaise and pickles.", price: "", tags: ["Bestseller"], image: "" },
      { name: "Cream Cheese", description: "Simple, classic and generous.", price: "", tags: ["V"], image: "" },
    ],
  },
  {
    category: "Bakery",
    items: [
      { name: "Plain Bagel", description: "Boiled then baked, the way it should be.", price: "", tags: ["VG"], image: "" },
      { name: "Sesame Bagel", description: "Toasted sesame all over.", price: "", tags: ["VG"], image: "" },
      { name: "Poppy Seed Bagel", description: "A classic for a reason.", price: "", tags: ["VG"], image: "" },
      { name: "Homemade Challah", description: "Soft, golden, plaited by hand.", price: "", tags: ["V"], image: "" },
      { name: "Challah Rolls", description: "Perfect for Shabbat tables and platters.", price: "", tags: ["V"], image: "" },
    ],
  },
  {
    category: "Cakes & Sweet",
    items: [
      { name: "Carrot Cake", description: "Moist, spiced and topped with cream cheese frosting.", price: "", tags: ["V"], image: "" },
      { name: "Pastries", description: "A daily selection of fresh-baked pastries.", price: "", tags: ["V"], image: "" },
      { name: "Celebration Cakes", description: "Made to order — see Occasions below.", price: "", tags: [], image: "" },
    ],
  },
  {
    category: "Breakfast & Café",
    items: [
      { name: "Breakfasts", description: "Unique breakfasts served fresh every morning.", price: "", tags: [], image: "" },
      { name: "Salads", description: "Fresh, seasonal salads made daily.", price: "", tags: ["V"], image: "" },
      { name: "Coffee", description: "Delicious coffee to go with your bagel.", price: "", tags: [], image: "" },
    ],
  },
];

/*
 * OCCASIONS  (cakes, platters, catering)
 */
export const occasions = {
  heading: "Order for any occasion",
  intro:
    "Birthdays, brit milahs, bar & bat mitzvahs, shivas, office breakfasts — we make custom cakes and platters to feed a crowd.",
  items: [
    { title: "Bagel Platters", description: "Mini or full-size bagels with a selection of fillings, beautifully presented." },
    { title: "Custom Cakes", description: "Celebration cakes baked to order, decorated your way." },
    { title: "Breakfast & Office", description: "Bagels, pastries and coffee for meetings and events." },
  ],
  ctaLabel: "Enquire about an order",
  // Where the enquiry button goes. Use "mailto:you@example.com" or a page URL.
  ctaUrl: "https://www.ronisonline.co.uk/order-for-any-occasion",
};

/*
 * STORES
 *  hours: list of { days, time } lines.
 *  Leave address/phone "" if unknown — the map button will still work.
 */
export const stores = [
  {
    name: "West Hampstead",
    since: "The original, since 1989",
    address: "250 West End Lane, London NW6 1LG",
    phone: "020 7794 6663",
    hours: [{ days: "Mon – Sun", time: "7am – Midnight" }], // TODO: confirm current hours
    deliveroo: "https://deliveroo.co.uk/menu/london/west-hampstead/ronis-bakery",
  },
  {
    name: "Belsize Village",
    since: "Since 2011",
    address: "37 Belsize Lane, London NW3", // TODO: add full postcode
    phone: "020 7998 1477",
    hours: [], // TODO
    deliveroo: "https://deliveroo.co.uk/menu/london/belsize-park/ronis-belsize",
  },
  {
    name: "Swains Lane",
    since: "",
    address: "2 Swain's Lane, London N6 6AG",
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Hampstead",
    since: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Muswell Hill",
    since: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Brent Cross",
    since: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
];
