import { chartFigures, StoryDataChart } from "@/components/StoryDataChart";
import { StoryFaq } from "@/components/StoryFaq";
import SchoolsFeature from "@/components/schools/SchoolsFeature";
import Link from "next/link";
import { GameEventTable } from "@/components/GameEventTable";
import { upcomingGameEvents } from "@/lib/events";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import {
  publication,
  PUBLISHED,
  STORY_FIELDS,
  storyLabel,
  storyAuthor,
  imageUrl,
  safeUrl,
  type Story,
} from "@/lib/publication";
import "@/styles/story-guide.css";
import { StoryCallout } from "@/components/StoryCallout";
import { StoryByline } from "@/components/StoryByline";
import { StoryImage } from "@/components/Publication";
import { cache } from "react";
import { tacoGuideSchema, type GuideRestaurant } from "@/lib/taco-guide-schema";
export const revalidate = 60;
const getStory = cache((slug: string) =>
  process.env.VERCEL_ENV === "preview" && slug === "street-tacos-in-gwinnett-according-to-locals" ? Promise.resolve({"_id":"atg-street-tacos-gwinnett","author":{"name":"Michael Yang","slug":"michael-yang"},"body":[{"_key":"v1","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Everyone says Buford Highway has the best tacos in Georgia. I think Gwinnett has something to say about that."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v2","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"For street tacos closer to home, Gwinnett diners have some pretty specific favorites. In Duluth, it’s the pork belly taco at Armando’s. In Buford, El Taco Jalisco draws people to South Lee Street for asada and pastor. And in Lawrenceville, a butcher shop doubles as a lunch counter. All Things Gwinnett member Carlos Montoya could plan a day around these places."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"q3","_type":"image","alt":"Carlos Montoya: So hard to choose! La Perla for lunch, Talpa for the carnecería and Don Pedro for Dinner! 🤤🤤","asset":{"_ref":"image-192cdb7ccb273f205d984dbd6e80a007ca41214f-1220x220-png","_type":"reference"},"imageUrl":"https://cdn.sanity.io/images/xnm5c645/production/192cdb7ccb273f205d984dbd6e80a007ca41214f-1220x220.png","markDefs":null},{"_key":"commentlink0","_type":"block","children":[{"_key":"s","_type":"span","marks":["link"],"text":"Read Carlos Montoya’s original comment"}],"imageUrl":null,"markDefs":[{"_key":"link","_type":"link","href":"https://facebook.com/groups/allthingsgwinnett/permalink/974936012172062/?comment_id=975001742165489","internalSlug":null}],"style":"normal"},{"_key":"takeaways","_type":"tldr","heading":"TL;DR","imageUrl":null,"markDefs":null,"points":["For tacos at a butcher shop, try La Perla in Lawrenceville. In Norcross, residents recommend the taquería inside Super Mercado Jalisco on Beaver Ruin Road.","In Duluth, readers singled out Armando’s pork belly taco and explained exactly how they order at TJ Street Tacos. For birria with consomé, look at El Indio in Lawrenceville.","Eight stops have a street address and phone below. The ninth is a reader’s tip about a Shell station. Its operator and schedule are still unconfirmed."]},{"_key":"v5","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"1. La Perla, Lawrenceville | Lunch at the butcher shop"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b4","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"316 Grayson Hwy, Lawrenceville, GA 30046 · 770-962-0332"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v9","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.3/5 (385 reviews)"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★☆ 4.2/5 (42 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://yably.com/reviews/lawrenceville/carniceria-la-perla-316-grayson-hwy-5a","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.giftly.com/gift-card/carniceria-la-perla-lawrenceville","internalSlug":null},{"_key":"l2","_type":"link","href":"https://order.toasttab.com/online/carniceria-la-perla","internalSlug":null}],"style":"normal"},{"_key":"b5","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"},{"_key":"s2","_type":"span","marks":["l2"],"text":"   ⓕ"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/la-perla-lawrenceville","internalSlug":null},{"_key":"l1","_type":"link","href":"https://laperlataqueria.com","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.facebook.com/100064153982671","internalSlug":null}],"style":"normal"},{"_key":"v6","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"At La Perla on Grayson Highway, the butcher counter supplies the meat for the kitchen. You can stop for a taco lunch and pick up a cut to grill for dinner in the same visit. It was Carlos Montoya’s lunch pick and Ryan Nolan’s answer to where to get street tacos in Lawrenceville."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"q7","_type":"image","alt":"Ryan Nolan: I'm a street taco snob dude. Go to La Perla on Grayson highway. You're welcome","asset":{"_ref":"image-b1395e09ffd36bc7428fe530f70b06659dd4bf24-670x280-png","_type":"reference"},"imageUrl":"https://cdn.sanity.io/images/xnm5c645/production/b1395e09ffd36bc7428fe530f70b06659dd4bf24-670x280.png","markDefs":null},{"_key":"commentlink1","_type":"block","children":[{"_key":"s","_type":"span","marks":["link"],"text":"Read Ryan Nolan’s original comment"}],"imageUrl":null,"markDefs":[{"_key":"link","_type":"link","href":"https://facebook.com/groups/allthingsgwinnett/permalink/974936012172062/?comment_id=974940742171589","internalSlug":null}],"style":"normal"},{"_key":"v8","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"The prepared-food menu also includes tortas, bowls of caldo and burritos. One delivery customer singled out the chorizo burrito as a repeat order."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v10","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"2. Don Pedro, Lilburn | Asada, pastor and a proper dinner plate"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b8","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"4085 Lawrenceville Hwy, Lilburn, GA 30047 · 770-925-9995"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v13","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.2/5 (1,450 reviews)"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★☆☆ 3.3/5 (69 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/Don-Pedro-Lilburn","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.giftly.com/gift-card/don-pedro-mexican-food-lilburn","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.ubereats.com/store/don-pedro-mexican-restaurant-lilburn/zbhAmdDxUZyUZhSXUGy-ag","internalSlug":null}],"style":"normal"},{"_key":"b9","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/don-pedro-lilburn","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.donpedromexicanfood.com","internalSlug":null}],"style":"normal"},{"_key":"v11","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"For dinner, Carlos picked Don Pedro. The Lilburn restaurant on Lawrenceville Highway serves carne asada and al pastor tacos, so you can order one of each if you’re craving steak and pork."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v12","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"If you’re sitting down for dinner, the menu also has chilaquiles with steak and a steak-and-shrimp plate. For something to take home, there are tortas and quesadillas."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v14","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"3. Armando’s, Duluth | The pork belly order"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b12","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"4190 Abbotts Bridge Rd, Duluth, GA 30097 · 470-403-4738"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v18","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.4/5 (601 reviews)"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★☆ 4.0/5 (91 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/Armandos-Taqueria-Duluth","internalSlug":null},{"_key":"l1","_type":"link","href":"https://overlookmaps.com/places/armandos-taqueria-duluth-6319468559096185","internalSlug":null},{"_key":"l2","_type":"link","href":"https://armandostaqueria.com/duluth-armando-s-taqueria-food-menu","internalSlug":null}],"style":"normal"},{"_key":"b13","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/armandos-taqueria-duluth","internalSlug":null},{"_key":"l1","_type":"link","href":"https://armandostaqueria.com","internalSlug":null}],"style":"normal"},{"_key":"v15","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Armando’s serves tacos with a choice of 12 meats at the corner of Abbotts Bridge Road and Peachtree Industrial Boulevard. The pork belly taco earned a particularly direct endorsement from Patti Gibbons Davis."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"q16","_type":"image","alt":"Patti Gibbons Davis: Armandos Taqueria at the corner of Peachtree Industrial Blvd and Abbots Bridge. Get the pork belly taco. Ahmazing","asset":{"_ref":"image-f577239ea26908f4043d58ff4be649812a6adf44-1350x220-png","_type":"reference"},"imageUrl":"https://cdn.sanity.io/images/xnm5c645/production/f577239ea26908f4043d58ff4be649812a6adf44-1350x220.png","markDefs":null},{"_key":"commentlink2","_type":"block","children":[{"_key":"s","_type":"span","marks":["link"],"text":"Read Patti Gibbons Davis’s original comment"}],"imageUrl":null,"markDefs":[{"_key":"link","_type":"link","href":"https://facebook.com/groups/allthingsgwinnett/permalink/974936012172062/?comment_id=975440578788272","internalSlug":null}],"style":"normal"},{"_key":"v17","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"For a two-taco order, pair the pork belly with lengua. A Google reviewer liked the texture of the beef tongue here. Armando’s also has a drive-through, a detail one Duluth-area diner singled out on r/Gwinnett."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v19","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"4. TJ Street Tacos, Duluth | Ask for the guac on the side"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b16","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"3230 Steve Reynolds Blvd, Ste 108, Duluth, GA 30096 · 678-395-6614"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v22","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.1/5"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★☆ 3.6/5 (31 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/TJ-STREET-TACOS-Duluth","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.giftly.com/gift-card/tj-street-tacos-duluth","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.ubereats.com/store/tj-street-tacos/ItBJE5-xXLWq6tmUn-iacQ","internalSlug":null}],"style":"normal"},{"_key":"b17","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"},{"_key":"s2","_type":"span","marks":["l2"],"text":"   ⓕ"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/tj-street-tacos-duluth","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.tjstreettacoduluth.com","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.facebook.com/479942488536144","internalSlug":null}],"style":"normal"},{"_key":"v20","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Grilled steak and spicy adobada pork are two of the choices at TJ on Steve Reynolds Boulevard. Edgar Chávez named it as his Duluth pick. Margie Rojas shared how she orders the tacos here: hold the tomato sauce and put the guacamole on the side."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v21","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"That same carne asada is available over nachos, folded into a quesadilla or wrapped in a burrito. There’s also a birria torta for anyone who prefers a sandwich."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v23","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"5. Super Mercado Jalisco, Norcross | Tacos inside the neighborhood market"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b20","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"2175 Beaver Ruin Rd NW, Ste 100, Norcross, GA 30071 · 770-449-7467 (supermarket)"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v26","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.1/5 (449 reviews) · supermarket"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp reviews of the market"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/Super-Carniceria-Jalisco-Taqueria-Norcross","internalSlug":null},{"_key":"l1","_type":"link","href":"https://maps.roadtrippers.com/us/lawrenceville-ga/shopping/jalisco-supermarket-lawrenceville","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.smjtacos.com/","internalSlug":null}],"style":"normal"},{"_key":"b21","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/super-mercado-jalisco-taqueria-norcross","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.smjtacos.com","internalSlug":null}],"style":"normal"},{"_key":"v24","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"The taquería at Super Mercado Jalisco is inside the grocery store on Beaver Ruin Road. Adrian Acosta recommended this counter for tacos and said the meat comes fresh from the market. Look for the little restaurant once you’re inside."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v25","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"You can order tacos there or get the filling on bread. A Yelp reviewer who ate at this counter recommended the pastor torta. The kitchen also serves burritos and quesadillas."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v27","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"6. El Taco Jalisco, Buford | Asada and pastor on South Lee"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b24","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"4545 S Lee St, Ste A, Buford, GA 30518 · 678-482-4685"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v31","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★★ 4.6/5 (1,634 reviews)"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★★ 4.5/5 (281 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/Taco-Jalisco-Buford-2","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.giftly.com/gift-card/el-taco-jalisco-buford-2","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.restaurantji.com/ga/buford/el-taco-jalisco-/","internalSlug":null}],"style":"normal"},{"_key":"b25","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   ⓕ"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/el-taco-jalisco-buford","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.facebook.com/Jaliscoeltaco","internalSlug":null}],"style":"normal"},{"_key":"v28","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Buford has its own Jalisco on South Lee Street. Crystal Boyd recommended this taqueria, where diners single out both the carne asada and the al pastor. For someone who wants one steak taco and one pork taco, this is a good address to save."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"q29","_type":"image","alt":"Kim Mootoo: Taco Jalisco in Buford is as real as you get. We also like Alebrije on Old Peachtree and Satellite Blvd.","asset":{"_ref":"image-47ee88aeebcc25ff23917b740e0efe67fe371664-1380x220-png","_type":"reference"},"imageUrl":"https://cdn.sanity.io/images/xnm5c645/production/47ee88aeebcc25ff23917b740e0efe67fe371664-1380x220.png","markDefs":null},{"_key":"commentlink3","_type":"block","children":[{"_key":"s","_type":"span","marks":["link"],"text":"Read Kim Mootoo’s original comment"}],"imageUrl":null,"markDefs":[{"_key":"link","_type":"link","href":"https://facebook.com/groups/allthingsgwinnett/permalink/974936012172062/?comment_id=974942955504701","internalSlug":null}],"style":"normal"},{"_key":"v30","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"The tortas and steak burritos also show up in customer recommendations, along with horchata to drink. The South Lee location had more than 1,600 Google reviews in the snapshot linked above."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v32","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"7. El Guero Mexican Grill, Lilburn | Carnitas at Five Forks"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b28","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"4045 Five Forks Trickum Rd SW, Lilburn, GA 30047 · 770-676-5985"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v36","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★★ 4.6/5"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★☆ 4.1/5"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/El-Guero-Mexican-Grill-Lilburn","internalSlug":null},{"_key":"l1","_type":"link","href":"https://famousmexicanrestaurants.com/es/restaurante/el-guero-mexican-grill","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.seamless.com/menu/el-guero-mexican-grill-4045-five-forks-trickum-rd-sw-lilburn/8134456","internalSlug":null}],"style":"normal"},{"_key":"b29","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   ⓕ"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/el-guero-mexican-grill-lilburn","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.facebook.com/elgueromexgrill/","internalSlug":null}],"style":"normal"},{"_key":"v33","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"El Guero is the sit-down Mexican grill in the Publix shopping center at Killian Hill and Five Forks. For tacos, Angel Hernandez recommends two pork fillings worth ordering together."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"q34","_type":"image","alt":"Angel Hernandez: El Guero in the Publix shopping center intersection of Killian Hill and Five Forks. Get the carnitas and chorizo. Only negative is they don't have barbacoa.","asset":{"_ref":"image-13f3aacca798bae0686f573e807cba921878cf38-1380x220-png","_type":"reference"},"imageUrl":"https://cdn.sanity.io/images/xnm5c645/production/13f3aacca798bae0686f573e807cba921878cf38-1380x220.png","markDefs":null},{"_key":"commentlink4","_type":"block","children":[{"_key":"s","_type":"span","marks":["link"],"text":"Read Angel Hernandez’s original comment"}],"imageUrl":null,"markDefs":[{"_key":"link","_type":"link","href":"https://facebook.com/groups/allthingsgwinnett/permalink/974936012172062/?comment_id=976429372022726","internalSlug":null}],"style":"normal"},{"_key":"v35","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"El Guero is a sit-down Mexican grill, so if you bring someone along, they’ve got choices beyond Angel’s order. One Yelp reviewer comes for the chimichanga. Other diners mention the steak tacos, margaritas and flan, and the menu includes soups and quesadillas."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v37","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"8. El Indio, Lawrenceville | Birria and something to dip"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"b32","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"439 W Pike St, Lawrenceville, GA 30046 · 470-274-7623"}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v40","_type":"block","children":[{"_key":"r0","_type":"span","marks":["l0"],"text":"Google ★★★★☆ 4.4/5 (826 reviews)"},{"_key":"gap0","_type":"span","marks":[],"text":"   "},{"_key":"r1","_type":"span","marks":["l1"],"text":"Yelp ★★★★☆ 4.1/5 (61 reviews)"},{"_key":"gap1","_type":"span","marks":[],"text":"   "},{"_key":"s2","_type":"span","marks":["l2"],"text":"Menu and dishes"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://restaurantguru.com/El-Indio-Restaurant-and-Taqueria-Lawrenceville","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.giftly.com/gift-card/el-indio-restaurant-and-taqueria-lawrenceville","internalSlug":null},{"_key":"l2","_type":"link","href":"https://www.doordash.com/store/el-indio-restaurant-taqueria-25786929/","internalSlug":null}],"style":"normal"},{"_key":"b33","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":""},{"_key":"s0","_type":"span","marks":["l0"],"text":"Go to the Directory"},{"_key":"s1","_type":"span","marks":["l1"],"text":"   🌐"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://allthingsgwinnett.com/directory/el-indio-lawrenceville","internalSlug":null},{"_key":"l1","_type":"link","href":"https://elindiorestauranttaqueriaga.com","internalSlug":null}],"style":"normal"},{"_key":"v38","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"For birria in Lawrenceville, El Indio on West Pike Street is a local favorite. Jessica Reed Berger, Annel Ceron and Nadia Johnson each recommended El Indio in the ATG group. A diner in a separate Gwinnett discussion singled out the birria quesadilla as their family’s favorite order."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v39","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"The West Pike menu offers that quesadilla with consomé for dipping. You can also get birria ramen if you’d rather have the broth with noodles."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"v41","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"9. The Shell near Indian Trail and Dickens | A taco stand locals know by the intersection"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"v42","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Eric Martinez recommended a taco stand at the Shell near Indian Trail and Dickens. ATG hasn’t confirmed the stand’s name or schedule. Check the "},{"_key":"thread","_type":"span","marks":["post"],"text":"original Facebook thread"},{"_key":"end","_type":"span","marks":[],"text":" for an update before making a trip."}],"imageUrl":null,"markDefs":[{"_key":"post","_type":"link","href":"https://www.facebook.com/groups/allthingsgwinnett/posts/974936012172062/","internalSlug":null}],"style":"normal"},{"_key":"tacoconclusion0","_type":"block","children":[{"_key":"copy","_type":"span","marks":[],"text":"Where to go for your next taco order"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"tacoconclusion1","_type":"block","children":[{"_key":"copy","_type":"span","marks":[],"text":"If your order is one asada and one al pastor, locals point to El Taco Jalisco on South Lee Street in Buford. For pork belly, they send you to Armando’s in Duluth. For carnitas and chorizo, it’s El Guero in Lilburn. That’s Gwinnett’s answer to Buford Highway: you can pick the taco you’re craving and know exactly which corner of the county to head for."}],"imageUrl":null,"markDefs":[],"style":"normal"},{"_key":"tacothreadcta","_type":"block","children":[{"_key":"ask","_type":"span","marks":[],"text":"Who makes your favorite street taco in Gwinnett? Tell us the spot, which location you visit and exactly what to order. "},{"_key":"action","_type":"span","marks":["strong","thread"],"text":"Share your taco pick in the original Facebook thread"}],"imageUrl":null,"markDefs":[{"_key":"thread","_type":"link","href":"https://www.facebook.com/groups/allthingsgwinnett/posts/974936012172062/","internalSlug":null}],"style":"normal"},{"_key":"readerfaq","_type":"faq","heading":"Frequently asked questions about street tacos in Gwinnett","imageUrl":null,"items":[{"_key":"question0","answer":[{"_key":"v44","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Buford diners mention both at El Taco Jalisco on South Lee Street. In Duluth, TJ Street Tacos lists carne asada and spicy adobada pork. Don Pedro on Lawrenceville Highway in Lilburn was another local pick."}],"markDefs":[],"style":"normal"}],"question":"Where can I get carne asada or al pastor tacos in Gwinnett?"},{"_key":"question1","answer":[{"_key":"v45","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Super Mercado Jalisco has a taquería inside its Beaver Ruin Road store in Norcross. La Perla combines a butcher shop and taquería on Grayson Highway in Lawrenceville."}],"markDefs":[],"style":"normal"}],"question":"Which Gwinnett taco spots are inside a Mexican market?"},{"_key":"question2","answer":[{"_key":"v46","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"El Indio at 439 W Pike Street serves birria dishes including a quesadilla with consomé and birria ramen. The birria quesadilla also drew a recommendation in the Gwinnett Reddit discussion."}],"markDefs":[],"style":"normal"}],"question":"Where do locals go for birria in Lawrenceville?"},{"_key":"question3","answer":[{"_key":"v47","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"They are separate businesses. El Taco Jalisco is at 4545 South Lee Street in Buford. Super Mercado Jalisco Taquería is inside the market at 2175 Beaver Ruin Road NW in Norcross."}],"markDefs":[],"style":"normal"}],"question":"Are the two Jalisco taco spots the same place?"},{"_key":"question4","answer":[{"_key":"v48","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"The Facebook post asked an open-ended question. People could name several spots, reply to each other or suggest an order. The nine entries are editorial selections from that conversation, presented without a vote ranking."}],"markDefs":[],"style":"normal"}],"question":"Did residents vote on the best tacos?"}],"markDefs":null},{"_key":"v49","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Sources and methodology"}],"imageUrl":null,"markDefs":[],"style":"h2"},{"_key":"v50","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"ATG reviewed 112 top-level comments and 93 replies collected November 27, 2026, from Michael Yang’s July 14 Facebook post. We compared recommendations with a separate Gwinnett Reddit discussion and checked branch addresses, menus and published reviews. Quotations are from the original ATG thread."},{"_key":"s0","_type":"span","marks":["l0"],"text":" · ATG Facebook discussion"},{"_key":"s1","_type":"span","marks":["l1"],"text":" · Gwinnett Reddit discussion"}],"imageUrl":null,"markDefs":[{"_key":"l0","_type":"link","href":"https://www.facebook.com/groups/allthingsgwinnett/posts/974936012172062/","internalSlug":null},{"_key":"l1","_type":"link","href":"https://www.reddit.com/r/Gwinnett/comments/1mj7ld6/what_are_good_authentic_taco_spots/","internalSlug":null}],"style":"normal"},{"_key":"v51","_type":"block","children":[{"_key":"s","_type":"span","marks":[],"text":"Review figures are out of five and were checked November 27, 2026, on the linked sites that reproduce Google or Yelp data. Their snapshots can lag the platforms. Counts appear where the source clearly associates a count with a score. The market and unnamed Shell stand have different limits, noted in their entries."}],"imageUrl":null,"markDefs":[],"style":"normal"}],"excerpt":"Pork belly tacos in Duluth, carnitas in Lilburn and al pastor in Buford. Here’s where Gwinnett locals go for street tacos and what to order when you get there.","format":"guide","guideRestaurants":[{"address":"4190 Abbotts Bridge Rd, Duluth, GA 30097","name":"Armando’s Taqueria","slug":"armandos-taqueria-duluth"},{"address":"4085 Lawrenceville Hwy, Lilburn, GA 30047","name":"Don Pedro Mexican Food","slug":"don-pedro-lilburn"},{"address":"4045 Five Forks Trickum Rd SW, Lilburn, GA 30047","name":"El Guero Mexican Grill","slug":"el-guero-mexican-grill-lilburn"},{"address":"439 W Pike St, Lawrenceville, GA 30046","name":"El Indio Restaurant & Taqueria","slug":"el-indio-lawrenceville"},{"address":"4545 S Lee St, Ste A, Buford, GA 30518","name":"El Taco Jalisco","slug":"el-taco-jalisco-buford"},{"address":"316 Grayson Hwy, Lawrenceville, GA 30046","name":"Carnicería y Taquería La Perla","slug":"la-perla-lawrenceville"},{"address":"2175 Beaver Ruin Rd NW, Ste 100, Norcross, GA 30071","name":"Super Mercado Jalisco Taquería","slug":"super-mercado-jalisco-taqueria-norcross"},{"address":"3230 Steve Reynolds Blvd, Ste 108, Duluth, GA 30096","name":"TJ Street Tacos","slug":"tj-street-tacos-duluth"}],"image":{"_type":"image","alt":"Carne asada and al pastor tacos with red and green salsa in an open foam takeout box held over a wood table.","asset":{"_ref":"image-708be6146758abe139f88b2bc79bf8afdce4a0ff-1344x752-png","_type":"reference"},"credit":"AI-generated illustration by All Things Gwinnett"},"section":null,"seo":{"description":"Where do Gwinnett locals get street tacos beyond Buford Highway? Find nine picks around the county, with reader orders, menus, ratings and directions.","ogDescription":"Pork belly tacos in Duluth, carnitas in Lilburn and al pastor in Buford. Here’s where Gwinnett locals go for street tacos and what to order when you get there.","ogImage":{"_type":"image","alt":"Carne asada and al pastor tacos with red and green salsa in an open foam takeout box held over a wood table.","asset":{"_ref":"image-708be6146758abe139f88b2bc79bf8afdce4a0ff-1344x752-png","_type":"reference"}},"ogTitle":"9 of the best street taco spots in Gwinnett, according to locals","title":"9 Gwinnett Street Taco Spots Beyond Buford Highway | ATG"},"slug":"street-tacos-in-gwinnett-according-to-locals","title":"9 of the best street taco spots in Gwinnett, according to locals"} as unknown as Story & {guideRestaurants: GuideRestaurant[]}) :
  publication.fetch<(Story & {guideRestaurants?: GuideRestaurant[]}) | null>(
    `*[${PUBLISHED} && slug.current==$slug][0]{${STORY_FIELDS},seo,_id == "atg-street-tacos-gwinnett" => {"guideRestaurants": *[_type == "business" && ("sanity:" + _id) in ^.relatedDirectoryListings]{name,address,"slug":slug.current}},body[]{...,"imageUrl":asset->url,markDefs[]{...,"internalSlug":internal->slug.current}}}`,
    { slug },
    { next: { revalidate: 60 } },
  ),
);
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const s = await getStory(params.slug);
  if (!s) return { title: "Story not found" };
  const seo = s.seo;
  const description = seo?.description || s.excerpt;
  const socialTitle = seo?.ogTitle || seo?.title || s.title;
  const socialDescription = seo?.ogDescription || description;
  const socialImage = imageUrl(seo?.ogImage, 1200, 630, "jpg");
  const image = socialImage || imageUrl(s.image, 1200, 630, "jpg");
  const images = image ? [{
    url: image,
    alt: socialImage ? seo?.ogImage?.alt : s.image?.alt,
    width: 1200,
    height: 630,
  }] : undefined;
  const path = `/stories/${encodeURIComponent(s.slug)}`;
  return {
    title: seo?.title ? { absolute: seo.title } : s.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: "All Things Gwinnett",
      title: socialTitle,
      description: socialDescription,
      url: path,
      publishedTime: s.publishedAt,
      modifiedTime: s.updatedAt,
      images,
    },
    ...(seo && { twitter: { card: "summary_large_image", title: socialTitle, description: socialDescription, images } }),
  };
}
function StorySummary({ value }: { value: { heading?: string; points?: string[] } }) {
  return (
    <aside className="story-summary" aria-label="Article summary">
      <h2>{value.heading || "TL;DR"}</h2>
      <ul>{value.points?.map(point => <li key={point}>{point}</li>)}</ul>
    </aside>
  );
}

export default async function Page({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  if (!story) notFound();
  if (story._id === "gcps-schools-since-2004") return <SchoolsFeature story={story} />;
  const topics = story.gameTopics || [];
  const hasCalendar = topics.length > 0 && story.body?.some(block => block._type === "upcomingGameEvents");
  const nextEvents = hasCalendar ? (await upcomingGameEvents(topics)).slice(0, 5) : [];
  const canonical = "https://allthingsgwinnett.com/stories/" + encodeURIComponent(story.slug);
  let inSources = false;
  const isHolidayGuide = story._id === "atg-gwinnett-thanksgiving-holiday-hacks-2026";
  const headingLogos = new Map<string, string>();
  const body = (story.body || []).filter((block, index, blocks) => {
    const heading = blocks[index - 1];
    if (isHolidayGuide && block._type === "image" && block.imageUrl && !block.caption &&
        /\blogo\b/i.test(block.alt || "") && heading?._type === "block" && heading.style === "h3") {
      headingLogos.set(heading._key, block.imageUrl);
      return false;
    }
    return true;
  });
  const articleBody = body.map((block: any) => {
    if (block._type !== "block") return block;
    if (isHolidayGuide && block.style === "normal" &&
        block.markDefs?.some((mark: { href?: string }) => mark.href?.startsWith("https://www.google.com/maps"))) {
      return { ...block, children: block.children.map((span: { _type: string; text?: string; marks?: string[] }) =>
        span._type === "span" && !span.marks?.length && /^\d{3}-\d{3}-\d{4}$/.test(span.text || "")
          ? { ...span, _type: "directoryPhone" } : span) };
    }
    if (/^h[1-6]$/.test(block.style)) {
      const heading = (block.children || []).map((span: any) => span.text || "").join("").trim();
      inSources = /^(sources?|references|methods and sources|sources and methodology)[:.]?$/i.test(heading);
    }
    if ((!inSources && !/^source-\d+$/.test(block._key)) || !block.markDefs?.length) return block;
    return { ...block, markDefs: block.markDefs.map((mark: any) => ({ ...mark, sourceEntry: true })) };
  });
  const leadSummary = isHolidayGuide && articleBody[0]?._type === "tldr" ? articleBody[0] : undefined;
  const figureMetadata: Record<string, { name?: string; creator?: string; description: string; period: string; variables: string[]; sources: string[] }> = story._id === "d74a7eb1-dd41-4b97-b316-ea5d72d3e60c" ? {
  "cityPop": {
    "description": "July 2025 population estimates for each municipality’s Gwinnett residents and unincorporated Gwinnett.",
    "period": "2025-07-01",
    "variables": [
      "Resident population"
    ],
    "sources": [
      "source-20"
    ]
  },
  "cityRace": {
    "description": "Counts and percentages by Hispanic origin and non-Hispanic race within the Gwinnett portion of each city.",
    "period": "2020-04-01",
    "variables": [
      "Resident population",
      "Population share by race and Hispanic origin"
    ],
    "sources": [
      "source-21"
    ]
  },
  "gw6": {
    "description": "Gwinnett County decennial population counts and the July 2025 population estimate.",
    "period": "1970/2025",
    "variables": [
      "Resident population"
    ],
    "sources": [
      "source-1",
      "source-2",
      "source-3"
    ]
  },
  "gw24": {
    "description": "Components of annual population change in Gwinnett County, measured in residents.",
    "period": "2024-07-01/2025-07-01",
    "variables": [
      "Net domestic and international migration",
      "Natural increase",
      "Residual adjustment"
    ],
    "sources": [
      "source-7"
    ]
  },
  "gw30": {
    "description": "Percentages of Gwinnett residents by race and Hispanic origin in 1990, 2010 and 2020.",
    "period": "1990/2020",
    "variables": [
      "Population share by race and Hispanic origin"
    ],
    "sources": [
      "source-9",
      "source-19"
    ]
  }
} : story._id === "acb4b18b-db6b-4fa1-a004-a4d373dca55b" ? {
  "recruit-table-0": {
    "name": "Gwinnett County Division I recruits, Class of 2027",
    "creator": "All Things Gwinnett",
    "description": "Gwinnett County high school athletes in the class of 2027 with documented Division I college decisions, recruiting ratings and available state and national rankings.",
    "period": "2026-11-27",
    "variables": [
      "College decision",
      "Recruiting rating",
      "Georgia rank",
      "National rank"
    ],
    "sources": [
      "source-1",
      "source-3",
      "source-4",
      "source-5",
      "source-6",
      "source-7",
      "source-8"
    ]
  },
  "recruit-table-1": {
    "name": "Gwinnett County Division I prospects, Classes of 2028 and 2029",
    "creator": "All Things Gwinnett",
    "description": "Selected Gwinnett underclassmen with documented Division I offers or commitments, listed by class, school, sport, college and available ranking.",
    "period": "2026-11-27",
    "variables": [
      "Graduation class",
      "College offer or commitment",
      "Recruiting rating",
      "Georgia rank",
      "National rank"
    ],
    "sources": [
      "source-10",
      "source-11",
      "source-12",
      "source-13",
      "source-14",
      "source-16"
    ]
  },
  "national-counties": {
    "creator": "Gridpex",
    "description": "National ranks for the ten highest-ranked counties and two selected peers in Gridpex’s hometown-based, star-weighted football recruiting data from 2010 through 2026.",
    "period": "2010/2026",
    "variables": [
      "National county rank"
    ],
    "sources": [
      "source-19"
    ]
  },
  "alumni-table": {
    "creator": "All Things Gwinnett",
    "description": "Selected Gwinnett high school alumni by sport, position or event, high school and graduating year from 2000 through 2026.",
    "period": "2000/2026",
    "variables": [
      "Graduation year",
      "Sport",
      "Position or event",
      "High school"
    ],
    "sources": [
      "source-17",
      "source-20",
      "source-21"
    ]
  }
} : {};
  const datasets = (story.body || []).filter(block => figureMetadata[block._key]?.description && (
    block._type === "callout" || (block._type === "image" && chartFigures[block.asset?._ref])
  )).map(block => {
    const url = canonical + "#" + encodeURIComponent(block._key);
    const citations = (figureMetadata[block._key].sources as string[]).map(key =>
      story.body?.find(source => source._key === key)?.markDefs?.[0]?.href
    ).filter(Boolean);
    return {
      "@type": "Dataset",
      "@id": url,
      url,
      name: figureMetadata[block._key].name || block.heading || chartFigures[block.asset._ref].title,
      description: figureMetadata[block._key].description,
      temporalCoverage: figureMetadata[block._key].period,
      spatialCoverage: { "@type": "Place", name: block._key === "national-counties" ? "United States" : story.location },
      variableMeasured: figureMetadata[block._key].variables,
      citation: citations,
      ...(figureMetadata[block._key].creator && { creator: { "@type": "Organization", name: figureMetadata[block._key].creator } }),
    };
  });
  const structured = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": canonical,
    ...(datasets.length > 0 && { hasPart: datasets }),
    headline: story.title,
    description: story.excerpt,
    mainEntityOfPage: canonical,
    datePublished: story.publishedAt,
    dateModified: story.updatedAt,
    image: imageUrl(story.image) || undefined,
    author: storyAuthor(story.author),
    publisher: { "@type": "Organization", name: "All Things Gwinnett", url: "https://allthingsgwinnett.com" },
    ...(story.guideRestaurants && { ...tacoGuideSchema(canonical, story.title, body, story.guideRestaurants), "@id": canonical + "#article" }),
  };
  return (
    <main id="main" className="site-width page-content">
      <article className="article">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
        <header>
          <p className="story-label">{storyLabel(story)}</p>
          <h1>{story.title}</h1>
          {story.excerpt && <p className="lead-deck">{story.excerpt}</p>}
          <p className="byline"><StoryByline story={story} /></p>
          {leadSummary && <div className="article-body"><StorySummary value={leadSummary} /></div>}
          <StoryImage story={story} priority />
          {story.image?.credit && (
            <p className="quiet">Photo: {story.image.credit}</p>
          )}
        </header>
        <div className="article-body">
          <PortableText
            value={leadSummary ? articleBody.slice(1) : articleBody}
            components={{
              block: {
                h3: ({ children, value }) => {
                  const logo = headingLogos.get(value._key);
                  return logo ? (
                    <h3 className="story-business-heading">
                      <img src={logo} alt="" loading="lazy" decoding="async" />
                      <span>{children}</span>
                    </h3>
                  ) : <h3>{children}</h3>;
                },
                normal: ({children,value}) => <p id={/^source-\d+$/.test(value._key) ? value._key : undefined}>{children}</p>,
              },
              marks: {
                link: ({ children, value }) => {
                  const anchor = (value?.href || "").replace(canonical, "");
                  if (/^#source-\d+$/.test(anchor)) return <sup><a href={anchor}>{children}</a></sup>;
                  if (/^#[\w-]+$/.test(anchor)) return <a style={value?.sourceEntry ? { fontSize: "0.875rem" } : undefined} href={anchor}>{children}</a>;
                  const href = value?.internalSlug
                    ? `/stories/${encodeURIComponent(value.internalSlug)}`
                    : safeUrl(value?.href);
                  return href ? <a style={value?.sourceEntry ? { fontSize: "0.875rem", overflowWrap: "anywhere" } : undefined} href={href} target={/^https?:/.test(href) ? "_blank" : undefined} rel="noopener noreferrer">{children}</a> : <>{children}</>;
                },
              },
              types: {
                directoryPhone: ({ value }) => <a href={"tel:+1" + value.text.replace(/-/g, "")}>{value.text}</a>,
                faq: StoryFaq,
                upcomingGameEvents: ({ value }) => hasCalendar ? (
                  <section>
                    <h2>{value.heading || "Upcoming events"}</h2>
                    <GameEventTable events={nextEvents} caption="Next five events" />
                    {topics.includes("pokemon") && <p><Link className="button button-orange" href="/events/pokemon">See all Gwinnett Pokémon events</Link></p>}
                  </section>
                ) : null,
                image: ({ value }) =>
                  chartFigures[value.asset?._ref] ? <div id={figureMetadata[value._key] ? value._key : undefined}><StoryDataChart chart={chartFigures[value.asset._ref]} caption={value.caption} /></div> : value.imageUrl ? (
                    <figure>
                      <img src={value.imageUrl} alt={value.alt || ""} loading="lazy" decoding="async" />
                      {value.caption && (
                        <figcaption>{value.caption}</figcaption>
                      )}
                    </figure>
                  ) : null,
                pullQuote: ({ value }) => (
                  <blockquote>
                    {value.text}
                    {value.attribution && <cite> — {value.attribution}</cite>}
                  </blockquote>
                ),
                divider: () => <hr />,
                callout: ({ value }) => figureMetadata[value._key] ? <div id={value._key}><StoryCallout value={value} /></div> : <StoryCallout value={value} />,
                tldr: StorySummary,
                editorsNote: ({ value }) => (
                  <aside>
                    <h2>{value.title || "Editor’s note"}</h2>
                    <p>{value.body}</p>
                  </aside>
                ),
                correction: ({ value }) => (
                  <aside>
                    <h2>Correction</h2>
                    <p>{value.body}</p>
                  </aside>
                ),
              },
            }}
          />
        </div>
      <p><a className="text-link" href="https://www.facebook.com/groups/allthingsgwinnett">Discuss this story in the ATG Facebook group ↗</a></p>
      </article>
    </main>
  );
}
