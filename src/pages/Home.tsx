import Bagels from "../components/home/Bagels";
import FoodMoment from "../components/home/FoodMoment";
import Hero from "../components/home/Hero";
import OrderBlock from "../components/home/OrderBlock";
import SeeYou from "../components/home/SeeYou";
import Story from "../components/home/Story";
import Visit from "../components/home/Visit";
import { useSeo } from "../lib/seo";

/**
 * Home: the campaign (hero) → since 1989 → the bagels → a food moment →
 * what are you having? → where to find us → see you at Roni's.
 */
export default function Home() {
  useSeo("", "Roni's Bagel Bakery: fresh bagels and Jewish baked goods in North London since 1989. Six bakeries — West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Order online.");
  return (
    <>
      <Hero />
      <Story />
      <Bagels />
      <FoodMoment />
      <OrderBlock />
      <Visit />
      <SeeYou />
    </>
  );
}
