const kurczakImg = "/images/produkty/kurczak.svg";
const wołoweImg = "/images/produkty/mięso_wołowe.svg";
const wieprzoweImg = "/images/produkty/mięso_wieprzowe.svg";
const mydłoImg = "/images/produkty/mydło.svg";
const szamponImg = "/images/produkty/szampon.svg";

export interface PopularProductIconItem {
  src: string;
  alt: string;
  category: string; // Podkategoria (np. pieczywo, nabiał, warzywa)
}

export const JEDZENIE: PopularProductIconItem[] = [
  // PIECZYWO
  {
    src: "https://img.icons8.com/office/40/000000/bread.png",
    alt: "chleb",
    category: "pieczywo",
  },
  {
    src: "https://img.icons8.com/fluency/48/toast.png",
    alt: "chleb tostowy",
    category: "pieczywo",
  },
  {
    src: "https://img.icons8.com/emoji/48/000000/bagel-emoji.png",
    alt: "bułki",
    category: "pieczywo",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/wrap.png",
    alt: "tortilla",
    category: "pieczywo",
  },
  {
    src: "https://img.icons8.com/?size=100&id=38078&format=png&color=000000",
    alt: "rogalik",
    category: "pieczywo",
  },
  {
    src: "https://img.icons8.com/?size=100&id=35782&format=png&color=000000",
    alt: "donat",
    category: "pieczywo",
  },
  // NABIAŁ
  {
    src: "https://img.icons8.com/officel/40/000000/butter.png",
    alt: "masło",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/office/40/000000/baby-bottle.png",
    alt: "mleko dla dziecka",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/office/40/000000/milk.png",
    alt: "mleko",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/ultraviolet/40/000000/yogurt.png",
    alt: "jogurt",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/office/40/000000/cheese.png",
    alt: "ser",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/carbon-copy/100/000000/mozzarella.png",
    alt: "twaróg",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/fluency/48/eggs.png",
    alt: "jajka",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/?size=100&id=X5CsT93JpR2V&format=png&color=000000",
    alt: "skyr",
    category: "nabiał",
  },
  {
    src: "https://img.icons8.com/?size=100&id=im67f42onMsc&format=png&color=000000",
    alt: "serek wiejski",
    category: "nabiał",
  },
  // OWOCE
  {
    src: "https://img.icons8.com/office/40/000000/apple.png",
    alt: "jabłka",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/?size=100&id=69967&format=png&color=000000",
    alt: "gruszki",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/fluency/48/watermelon.png",
    alt: "arbuz",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/color/48/pineapple.png",
    alt: "ananas",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/external-vitaliy-gorbachev-lineal-color-vitaly-gorbachev/60/000000/external-banana-jungle-vitaliy-gorbachev-lineal-color-vitaly-gorbachev.png",
    alt: "banany",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/external-tulpahn-outline-color-tulpahn/64/000000/external-grapes-autumn-tulpahn-outline-color-tulpahn.png",
    alt: "winogrona",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/external-vitaliy-gorbachev-lineal-color-vitaly-gorbachev/60/000000/external-lemon-fruit-vitaliy-gorbachev-lineal-color-vitaly-gorbachev-1.png",
    alt: "cytryna",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/fluency/48/lime.png",
    alt: "limonka",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/orange.png",
    alt: "pomarańcze",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/color/48/000000/strawberry.png",
    alt: "truskawki",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/color/48/000000/blueberry.png",
    alt: "borówki",
    category: "owoce",
  },
  {
    src: "https://img.icons8.com/?size=100&id=6Eewnl6DvNdF&format=png&color=000000",
    alt: "maliny",
    category: "owoce",
  },
  // WARZYWA
  {
    src: "https://img.icons8.com/office/40/000000/potato.png",
    alt: "ziemniaki",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/office/40/000000/tomato.png",
    alt: "pomidory",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/emoji/48/000000/cucumber-emoji.png",
    alt: "ogórki",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/paprika.png",
    alt: "papryka",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/color/48/000000/onion.png",
    alt: "cebula",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/garlic.png",
    alt: "czosnek",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/color/48/000000/lettuce.png",
    alt: "salata",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/broccoli.png",
    alt: "brokuł",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/cabbage.png",
    alt: "kapusta",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/carrot.png",
    alt: "marchewka",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/?size=100&id=7-N0xVLYugP1&format=png&color=000000",
    alt: "dynia",
    category: "warzywa",
  },
  {
    src: "https://img.icons8.com/?size=100&id=4z2OqpzSeiFc&format=png&color=000000",
    alt: "pieczarki",
    category: "warzywa",
  },
  // MIĘSO
  {
    src: "https://img.icons8.com/cotton/64/000000/ham.png",
    alt: "szynka",
    category: "mięso",
  },
  {
    src: "https://img.icons8.com/?size=100&id=OUwl48cizKNG&format=png&color=000000",
    alt: "salami",
    category: "mięso",
  },
  {
    src: "https://img.icons8.com/?size=100&id=NeAZ8r40Ne1g&format=png&color=000000",
    alt: "boczek",
    category: "mięso",
  },
  {
    src: "https://img.icons8.com/?size=100&id=71983&format=png&color=000000",
    alt: "kiełbaski",
    category: "mięso",
  },
  {
    src: "https://img.icons8.com/office/40/000000/sausages.png",
    alt: "parówki",
    category: "mięso",
  },
  {
    src: "https://img.icons8.com/fluency/48/000000/sausages.png",
    alt: "kabanosy",
    category: "mięso",
  },
  {
    src: kurczakImg,
    alt: "kurczak",
    category: "mięso",
  },
  {
    src: wieprzoweImg,
    alt: "wieprzowina",
    category: "mięso",
  },
  {
    src: wołoweImg,
    alt: "wołowina",
    category: "mięso",
  },
  // PRZEKĄSKI
  {
    src: "https://img.icons8.com/emoji/48/000000/chocolate-bar-emoji.png",
    alt: "czekolada",
    category: "przekąski",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/cookies.png",
    alt: "ciastka",
    category: "przekąski",
  },
  {
    src: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-potato-chips-brewery-flaticons-lineal-color-flat-icons.png",
    alt: "chipsy",
    category: "przekąski",
  },
  {
    src: "https://img.icons8.com/?size=100&id=97192&format=png&color=000000",
    alt: "popcorn",
    category: "przekąski",
  },
  {
    src: "https://img.icons8.com/?size=100&id=31719&format=png&color=000000",
    alt: "orzeszki",
    category: "przekąski",
  },

  {
    src: "https://img.icons8.com/officel/40/000000/ice-cream-cone.png",
    alt: "lody",
    category: "przekąski",
  },

  // NAPOJE
  {
    src: "https://img.icons8.com/?size=100&id=34650&format=png&color=000000",
    alt: "woda",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-tea-morning-flaticons-lineal-color-flat-icons.png",
    alt: "herbata",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-coffee-street-food-flaticons-lineal-color-flat-icons.png",
    alt: "kawa",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-nawicon-outline-color-nawicon/64/000000/external-juice-grocery-nawicon-outline-color-nawicon.png",
    alt: "sok",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-filled-line-gradient-andi-nur-abdillah/64/000000/external-soda-drink-and-beverage-filled-line-gradient-filled-line-gradient-andi-nur-abdillah-2.png",
    alt: "cola",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/office/40/000000/beer.png",
    alt: "piwo",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-victoruler-linear-colour-victoruler/64/000000/external-wine-christmas-victoruler-linear-colour-victoruler.png",
    alt: "wino",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/external-justicon-lineal-color-justicon/64/000000/external-vodka-russia-justicon-lineal-color-justicon.png",
    alt: "wódka",
    category: "napoje",
  },
  {
    src: "https://img.icons8.com/emoji/48/tumbler-g.png",
    alt: "whisky",
    category: "napoje",
  },
  // INNE
  {
    src: "https://img.icons8.com/office/40/000000/ketchup.png",
    alt: "ketchup",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/mustard.png",
    alt: "musztarda",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/mayonnaise.png",
    alt: "majonez",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/color/48/jam.png",
    alt: "dżem",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/color/48/cereal.png",
    alt: "płatki",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/emoji/48/000000/canned-food-emoji.png",
    alt: "pasta pomidorowa",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/color/48/000000/french-fries.png",
    alt: "frytki",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/whole-fish.png",
    alt: "ryba",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/office/40/000000/rice-bowl.png",
    alt: "ryż",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/?size=100&id=W9W7CXi8fFRE&format=png&color=000000",
    alt: "warzywa na patelnie",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/office/40/000000/spaghetti.png",
    alt: "makaron",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/color/48/000000/flour-in-paper-packaging.png",
    alt: "mąka",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/color/48/000000/sunflower-oil.png",
    alt: "olej",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/spoon-of-sugar.png",
    alt: "cukier",
    category: "inne",
  },
  {
    src: "https://img.icons8.com/fluency/48/almond-butter.png",
    alt: "masło orzechowe",
    category: "inne",
  },
];

export const CHEMIA: PopularProductIconItem[] = [
  {
    src: "https://img.icons8.com/office/40/000000/toilet-paper.png",
    alt: "papier toaletowy",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/plasticine/100/000000/deodorant-spray.png",
    alt: "deodorant",
    category: "higiena",
  },
  {
    src: mydłoImg,
    alt: "mydło",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/toothpaste.png",
    alt: "pasta do zębów",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-cleaning-hygiene-flaticons-lineal-color-flat-icons-3.png",
    alt: "patyczki do uszu",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/officel/40/000000/nappy.png",
    alt: "pieluchy",
    category: "higiena",
  },
  {
    src: szamponImg,
    alt: "szampon",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/external-vitaliy-gorbachev-lineal-color-vitaly-gorbachev/60/000000/external-wet-wipes-hygiene-vitaliy-gorbachev-lineal-color-vitaly-gorbachev.png",
    alt: "chusteczki",
    category: "higiena",
  },
  {
    src: "https://img.icons8.com/emoji/48/000000/lotion-bottle.png",
    alt: "płyn do naczyń",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/external-obvious-flat-kerismaker/48/000000/external-cleaning-laundry-flat-obvious-flat-kerismaker-18.png",
    alt: "płyn do płukania",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/external-obvious-flat-kerismaker/48/000000/external-cleaning-laundry-flat-obvious-flat-kerismaker-5.png",
    alt: "proszek do prania",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/external-obvious-flat-kerismaker/48/000000/external-cleaning-laundry-flat-obvious-flat-kerismaker-15.png",
    alt: "domestos",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-glass-cleaning-cleaning-flaticons-lineal-color-flat-icons-3.png",
    alt: "płyn do szyb",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/color/48/000000/cleaning-a-surface.png",
    alt: "ściereczki do kurzu",
    category: "sprzątanie",
  },
  {
    src: "https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/000000/external-trash-hygiene-kiranshastry-lineal-color-kiranshastry.png",
    alt: "worki na śmieci",
    category: "sprzątanie",
  },
];
