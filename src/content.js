/*
 * ============================================================
 *  RONI'S WEBSITE CONTENT
 * ============================================================
 *  This is the ONLY file you need to edit to change the words,
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
  established: "1989",
  intro:
    "Boiled then baked, every single day. Fresh hot bagels, homemade challah, cakes, breakfasts and a proper cup of coffee — across six North London shops.",
  email: "", // TODO: add the main contact email, e.g. "hello@ronisonline.co.uk"
  onlineOrderUrl: "https://www.ronisonline.co.uk/online-ordering",
  instagram: "https://www.instagram.com/ronisbb/",
  facebook: "https://www.facebook.com/Ronisbakery/",
};

/*
 * LIVE MESSAGE  (the red strip at the very top of the page)
 *  Shown depending on the time in London. Times are 24-hour.
 */
export const liveMessages = [
  { from: "05:00", to: "11:00", text: "Breakfast o'clock. Bagel and a coffee?" },
  { from: "11:00", to: "15:00", text: "Lunchtime — the hot salt beef is calling." },
  { from: "15:00", to: "18:00", text: "Afternoon slump? A slice of carrot cake fixes that." },
  { from: "18:00", to: "24:00", text: "Grab a bag of bagels for tomorrow's breakfast." },
  { from: "00:00", to: "05:00", text: "Up late? Tomorrow's bagels will be out of the oven soon." },
];
// Shown instead on Fridays (all day). Set to "" to switch off.
export const fridayMessage = "It's Friday — don't forget your challah for Shabbat.";

/*
 * MENU
 *  price: "" hides the price.        e.g. price: "£6.50"
 *  tags:  small stickers, e.g. "Bestseller", "V" (vegetarian), "VG" (vegan)
 *  note:  a handwritten scribble next to the item ("" for none)
 */
export const menu = [
  {
    category: "Filled bagels",
    items: [
      { name: "Smoked salmon & cream cheese", description: "Our famous homemade bagel, premium smoked salmon, lots of cream cheese.", price: "", tags: ["Bestseller"], note: "the classic" },
      { name: "Hot salt beef", description: "Homemade hot salt beef with mustard, mayonnaise and pickles.", price: "", tags: ["Bestseller"], note: "" },
      { name: "Cream cheese", description: "Simple, classic and generous.", price: "", tags: ["V"], note: "" },
    ],
  },
  {
    category: "From the bakery",
    items: [
      { name: "Plain bagel", description: "Boiled then baked — chewy crust, soft middle.", price: "", tags: [], note: "" },
      { name: "Sesame bagel", description: "Toasted sesame all over.", price: "", tags: [], note: "" },
      { name: "Poppy seed bagel", description: "A classic for a reason.", price: "", tags: [], note: "" },
      { name: "Homemade challah", description: "Soft, golden, plaited by hand.", price: "", tags: ["V"], note: "Fridays!" },
      { name: "Challah rolls", description: "For Shabbat tables and platters.", price: "", tags: ["V"], note: "" },
    ],
  },
  {
    category: "Cakes & sweet things",
    items: [
      { name: "Carrot cake", description: "Moist, spiced, cream cheese frosting.", price: "", tags: ["V"], note: "" },
      { name: "Pastries", description: "A daily selection, fresh from the oven.", price: "", tags: ["V"], note: "" },
      { name: "Celebration cakes", description: "Made to order — see below.", price: "", tags: [], note: "" },
    ],
  },
  {
    category: "Café",
    items: [
      { name: "Breakfasts", description: "Served fresh every morning.", price: "", tags: [], note: "" },
      { name: "Salads", description: "Fresh and made daily.", price: "", tags: ["V"], note: "" },
      { name: "Coffee", description: "The other half of a good bagel.", price: "", tags: [], note: "" },
    ],
  },
];

/*
 * OCCASIONS  (cakes, platters, catering) — shown as a till receipt
 */
export const occasions = {
  heading: "Feeding a crowd?",
  intro:
    "Birthdays, brit milahs, bar & bat mitzvahs, shivas, office breakfasts — we make custom cakes and platters for any occasion.",
  items: ["Bagel platters", "Custom celebration cakes", "Challah & rolls", "Office breakfasts"],
  ctaLabel: "Enquire about an order",
  // Where the enquiry button goes. Use "mailto:you@example.com" or a page URL.
  ctaUrl: "https://www.ronisonline.co.uk/order-for-any-occasion",
};

/*
 * STORES
 *  hours: one line per set of days. Use 24-hour times.
 *    days examples: "Mon-Sun", "Mon-Fri", "Sat", "Sun", "Mon-Thu, Sun"
 *    close "24:00" means midnight.
 *  The site uses these to show "Open now" / "Closed" live.
 *  Leave hours: [] if unknown — the status is just hidden.
 */
export const stores = [
  {
    name: "West Hampstead",
    note: "the original, since 1989",
    address: "250 West End Lane, London NW6 1LG",
    phone: "020 7794 6663",
    hours: [{ days: "Mon-Sun", open: "07:00", close: "24:00" }], // TODO: confirm current hours
    deliveroo: "https://deliveroo.co.uk/menu/london/west-hampstead/ronis-bakery",
  },
  {
    name: "Belsize Village",
    note: "since 2011",
    address: "37 Belsize Lane, London NW3", // TODO: add full postcode
    phone: "020 7998 1477",
    hours: [], // TODO
    deliveroo: "https://deliveroo.co.uk/menu/london/belsize-park/ronis-belsize",
  },
  {
    name: "Swains Lane",
    note: "",
    address: "2 Swain's Lane, London N6 6AG",
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Hampstead",
    note: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Muswell Hill",
    note: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
  {
    name: "Brent Cross",
    note: "",
    address: "", // TODO
    phone: "", // TODO
    hours: [], // TODO
    deliveroo: "",
  },
];

export const story = {
  // The big sentence. The part inside [square brackets] gets a hand-drawn circle.
  headline: "Since [1989], we've been boiling and baking bagels on West End Lane.",
  paragraphs: [
    "What started as one little bakery in West Hampstead became a North London institution — known for quality fresh goods and, people tell us, some of the best bagels in the UK.",
    "We still do it the proper way: boiled, then baked, for that chewy crust and soft middle. Challah plaited by hand, cakes baked in-house, fillings piled high.",
  ],
};
