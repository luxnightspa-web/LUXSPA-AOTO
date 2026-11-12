import * as THREE from 'three';
import * as xb from 'xrblocks';

import { INITIAL_STORIES } from './constants.ts';
import { ParticleField } from './components/ParticleField.ts';
import {
  narrator,
  requestTTS,
  requestIllustration,
  requestChatWithOwl,
  requestCustomStory,
} from './services/apiClient.ts';
import { StoryData, ImageResolution, ChatMessageData } from './types.ts';

/**
 * WonderTales XR: An interactive spatial storybook for children.
 * Reads stories aloud with Gemini TTS (gemini-3.8-flash-tts) and
 * generates fresh illustrations for every page with Gemini 3 Pro (gemini-3-pro-image-preview).
 */
class WonderTalesStorybookScene extends xb.Script {
  private stories: StoryData[] = INITIAL_STORIES;
  private currentStoryIndex = 0;
  private currentPageIndex = 0;
  private selectedResolution: ImageResolution = '2K';
  private selectedVoice = 'Puck'; // Puck, Kore, Zephyr

  private isReading = false;
  private isIllustrating = false;
  private isChatting = false;

  // 3D Visual elements
  private particleField?: ParticleField;
  private pedestal?: THREE.Mesh;

  // Central Book UI components
  private mainBookCard!: xb.UICard;
  private storyTitleText!: xb.UIText;
  private pageIndicatorText!: xb.UIText;
  private pageImage!: xb.UIImage;
  private imageStatusText!: xb.UIText;
  private storyBodyText!: xb.UIText;
  private readButton!: xb.UIButton;
  private illustrateButton!: xb.UIButton;
  private prevPageButton!: xb.UIButton;
  private nextPageButton!: xb.UIButton;
  private readingProgressBar!: xb.UIPanel;

  // Left Library UI components
  private libraryCard!: xb.UICard;
  private libraryStatusText!: xb.UIText;
  private customStoryButton!: xb.UIButton;

  // Right Companion UI components
  private companionCard!: xb.UICard;
  private owlStatusText!: xb.UIText;
  private chatScroll!: xb.UIScrollView;
  private resolutionLabel!: xb.UIText;
  private btn1K!: xb.UIButton;
  private btn2K!: xb.UIButton;
  private btn4K!: xb.UIButton;

  private chatMessages: ChatMessageData[] = [
    {
      id: 'welcome-1',
      sender: 'owl',
      text: '✨ *Flaps wings happily!* Hoo-hoo! Hello adventurer! I am Barnaby the Story Owl. I can answer any questions about our story, or we can make new magical pictures together!',
      timestamp: Date.now(),
    },
  ];

  init() {
    this.setupLighting();
    this.setupPedestalAndParticles();
    this.buildCentralStorybook();
    this.buildLeftLibrary();
    this.buildRightCompanion();
    this.updatePageDisplay();
  }

  private setupLighting() {
    const ambientLight = new THREE.HemisphereLight(0xfff8ee, 0x1e293b, 3.2);
    this.add(ambientLight);

    const bookKeyLight = new THREE.DirectionalLight(0xffeacc, 2.5);
    bookKeyLight.position.set(0.5, 3.5, 0.5);
    this.add(bookKeyLight);

    const fillLight = new THREE.PointLight(0xa5f3fc, 1.8, 4);
    fillLight.position.set(-0.8, 1.5, -0.6);
    this.add(fillLight);
  }

  private setupPedestalAndParticles() {
    this.particleField = new ParticleField();
    this.add(this.particleField);

    // Decorative floating story altar base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.58, 0.08, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x2e1a47,
      roughness: 0.4,
      metalness: 0.3,
    });
    this.pedestal = new THREE.Mesh(baseGeo, baseMat);
    this.pedestal.position.set(0, 0.85, -1.15);
    this.add(this.pedestal);

    // Golden trim ring
    const ringGeo = new THREE.TorusGeometry(0.52, 0.015, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.89, -1.15);
    this.add(ring);
  }

  /**
   * Central Spatial Storybook Card
   */
  private buildCentralStorybook() {
    this.storyTitleText = new xb.UIText({
      text: 'WonderTales Storybook',
      style: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f8fafc',
      },
    });

    this.pageIndicatorText = new xb.UIText({
      text: 'Page 1 of 4',
      style: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: 'bold',
      },
    });

    // Top Header with Title and Page Indicator
    const headerPanel = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 6,
      },
      children: [
        new xb.UIPanel({
          style: { flexDirection: 'row', alignItems: 'center', gap: 10 },
          children: [
            new xb.UIIcon({
              icon: 'auto_stories',
              style: { width: 28, height: 28, color: '#fbbf24' },
            }),
            this.storyTitleText,
          ],
        }),
        this.pageIndicatorText,
      ],
    });

    // Reading progress bar
    this.readingProgressBar = new xb.UIPanel({
      style: {
        width: '25%',
        height: 4,
        backgroundColor: '#fbbf24',
        borderRadius: 2,
      },
    });
    const progressTrack = new xb.UIPanel({
      style: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginBottom: 8,
      },
      children: [this.readingProgressBar],
    });

    // Illustration Display
    this.pageImage = new xb.UIImage({
      src: this.stories[0].pages[0].illustrationUrl || '',
      ariaLabel: 'Page illustration',
      style: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        objectFit: 'cover',
      },
    });

    this.imageStatusText = new xb.UIText({
      text: '✨ Resolution: 2K • Gemini 3 Pro Ready',
      style: {
        fontSize: 13,
        color: '#e2e8f0',
        fontWeight: 'bold',
      },
    });

    const imageOverlayBadge = new xb.UIPanel({
      style: {
        position: 'absolute',
        bottom: 10,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        borderRadius: 12,
        padding: 6,
        paddingLeft: 12,
        paddingRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      children: [this.imageStatusText],
    });

    const imageContainer = new xb.UIPanel({
      style: {
        width: '100%',
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#020617',
      },
      children: [this.pageImage, imageOverlayBadge],
    });

    // Story Text Area (Large, legible, kid-friendly font size)
    this.storyBodyText = new xb.UIText({
      text: 'Loading story text...',
      style: {
        width: '100%',
        fontSize: 19,
        lineHeight: 1.45,
        color: '#ffffff',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        minHeight: 85,
      },
    });

    // Reading & Illustrate Action Buttons
    this.readButton = new xb.UIButton({
      label: 'Read Aloud',
      icon: 'volume_up',
      style: {
        flexGrow: 1,
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
      },
      onClick: () => this.toggleReadAloud(),
    });

    this.illustrateButton = new xb.UIButton({
      label: 'New Illustration',
      icon: 'auto_fix_high',
      style: {
        flexGrow: 1,
        backgroundColor: '#059669',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
      },
      onClick: () => this.generateFreshIllustration(),
    });

    const actionRow = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
      },
      children: [this.readButton, this.illustrateButton],
    });

    // Navigation Buttons
    this.prevPageButton = new xb.UIButton({
      label: 'Previous',
      icon: 'arrow_back',
      style: { flexGrow: 1 },
      onClick: () => this.changePage(-1),
    });

    this.nextPageButton = new xb.UIButton({
      label: 'Next Page',
      icon: 'arrow_forward',
      style: { flexGrow: 1 },
      onClick: () => this.changePage(1),
    });

    const navRow = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
      },
      children: [this.prevPageButton, this.nextPageButton],
    });

    this.mainBookCard = new xb.UICard({
      size: { width: 0.68, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderRadius: 20,
      },
      children: [
        headerPanel,
        progressTrack,
        imageContainer,
        this.storyBodyText,
        actionRow,
        navRow,
      ],
    });

    this.mainBookCard.position.set(0, 1.42, -1.15);
    this.add(this.mainBookCard);
  }

  /**
   * Left Card: Story Catalog & Adventure Maker
   */
  private buildLeftLibrary() {
    const libraryTitle = new xb.UIText({
      text: 'Story Library',
      style: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
    });

    const libraryHeader = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 6,
      },
      children: [
        new xb.UIIcon({
          icon: 'local_library',
          style: { width: 24, height: 24, color: '#60a5fa' },
        }),
        libraryTitle,
      ],
    });

    const storyButtons = this.stories.map((story, idx) => {
      return new xb.UIButton({
        label: story.title,
        icon: story.icon,
        style: {
          width: '100%',
          justifyContent: 'flex-start',
          fontSize: 14,
          textAlign: 'left',
          marginBottom: 4,
          backgroundColor:
            idx === this.currentStoryIndex
              ? 'rgba(59, 130, 246, 0.35)'
              : 'rgba(255, 255, 255, 0.08)',
        },
        onClick: () => this.selectStory(idx),
      });
    });

    const storiesListPanel = new xb.UIPanel({
      style: { width: '100%', flexDirection: 'column', gap: 6 },
      children: storyButtons,
    });

    // Voice Selector
    const voiceHeader = new xb.UIText({
      text: 'Narrator Voice (Gemini TTS):',
      style: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold', marginTop: 6 },
    });

    const voiceRow = new xb.UIPanel({
      style: { width: '100%', flexDirection: 'row', gap: 6 },
      children: [
        new xb.UIButton({
          label: 'Puck (Playful)',
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => {
            this.selectedVoice = 'Puck';
            this.libraryStatusText.text = 'Voice set to Puck (Playful).';
          },
        }),
        new xb.UIButton({
          label: 'Kore (Gentle)',
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => {
            this.selectedVoice = 'Kore';
            this.libraryStatusText.text = 'Voice set to Kore (Gentle).';
          },
        }),
        new xb.UIButton({
          label: 'Zephyr',
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => {
            this.selectedVoice = 'Zephyr';
            this.libraryStatusText.text = 'Voice set to Zephyr (Calm).';
          },
        }),
      ],
    });

    // Custom Story Generator
    this.customStoryButton = new xb.UIButton({
      label: '✨ Create Custom Story with AI',
      icon: 'magic_button',
      style: {
        width: '100%',
        marginTop: 10,
        backgroundColor: '#7c3aed',
        color: '#ffffff',
        fontWeight: 'bold',
      },
      onClick: () => this.generateAIStory(),
    });

    this.libraryStatusText = new xb.UIText({
      text: 'Pick a tale or create a new adventure!',
      style: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
    });

    this.libraryCard = new xb.UICard({
      size: { width: 0.52, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderRadius: 20,
      },
      children: [
        libraryHeader,
        storiesListPanel,
        voiceHeader,
        voiceRow,
        this.customStoryButton,
        this.libraryStatusText,
      ],
    });

    this.libraryCard.position.set(-0.64, 1.42, -1.05);
    this.libraryCard.rotation.y = 0.28;
    this.add(this.libraryCard);
  }

  /**
   * Right Card: Barnaby the Story Owl (Chatbot) & Image Size Affordance
   */
  private buildRightCompanion() {
    const owlHeader = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      children: [
        new xb.UIIcon({
          icon: 'psychology',
          style: { width: 26, height: 26, color: '#38bdf8' },
        }),
        new xb.UIPanel({
          style: { flexDirection: 'column' },
          children: [
            new xb.UIText({
              text: 'Barnaby the Story Owl',
              style: { fontSize: 19, fontWeight: 'bold', color: '#f8fafc' },
            }),
            new xb.UIText({
              text: 'Gemini Story Companion for Kids',
              style: { fontSize: 12, color: '#94a3b8' },
            }),
          ],
        }),
      ],
    });

    // Image Resolution Affordance (1K, 2K, 4K)
    this.resolutionLabel = new xb.UIText({
      text: 'Image Size (Gemini 3 Pro): 2K High-Def',
      style: { fontSize: 13, fontWeight: 'bold', color: '#38bdf8' },
    });

    this.btn1K = new xb.UIButton({
      label: '1K Fast',
      style: { flexGrow: 1, fontSize: 12 },
      onClick: () => this.setResolution('1K'),
    });
    this.btn2K = new xb.UIButton({
      label: '2K Crisp (Selected)',
      style: { flexGrow: 1, fontSize: 12, backgroundColor: 'rgba(56, 189, 248, 0.3)' },
      onClick: () => this.setResolution('2K'),
    });
    this.btn4K = new xb.UIButton({
      label: '4K Ultra',
      style: { flexGrow: 1, fontSize: 12 },
      onClick: () => this.setResolution('4K'),
    });

    const resolutionRow = new xb.UIPanel({
      style: { width: '100%', flexDirection: 'row', gap: 6 },
      children: [this.btn1K, this.btn2K, this.btn4K],
    });

    const resolutionSection = new xb.UIPanel({
      style: {
        width: '100%',
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        flexDirection: 'column',
        gap: 6,
      },
      children: [this.resolutionLabel, resolutionRow],
    });

    // Scrollable Chat Thread
    this.chatScroll = new xb.UIScrollView({
      ariaLabel: 'Conversation with Barnaby the Owl',
      style: {
        width: '100%',
        height: 180,
        gap: 8,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 12,
      },
      children: this.renderChatThreadElements(),
    });

    // Quick Tap Question Buttons for Kids
    const quickAskButtons = [
      'What happens next?',
      'Tell me a fun secret!',
      'Why is the dragon gentle?',
      'Sing a bedtime rhyme!',
    ];

    const quickPillRow1 = new xb.UIPanel({
      style: { width: '100%', flexDirection: 'row', gap: 6 },
      children: [
        new xb.UIButton({
          label: quickAskButtons[0],
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => this.askBarnaby(quickAskButtons[0]),
        }),
        new xb.UIButton({
          label: quickAskButtons[1],
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => this.askBarnaby(quickAskButtons[1]),
        }),
      ],
    });

    const quickPillRow2 = new xb.UIPanel({
      style: { width: '100%', flexDirection: 'row', gap: 6 },
      children: [
        new xb.UIButton({
          label: quickAskButtons[2],
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => this.askBarnaby(quickAskButtons[2]),
        }),
        new xb.UIButton({
          label: quickAskButtons[3],
          style: { flexGrow: 1, fontSize: 12 },
          onClick: () => this.askBarnaby(quickAskButtons[3]),
        }),
      ],
    });

    this.owlStatusText = new xb.UIText({
      text: 'Ask Barnaby anything about the story!',
      style: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
    });

    this.companionCard = new xb.UICard({
      size: { width: 0.52, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderRadius: 20,
      },
      children: [
        owlHeader,
        resolutionSection,
        this.chatScroll,
        quickPillRow1,
        quickPillRow2,
        this.owlStatusText,
      ],
    });

    this.companionCard.position.set(0.64, 1.42, -1.05);
    this.companionCard.rotation.y = -0.28;
    this.add(this.companionCard);
  }

  private setResolution(res: ImageResolution) {
    this.selectedResolution = res;
    this.resolutionLabel.text = `Image Size (Gemini 3 Pro): ${res}`;

    this.btn1K.label = res === '1K' ? '1K Fast (Selected)' : '1K Fast';
    this.btn2K.label = res === '2K' ? '2K Crisp (Selected)' : '2K Crisp';
    this.btn4K.label = res === '4K' ? '4K Ultra (Selected)' : '4K Ultra';

    this.imageStatusText.text = `✨ Resolution: ${res} • Gemini 3 Pro Ready`;
  }

  private renderChatThreadElements(): xb.UIPanel[] {
    return this.chatMessages.map((msg) => {
      const isOwl = msg.sender === 'owl';
      return new xb.UIPanel({
        style: {
          width: '100%',
          padding: 8,
          borderRadius: 10,
          backgroundColor: isOwl ? 'rgba(56, 189, 248, 0.18)' : 'rgba(168, 85, 247, 0.22)',
          alignSelf: isOwl ? 'flex-start' : 'flex-end',
          flexDirection: 'column',
          gap: 2,
        },
        children: [
          new xb.UIText({
            text: isOwl ? '🦉 Barnaby:' : '👧 You:',
            style: {
              fontSize: 12,
              fontWeight: 'bold',
              color: isOwl ? '#38bdf8' : '#c084fc',
            },
          }),
          new xb.UIText({
            text: msg.text,
            style: { fontSize: 14, color: '#f8fafc', lineHeight: 1.35 },
          }),
        ],
      });
    });
  }

  private async askBarnaby(question: string) {
    if (this.isChatting) return;
    this.isChatting = true;
    this.owlStatusText.text = '🦉 Barnaby is thinking...';

    // Add user message
    this.chatMessages.push({
      id: `u-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: Date.now(),
    });
    this.refreshChatScroll();

    try {
      const story = this.stories[this.currentStoryIndex];
      const page = story.pages[this.currentPageIndex];

      const conversationHistory = this.chatMessages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const reply = await requestChatWithOwl(
        conversationHistory,
        story.title,
        page.text
      );

      this.chatMessages.push({
        id: `o-${Date.now()}`,
        sender: 'owl',
        text: reply,
        timestamp: Date.now(),
      });
      this.refreshChatScroll();
      this.owlStatusText.text = 'Ask Barnaby anything about the story!';

      // Optionally read owl's reply aloud with gemini-3.8-flash-tts
      requestTTS(reply, this.selectedVoice);
    } catch (err: any) {
      console.warn('Owl chat error:', err);
      this.chatMessages.push({
        id: `err-${Date.now()}`,
        sender: 'owl',
        text: '*Flaps wings gently!* The stars are swirling with magic! Let us look at the story again.',
        timestamp: Date.now(),
      });
      this.refreshChatScroll();
      this.owlStatusText.text = 'Ask Barnaby anything about the story!';
    } finally {
      this.isChatting = false;
    }
  }

  private refreshChatScroll() {
    this.chatScroll.children = this.renderChatThreadElements();
  }

  private selectStory(index: number) {
    narrator.stopAudio();
    this.isReading = false;
    this.currentStoryIndex = index;
    this.currentPageIndex = 0;
    this.updatePageDisplay();
    this.libraryStatusText.text = `Reading: ${this.stories[index].title}`;
  }

  private changePage(delta: number) {
    narrator.stopAudio();
    this.isReading = false;
    const story = this.stories[this.currentStoryIndex];
    const newIdx = this.currentPageIndex + delta;
    if (newIdx >= 0 && newIdx < story.pages.length) {
      this.currentPageIndex = newIdx;
      this.updatePageDisplay();

      // Read aloud automatically when turning pages, like a real interactive storybook!
      this.startReadingPage();
    }
  }

  private updatePageDisplay() {
    const story = this.stories[this.currentStoryIndex];
    const page = story.pages[this.currentPageIndex];

    this.storyTitleText.text = story.title;
    this.pageIndicatorText.text = `Page ${this.currentPageIndex + 1} of ${story.pages.length}`;
    this.storyBodyText.text = page.text;

    // Update progress bar
    const progressPct = ((this.currentPageIndex + 1) / story.pages.length) * 100;
    this.readingProgressBar.style.width = `${progressPct}%`;

    // Update buttons
    this.prevPageButton.disabled = this.currentPageIndex === 0;
    this.nextPageButton.disabled = this.currentPageIndex === story.pages.length - 1;

    // Update image
    if (page.illustrationUrl) {
      this.pageImage.src = page.illustrationUrl;
    }

    this.imageStatusText.text = `✨ Resolution: ${this.selectedResolution} • Ready`;
    this.readButton.label = 'Read Aloud';
    this.readButton.icon = 'volume_up';
  }

  private async toggleReadAloud() {
    if (this.isReading) {
      narrator.stopAudio();
      this.isReading = false;
      this.readButton.label = 'Read Aloud';
      this.readButton.icon = 'volume_up';
    } else {
      await this.startReadingPage();
    }
  }

  private async startReadingPage() {
    this.isReading = true;
    this.readButton.label = 'Pause Audio';
    this.readButton.icon = 'stop';

    const story = this.stories[this.currentStoryIndex];
    const page = story.pages[this.currentPageIndex];

    await requestTTS(page.text, this.selectedVoice, () => {
      this.isReading = false;
      this.readButton.label = 'Read Aloud';
      this.readButton.icon = 'volume_up';
    });
  }

  private async generateFreshIllustration() {
    if (this.isIllustrating) return;
    this.isIllustrating = true;
    this.illustrateButton.disabled = true;
    this.imageStatusText.text = `🎨 Gemini 3 Pro is painting in ${this.selectedResolution}...`;

    const story = this.stories[this.currentStoryIndex];
    const page = story.pages[this.currentPageIndex];

    try {
      const result = await requestIllustration(
        page.illustrationPrompt,
        this.selectedResolution
      );
      page.illustrationUrl = result.imageUrl;
      this.pageImage.src = result.imageUrl;
      this.imageStatusText.text = `✨ Painted at ${this.selectedResolution} with ${result.modelUsed}!`;
    } catch (err: any) {
      console.warn('Illustration generation error:', err);
      this.imageStatusText.text = `✨ Displaying colorful storybook art (${this.selectedResolution})`;
    } finally {
      this.isIllustrating = false;
      this.illustrateButton.disabled = false;
    }
  }

  private async generateAIStory() {
    this.libraryStatusText.text = '🪄 Gemini is writing a new 4-page story...';
    this.customStoryButton.disabled = true;

    try {
      const themes = [
        {
          hero: 'Barnaby the Baby Otter',
          setting: 'Floating Lily Pad Kingdom',
          theme: 'Making new friends with a shy starfish',
        },
        {
          hero: 'Astro Pup',
          setting: 'The Neon Rings of Saturn',
          theme: 'Bouncing on zero-gravity moon trampolines',
        },
        {
          hero: 'Pip the Little Robot',
          setting: 'Clockwork Toymaker Mountain',
          theme: 'Building a music box for butterflies',
        },
      ];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const custom = await requestCustomStory(randomTheme);
      const newStory: StoryData = {
        id: `custom-${Date.now()}`,
        title: custom.title,
        hero: randomTheme.hero,
        tagline: custom.summary,
        icon: 'stars',
        themeColor: '#c084fc',
        pages: custom.pages.map(
          (
            p: { pageNumber?: number; text: string; illustrationPrompt: string },
            idx: number
          ) => ({
            pageNumber: p.pageNumber || idx + 1,
            text: p.text,
            illustrationPrompt: p.illustrationPrompt,
            illustrationUrl: this.stories[0].pages[idx % 4].illustrationUrl,
          })
        ),
      };

      this.stories.push(newStory);
      this.currentStoryIndex = this.stories.length - 1;
      this.currentPageIndex = 0;
      this.updatePageDisplay();
      this.libraryStatusText.text = `Created: "${newStory.title}"!`;

      // Trigger automatic illustration generation for page 1 of the new story!
      this.generateFreshIllustration();
      this.startReadingPage();
    } catch (err: any) {
      console.warn('Custom story error:', err);
      this.libraryStatusText.text = 'Could not generate story right now. Try again!';
    } finally {
      this.customStoryButton.disabled = false;
    }
  }

  update() {
    this.particleField?.update();
    if (this.pedestal) {
      this.pedestal.rotation.y += 0.002;
    }
  }

  dispose() {
    narrator.stopAudio();
    this.particleField?.dispose();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const options = new xb.Options();
  options.setAppTitle('WonderTales XR - Kids Storybook');
  options.setAppDescription(
    'An interactive spatial storybook for kids that reads stories aloud with Gemini TTS and illustrates every page with Gemini 3 Pro.'
  );

  xb.add(new WonderTalesStorybookScene());
  xb.init(options);
});
