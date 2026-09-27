import Heritage from "../components/home/Heritage";
import Hero from "../components/home/Hero";
import HungryCta from "../components/home/HungryCta";
import MenuIndex from "../components/home/MenuIndex";
import ShopsIndex from "../components/home/ShopsIndex";
import Signature from "../components/home/Signature";
import { useSeo } from "../lib/seo";

/**
 * Home: what Roni's is (hero) → why care (since 1989) → what to eat (menu) →
 * the signature bagel → where and when (visit) → how to order.
 */
export default function Home() {
  useSeo(
    "",
    "Roni's Bagel Bakery: fresh bagels and Jewish baked goods in North London since 1989. Six bakeries — West Hampstead, Belsize Village, Hampstead, Swains Lane, Muswell Hill and Brent Cross. Order online.",
  );
  return (
    <>
      <Hero />
      <Heritage />
      <MenuIndex />
      <Signature />
      <ShopsIndex />
      <HungryCta />
    </>
  );
}
