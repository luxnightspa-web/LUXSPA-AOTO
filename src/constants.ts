import { StoryData } from './types.ts';
import { createStoryIllustration } from './utils/proceduralArt.ts';

export const INITIAL_STORIES: StoryData[] = [
  {
    id: 'star-whale',
    title: 'The Star Whale & the Cloud Castle',
    hero: 'Luna the Star Whale',
    tagline: 'A cosmic ocean voyage across starry skies',
    icon: 'water_drop',
    themeColor: '#42a5f5',
    pages: [
      {
        pageNumber: 1,
        text: 'High above the quiet sleepy towns, Luna the Star Whale floated gently through oceans of purple starlight. Her silver fins glowed whenever she hummed a happy lullaby to the sleepy planets.',
        illustrationPrompt:
          'A majestic, gentle baby star whale with glowing blue-silver skin swimming gracefully through a magical night sky filled with nebula clouds, golden stars, and floating constellations',
        illustrationUrl: createStoryIllustration('whale', 0, 'The Star Whale'),
      },
      {
        pageNumber: 2,
        text: 'Tonight, Luna spotted a curious golden light twinkling atop the Great Cotton Candy Cloud. "Look, little moonbeam!" Luna sang softly as she spouted a shimmering geyser of rainbow dust.',
        illustrationPrompt:
          'The star whale spouting a brilliant rainbow geyser of stardust towards a fluffy pink cotton-candy cloud floating in space',
        illustrationUrl: createStoryIllustration('whale', 1, 'The Star Whale'),
      },
      {
        pageNumber: 3,
        text: 'Perched upon the cloud stood a secret crystal castle with towers made of spun sugar. A friendly cloud bunny was waving a starry lantern to welcome tired cosmic travelers.',
        illustrationPrompt:
          'A magnificent luminous crystal castle on a fluffy cloud with a tiny adorable white bunny in a starry nightcap waving a glowing golden lantern',
        illustrationUrl: createStoryIllustration('whale', 2, 'The Star Whale'),
      },
      {
        pageNumber: 4,
        text: 'Together, Luna and the cloud bunny shared honeyed star-biscuits under a shower of falling comets. Luna curled up in the warm cloud mist, knowing that tomorrow would bring another magical voyage.',
        illustrationPrompt:
          'The star whale resting cozily beside the friendly bunny on a cloud, eating golden star cookies while gentle shooting stars drift across the starry sky',
        illustrationUrl: createStoryIllustration('whale', 3, 'The Star Whale'),
      },
    ],
  },
  {
    id: 'brave-dragon',
    title: 'Barnaby the Brave Little Dragon',
    hero: 'Barnaby the Dragon',
    tagline: 'The dragon who breathes rainbow bubbles',
    icon: 'local_fire_department',
    themeColor: '#66bb6a',
    pages: [
      {
        pageNumber: 1,
        text: 'In the emerald valley of Whispering Ferns lived Barnaby, a tiny emerald dragon with soft velvety wings. Unlike big fierce dragons who breathed hot fiery smoke, Barnaby had a very special gift.',
        illustrationPrompt:
          'A super cute small green baby dragon with bright joyful eyes and tiny golden horns sitting in a magical glowing forest of giant ferns and colorful wildflowers',
        illustrationUrl: createStoryIllustration('dragon', 0, 'Barnaby Dragon'),
      },
      {
        pageNumber: 2,
        text: 'Whenever Barnaby sneezed or laughed, he puffed out enormous shimmering rainbow bubbles! Each bubble sparkled like a floating jewel and played sweet musical chimes in the breeze.',
        illustrationPrompt:
          'Cute baby dragon giggling happily as magical iridescent rainbow bubbles float around him, reflecting sunshine and tiny musical notes in the air',
        illustrationUrl: createStoryIllustration('dragon', 1, 'Barnaby Dragon'),
      },
      {
        pageNumber: 3,
        text: 'One afternoon, the forest squirrels were stuck in a tall pine tree because the dark thunderstorm was approaching. Barnaby fluttered up and blew giant bouncy bubbles for each squirrel to float safely down.',
        illustrationPrompt:
          'The little dragon floating in the air beside a tall pine tree, creating giant bouncy protective bubbles that gently carry cheerful squirrels down to the ground',
        illustrationUrl: createStoryIllustration('dragon', 2, 'Barnaby Dragon'),
      },
      {
        pageNumber: 4,
        text: 'All the woodland creatures cheered and crowned Barnaby with a daisy flower wreath. Barnaby beamed proudly, realizing that being kind and gentle was the bravest magic of all.',
        illustrationPrompt:
          'Baby dragon wearing a crown of yellow daisies and clover, surrounded by happy forest animals like bunnies and deer celebrating together under a sunny rainbow',
        illustrationUrl: createStoryIllustration('dragon', 3, 'Barnaby Dragon'),
      },
    ],
  },
  {
    id: 'detective-pip',
    title: 'Detective Pip & the Missing Cookie',
    hero: 'Detective Pip the Fox',
    tagline: 'A merry mystery in the Acorn Woods',
    icon: 'search',
    themeColor: '#ffa726',
    pages: [
      {
        pageNumber: 1,
        text: 'Detective Pip was the most observant fox in Acorn Woods. He wore a tiny brown detective cap and always carried his golden magnifying glass to inspect suspicious crumbs.',
        illustrationPrompt:
          'A charming little fox wearing a tweed detective hat and holding a golden magnifying glass, closely examining colorful pebble paths in a cozy autumn woodland',
        illustrationUrl: createStoryIllustration('detective', 0, 'Detective Pip'),
      },
      {
        pageNumber: 2,
        text: 'Grandma Hedgehog gasped: "My gigantic double-berry cinnamon cookie is gone from the windowsill!" Pip adjusted his cap and proclaimed, "Never fear, Pip is on the case!"',
        illustrationPrompt:
          'A cozy cottage windowsill with flower pots and faint sweet crumbs, with a shocked elderly hedgehog in a polka-dot apron talking to the confident fox detective',
        illustrationUrl: createStoryIllustration('detective', 1, 'Detective Pip'),
      },
      {
        pageNumber: 3,
        text: 'Pip followed a trail of powdered sugar across the mossy stepping stones and into a hollow maple tree. Inside, he heard a suspicious: *Nom... crunch... crunch!*',
        illustrationPrompt:
          'Detective fox following a sparkling trail of white sugar sprinkles past mushroom toadstools toward the door of a warm hollow oak tree',
        illustrationUrl: createStoryIllustration('detective', 2, 'Detective Pip'),
      },
      {
        pageNumber: 4,
        text: 'It was baby raccoon Toby, who had baked a surprise birthday cake using Grandma\'s cookie! Everyone burst into laughter and celebrated Toby\'s birthday together with warm cups of berry tea.',
        illustrationPrompt:
          'The detective fox, hedgehog, and happy baby raccoon gathered around a cheerful wooden table sharing berry cake and steaming mugs of tea with festive bunting',
        illustrationUrl: createStoryIllustration('detective', 3, 'Detective Pip'),
      },
    ],
  },
  {
    id: 'secret-garden',
    title: 'The Secret Garden of Glowing Fireflies',
    hero: 'Oliver & the Glow Beetle',
    tagline: 'Discover the lanterns of the enchanted forest',
    icon: 'yard',
    themeColor: '#26a69a',
    pages: [
      {
        pageNumber: 1,
        text: 'At the edge of Oliver\'s grandmother\'s backyard rested an old wooden gate covered in glowing honeysuckle vines. Tonight, the latch clicked open all on its own with a gentle chime.',
        illustrationPrompt:
          'A mystical rustic wooden garden gate overgrown with luminescent blue and green vines, slightly open with warm golden light spilling through into a lush secret meadow',
        illustrationUrl: createStoryIllustration('garden', 0, 'Secret Garden'),
      },
      {
        pageNumber: 2,
        text: 'Oliver stepped through into a glowing paradise. Flowers bloomed in dazzling neon blues and golden oranges, lighting up the midnight grass like starry constellations.',
        illustrationPrompt:
          'A curious young boy walking barefoot on glowing soft moss surrounded by giant luminous blossoms that cast magical purple and cyan reflections',
        illustrationUrl: createStoryIllustration('garden', 1, 'Secret Garden'),
      },
      {
        pageNumber: 3,
        text: 'A brigade of fireflies hovered in rhythm, weaving shining patterns in the air to spell out: "WELCOME OLIVER!" They carried tiny bell-shaped flowers filled with sweet nectar.',
        illustrationPrompt:
          'Hundreds of warm golden fireflies flying in coordinated spirals, lighting up a magnificent grand willow tree with miniature lantern flowers dangling from branches',
        illustrationUrl: createStoryIllustration('garden', 2, 'Secret Garden'),
      },
      {
        pageNumber: 4,
        text: 'The King of Fireflies gifted Oliver a glowing star-seed to plant by his bedroom window. As Oliver smiled, he knew the magical garden would always be waiting whenever he closed his eyes.',
        illustrationPrompt:
          'The boy holding a tiny sparkling magical seed that glows like a warm golden star in his palms, smiling warmly as gentle fireflies swirl softly around him',
        illustrationUrl: createStoryIllustration('garden', 3, 'Secret Garden'),
      },
    ],
  },
];
