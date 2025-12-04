
import { TemplateConfig, TemplateType, FilterType, FrameConfig } from './types';

// Expanded Sticker Collection
export const STICKER_CATEGORIES = {
  'Kawaii': ['🎀', '💖', '🧸', '🌸', '🩰', '🦢', '🍰', '🍓', '🍒', '💌', '🍡', '🍭', '🐰', '🐾', '🥛', '🧁', '🍬', '🍼', '🦄', '🌈'],
  'Y2K': ['⛓️', '🧷', '💿', '🦋', '🔥', '👽', '💀', '🩹', '🎸', '🔌', '🧿', '🧬', '🦠', '🖤', '👾', '🕷️', '🕸️', '🎧', '📼', '📱'],
  'Sparkle': ['✨', '🌟', '💫', '⚡', '🌙', '☁️', '🫧', '💎', '✴️', '❇️', '⭐', '🌌', '🎆', '🎐', '❄️', '☄️', '💫', '☀️'],
  'Vibe': ['😎', '🌈', '🍦', '🍕', '🐶', '🐱', '🦄', '💊', '☮️', '☯️', '🍄', '🌵', '🌺', '🍹', '🏖️', '🛹', '🚲', '📷', '💣', '🧨'],
  'Animals': ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦅', '🦉', '🐝', '🦋'],
  'Food': ['🍎', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍', '🥝', '🍅', '🥑', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍜', '🍣'],
  'Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'],
  'Decor': ['〰️', '➰', '➿', '✔️', '❌', '⭕', '⬛', '⬜', '🔶', '🔷', '🔺', '🔻', '♥️', '♣️', '♦️', '▪️', '▫️', '🟡', '🟣', '🟢']
};

// --- PRESET FRAMES ---
// Add your friend's PNG frames here.
// You can use a URL path (e.g. '/frames/my-frame.png') or a Base64 string.
// Ensure the PNG has transparency where the photos should show through!
export const PRESET_FRAMES: FrameConfig[] = [
  {
    id: 'none',
    name: 'No Frame',
    url: ''
  },
  {
    id: 'cute-hearts',
    name: 'Cute Hearts',
    // Using an SVG data URI as a placeholder. Replace this string with your PNG URL!
    url: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='heart' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Ctext x='0' y='30' font-size='20'%3E💗%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='none' stroke='pink' stroke-width='40' /%3E%3Crect width='100%25' height='100%25' fill='url(%23heart)' opacity='0.5' pointer-events='none'/%3E%3C/svg%3E`
  },
  {
    id: 'cool-black',
    name: 'Edgy Black',
    url: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='black' stroke-width='50' /%3E%3Crect x='10' y='10' width='calc(100%25 - 20px)' height='calc(100%25 - 20px)' fill='none' stroke='white' stroke-width='2' stroke-dasharray='10,5'/%3E%3C/svg%3E`
  },
  {
    id: 'gradient-dream',
    name: 'Dreamy',
    url: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:rgb(255,255,0);stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:rgb(255,0,0);stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='none' stroke='url(%23grad1)' stroke-width='30' /%3E%3C/svg%3E`
  }
];

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  strip: {
    id: 'strip',
    name: 'Classic Strip',
    width: 600,
    height: 1800,
    defaultBackgroundColor: '#fff0f5', 
    photoSlots: [
      { x: 50, y: 50, w: 500, h: 500 },
      { x: 50, y: 580, w: 500, h: 500 },
      { x: 50, y: 1110, w: 500, h: 500 },
    ]
  },
  y2k: {
    id: 'y2k',
    name: 'Y2K Wave',
    width: 800,
    height: 2000,
    defaultBackgroundColor: '#fdf6e3',
    photoSlots: [
      { x: 100, y: 120, w: 600, h: 450 },
      { x: 100, y: 620, w: 600, h: 450 },
      { x: 100, y: 1120, w: 600, h: 450 },
    ]
  },
  grid: {
    id: 'grid',
    name: '2x2 Grid',
    width: 1200,
    height: 1600,
    defaultBackgroundColor: '#ffffff',
    photoSlots: [
      { x: 50, y: 50, w: 525, h: 700 },
      { x: 625, y: 50, w: 525, h: 700 },
      { x: 50, y: 800, w: 525, h: 700 },
      { x: 625, y: 800, w: 525, h: 700 },
    ]
  },
  film: {
    id: 'film',
    name: 'Cinema',
    width: 600,
    height: 1800,
    defaultBackgroundColor: '#000000',
    photoSlots: [
      { x: 80, y: 50, w: 440, h: 330 },
      { x: 80, y: 430, w: 440, h: 330 },
      { x: 80, y: 810, w: 440, h: 330 },
      { x: 80, y: 1190, w: 440, h: 330 },
    ]
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    width: 1200,
    height: 1200,
    defaultBackgroundColor: '#1a1a1a',
    photoSlots: [
      { x: 50, y: 50, w: 700, h: 1100 },
      { x: 800, y: 50, w: 350, h: 525 },
      { x: 800, y: 625, w: 350, h: 525 },
    ]
  },
  retro: {
    id: 'retro',
    name: 'Polaroid',
    width: 1200,
    height: 1200,
    defaultBackgroundColor: '#fdf6e3',
    photoSlots: [
      { x: 60, y: 60, w: 510, h: 510, rotate: -2 },
      { x: 630, y: 60, w: 510, h: 510, rotate: 2 },
      { x: 60, y: 630, w: 510, h: 510, rotate: 1 },
      { x: 630, y: 630, w: 510, h: 510, rotate: -1 },
    ]
  },
  wide: {
      id: 'wide',
      name: 'Wide Strip',
      width: 1800,
      height: 600,
      defaultBackgroundColor: '#e0f7fa',
      photoSlots: [
          { x: 50, y: 50, w: 500, h: 500 },
          { x: 600, y: 50, w: 500, h: 500 },
          { x: 1150, y: 50, w: 500, h: 500 },
      ]
  }
};

export const FILTERS: { id: FilterType; name: string; css: string }[] = [
    { id: 'normal', name: 'Normal', css: 'none' },
    { id: 'grayscale', name: 'B&W', css: 'grayscale(100%) contrast(1.1)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(80%) contrast(1.1)' },
    { id: 'vivid', name: 'Vivid', css: 'saturate(1.5) contrast(1.1)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(1.2) brightness(0.9) saturate(0.8)' },
    { id: 'dreamy', name: 'Dreamy', css: 'blur(0.5px) saturate(1.2) brightness(1.1)' },
];

export const FONTS = [
  'Quicksand', 'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Palatino Linotype', 'Lucida Console'
];
